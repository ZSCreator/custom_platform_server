import {GetControlInfoParams, IGameControlService} from "./spi/IGameControlService";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {PersonalControl} from "./impl/personalControl";
import {SceneControl} from "./impl/sceneControl";
import {get as getConfig} from "../../../config/data/JsonMgr";
import {pinus,} from "pinus";
import {ControlPlayer, ControlResult} from "./interfaces/simple";
import {randomFromRange} from "../../utils/lottery/commonUtil";
import {getLogger, Logger} from "pinus-logger";
import GameManagerDao from "../../common/dao/daoManager/Game.manager";
import TenantControlManager from "../../common/dao/daoManager/TenantControl.manager";
import {TotalPersonalControl} from "./impl/totalPersonalControl";
import {Player} from "../../common/dao/mysql/entity/Player.entity";
import {SheetDTO} from "./lib/controlScene";
import {ControlState} from "./constants";

function randomServerRpcId() {
    const serverList = pinus.app.getServersByType('control');

    // console.warn('调控服务器列表', serverList, randomFromRange(0, serverList.length - 1));

    return serverList[randomFromRange(0, serverList.length - 1)].id;
}

/**
 * 游戏调控服务
 */
export class GameControlService implements IGameControlService {
    static instance: IGameControlService;

    static getInstance(): IGameControlService {
        if (!this.instance) {
            this.instance = new GameControlService();
        }

        return this.instance;
    }

    nid: GameNidEnum;
    name: string;
    bankerGame: boolean;
    gameName: string;
    logger: Logger = getLogger('server_out', __filename);
    private sceneControlMap: Map<number, SceneControl> = new Map();
    private personalControlMap: Map<number, PersonalControl> = new Map();


    /**
     * 初始化服务
     * @param nid  游戏nid
     * @param bankerGame 有庄游戏
     */
    async init({nid, bankerGame}:
                   { nid: GameNidEnum, bankerGame?: boolean }): Promise<any> {
        this.nid = nid;
        const {name, zname} = await GameManagerDao.findOne({nid: this.nid});
        this.name = name;
        this.bankerGame = bankerGame || false;
        this.gameName = zname;

        // 初始化场控
        await this.initSceneControl();
        // 初始化个控
        await this.initPersonalControl();
    }


    /**
     * 获取调控服务
     * @param sceneId    场id
     * @param players    真实玩家l
     */
    async getControlInfo({sceneId, players}: GetControlInfoParams): Promise<ControlResult> {
        let result: ControlResult = {personalControlPlayers: [], sceneWeights: 0};

        const personalControl = this.personalControlMap.get(sceneId);

        if (!personalControl) {
            this.logger.error(`未找到个控实例 游戏id ${this.nid} 场id: ${sceneId} 场id类型${typeof sceneId} 个控实例字典${this.personalControlMap}`);
            throw new Error('获取调控结果失败');
        }

        // 查看是否有个控玩家
        result.personalControlPlayers = await personalControl.findPersonalControlPlayers(players, {sceneId, nid: this.nid});


        const sceneControl = this.sceneControlMap.get(sceneId);

        // 获取场控信息
        const sceneControlInfo = await sceneControl.getSceneControl();

        // 获取奖池信息
        const pool = await this.getCorrectedValue(sceneControl.sceneId);

        result.sceneWeights = sceneControlInfo.lockPool ? sceneControlInfo.weights : conversionSceneWeight(pool.correctedValue);

        result.sceneControlState = await sceneControl.getSlotAndBRGameControlState({
            sceneControl: sceneControlInfo,
            players,
            pool
        });

        if (result.sceneControlState === ControlState.NONE) {
            result.sceneControlState = ControlState.NONE;
            const {platformId, tenantId} = getPlatformInfoWithLargest(players);
            result.sceneControlState = await this.getPlatformControl(platformId, tenantId, this.nid, 0);
            result.isPlatformControl = true;
        } else {
            result.isPlatformControl = false;
        }


        // 如果是有庄游戏 判断是否庄杀
        if (this.bankerGame) {
            result.bankerKill = sceneControl.bankerKill(sceneControlInfo);
        }

        return result;
    }

    /**
     * 添加盈利池
     * @param sceneId 场id
     * @param amount 改变金额
     */
    async addProfitPoolAmount(sceneId: number, amount: number): Promise<void> {
        await pinus.app.rpc.control.mainRemote.addProfitPoolAmount.toServer(randomServerRpcId(), {
            nid: this.nid,
            sceneId,
            amount
        });
    }

    /**
     * 获取平台调控信息
     * @param platformId 平台id
     * @param tenantId 租户id
     * @param nid
     * @param betGold
     */
    async getPlatformControl(platformId: string, tenantId: string, nid: string, betGold): Promise<ControlState> {
        return await pinus.app.rpc.control.mainRemote.getPlatformControl.toServer(randomServerRpcId(), {
            nid: this.nid,
            tenantId,
            betGold,
            platformId
        });
    }

    /**
     * 改变奖池
     * @param sceneId 场id
     * @param amount 改变金额
     * @param betAmount 下注金币
     * @param changeStatus 改变状态 1 是增加 2是减少
     */
    async changeBonusPoolAmount(sceneId: number, amount: number, betAmount: number, changeStatus: 1 | 2): Promise<void> {
        await pinus.app.rpc.control.mainRemote.changeBonusPoolAmount.toServer(randomServerRpcId(), {
            nid: this.nid,
            sceneId,
            amount,
            betAmount,
            changeStatus
        });
    }

    /**
     * 获取奖池数据
     * @param sceneId
     */
    async getPool(sceneId: number): Promise<any> {
        return pinus.app.rpc.control.mainRemote.getPool.toServer(randomServerRpcId(), {nid: this.nid, sceneId});
    }

    /**
     * 改变调控数据
     * @param sheet
     */
    changeControlData(sheet: SheetDTO) {
        return pinus.app.rpc.control.mainRemote.changeControlData.toServer(randomServerRpcId(), sheet);
    }

    /**
     * 获取奖池修正值
     * @param sceneId
     */
    getCorrectedValue(sceneId: number): Promise<any> {
        return pinus.app.rpc.control.mainRemote.getCorrectedValueAndLockJackpot.toServer(randomServerRpcId(), {
            nid: this.nid,
            sceneId
        });
    }

    /**
     * 初始化场控
     */
    private async initSceneControl() {
        const scenes = getConfig(`scenes/${this.name}`).datas;

        if (!scenes) {
            throw new Error(`${this.name}场调控初始化失败: 为获取到指定游戏的场信息, 游戏id ${this.nid}`);
        }

        await Promise.all(scenes.map(async scene => {
            const sceneControl = new SceneControl(scene, this.gameName, this.bankerGame, this.name);
            await sceneControl.init();

            this.sceneControlMap.set(scene.id, sceneControl);
        }));
    }

    /**
     * 初始化个控
     */
    private async initPersonalControl() {
        const scenes = getConfig(`scenes/${this.name}`).datas;

        if (!scenes) {
            throw new Error(`${this.name}个人调控初始化失败: 为获取到指定游戏的场信息, 游戏id ${this.nid}`);
        }

        await Promise.all(scenes.map(async scene => {
            const personalControl = new PersonalControl(scene, this.gameName, this.name);
            await personalControl.init();
            this.personalControlMap.set(scene.id, personalControl);
        }));
    }
}

/**
 * 获取奖池信息
 * @param sceneId 所属场
 */
export function getPool(sceneId: number): Promise<any> {
    return GameControlService.getInstance().getPool(sceneId);
}

/**
 * 添加盈利池
 * @param sceneId
 * @param amount
 */
export function addProfitPoolAmount(sceneId: number, amount: number): Promise<any> {
    return GameControlService.getInstance().addProfitPoolAmount(sceneId, amount);
}

/**
 * 改变奖池
 * @param sceneId 场id
 * @param amount 改变金额
 * @param betAmount 下注金币
 * @param changeStatus 改变状态 1 是增加 2是减少
 */
export function changeBonusPoolAmount(sceneId: number, amount: number, betAmount: number, changeStatus: 1 | 2): Promise<any> {
    return GameControlService.getInstance().changeBonusPoolAmount(sceneId, amount, betAmount, changeStatus);
}

/**
 * 改变调控数据
 * @param sheet
 */
export function changeControlData(sheet: SheetDTO) {
    return GameControlService.getInstance().changeControlData(sheet);
}

/**
 * 改变奖池配置
 * @param scene 所属奖池
 * @param changeParam 改变参数
 */
export function changePoolConfig(scene: { nid: string, sceneId: number, }, changeParam: any): Promise<boolean>{
    return pinus.app.rpc.control.mainRemote.changePoolConfig.toServer(randomServerRpcId(), scene, changeParam);
}



/**
 * 玩家判断玩家是否满足币
 * @param player 玩家
 */
export async function changePlayerKillControl(player: Player) {
    // 如果玩家返奖率大于设定的则 必杀
    const profit = player.addDayTixian + player.gold - player.addDayRmb;
    if (profit > 0)  {
        const awardKill = await TenantControlManager.findAwardKillByTenantId(player.groupRemark);

        if (!!awardKill && awardKill.returnAwardRate < (profit / player.addDayRmb)) {
            return TotalPersonalControl.addPlayer({
                uid: player.uid,
                probability: 100,
                killCondition: 0,
                remark: '返奖率超过租户返奖率',
                managerId: 'system',
            })
        }
    }

    // 如果打码大于带入设定的n倍 必杀
    if (player.dailyFlow > player.addDayRmb) {
        const totalKill = await TenantControlManager.findTotalBetKillByTenantId(player.groupRemark);

        if (!!totalKill && totalKill.totalBet < (player.dailyFlow / player.addDayRmb)) {
            return TotalPersonalControl.addPlayer({
                uid: player.uid,
                probability: 100,
                killCondition: 0,
                remark: '打码超过租户打码设定',
                managerId: 'system',
            })
        }
    }
}

/**
 * 转换
 */
function conversionSceneWeight(value: number) {
    return value * 100 - 100;
}

/**
 * 获取最多人的平台号和租户号
 * @param players
 */
function getPlatformInfoWithLargest(players: ControlPlayer[]): {platformId: string, tenantId: string} {
    const sta = {};
    let platformId, tenantId;

    players.forEach(p => {
        if (!sta[p.platformId]) {
            sta[p.platformId] = 0;
        }

        sta[p.platformId] += 1;

        if (!platformId) {
            platformId = p.platformId;
            tenantId = p.groupRemark;
        }

        if (sta[p.platformId] > sta[platformId] && p.platformId !== platformId) {
            platformId = p.platformId;
            tenantId = p.groupRemark;
        }
    });

    return {platformId, tenantId};
}