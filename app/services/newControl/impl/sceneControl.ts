import {ISceneControl} from "../interfaces/sceneControl";
import {ControlPlayer, PlayersWinRate, Scene, SceneControlInfo} from "..";
import SceneControlDAO from "../DAO/sceneControlDAO";
import {getLogger} from "pinus-logger";
import {ControlState} from "../constants";
import {random} from "../../../utils";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {pinus} from "pinus";


/**
 * @property players 玩家
 * @property sceneControl 场控玩家
 * @property pool 奖池
 */
interface GetControlStateParams{
    sceneControl: SceneControlInfo;
    players?: ControlPlayer[];
    pool?: any,
}

/**
 * 游戏场控实现
 * @property nid  游戏nid
 * @property sceneId  游戏场id
 * @property gameName  游戏名字
 * @property sceneName  场名字
 * @property bankerKill 是否庄杀
 * @property bankerKillProbability  庄杀-100 <-> 100 默认0
 * @property weights  权重值
 * @property bankerGame  有庄游戏
 * @property lockPool 是否锁定奖池
 */
export class SceneControl implements ISceneControl {
    static logger =  getLogger('server_out', __filename);
    static DAO: SceneControlDAO = SceneControlDAO.getInstance();
    nid: string;
    sceneId: number;
    gameName: string;
    sceneName: string;
    serverName: string = '';
    bankerGame: boolean;
    bankerKillProbability: number = 0;
    weights: number = 0;
    baseSystemWinRate: number = 0.5;
    lockPool: boolean = false;

    constructor(scene: Scene,
                gameName: string,
                bankerGame: boolean,
                serverName: string) {
        this.nid = scene.nid;
        this.sceneId = scene.id;
        this.sceneName = scene.name;
        this.gameName = gameName;
        this.bankerGame = bankerGame;
        this.serverName = serverName;
    }

    /**
     * 初始化
     */
    async init() {
        const data = await SceneControl.DAO.findOne({nid: this.nid, sceneId: this.sceneId});

        if (data) {
            this.lockPool = data.lockPool;
            this.baseSystemWinRate = data.baseSystemWinRate;
            this.bankerKillProbability = data.bankerKillProbability;
            this.weights = data.weights;

            return SceneControl.DAO.initCache(this.nid);
        }

        // 获取初始化的
        const serverId = pinus.app.getServerId();
        const servers = pinus.app.getServersByType(this.serverName);

        // 由第一个负责初始化
        if (serverId === servers[0].id) {
            return SceneControl.DAO.create({
                nid: this.nid,
                sceneId: this.sceneId,
                gameName: this.gameName,
                sceneName: this.sceneName,
                baseSystemWinRate: this.baseSystemWinRate,
                bankerKillProbability: this.bankerKillProbability,
                weights: this.weights,
                bankerGame: this.bankerGame,
                lockPool: this.lockPool,
            });
        }
    }

    /**
     * 玩家黑名单对应config配置
     */
    blacklistConfig: Map<number, number> = new Map([
        [0, 1],
        [1, 1.25],
        [2, 1.5],
        [3, 2]
    ]);

    /**
     * 获取当前场的调控信息
     */
    getSceneControl(): Promise<any> {
        return SceneControl.DAO.findOne({nid: this.nid, sceneId: this.sceneId});
    }

    /**
     * 获取调控状态 此方法只针对 百人类游戏以及slot游戏
     * @param sceneControl 场控信息
     * @param players 参与游戏玩家
     * @param pool 参与游戏玩家
     */
    async getSlotAndBRGameControlState({sceneControl, players, pool}: GetControlStateParams): Promise<ControlState> {
        // 如果未获取到数据则返回不调控
        if (!sceneControl) {
            return ControlState.NONE;
        }

        // 如果奖池已经被锁定则使用设定的场控值
        const correctedValue = sceneControl.lockPool ? convertCorrectedValue(sceneControl.weights) : pool.correctedValue;
        // 获取系统胜率
        const systemWinRate: number = this.getSystemWin(sceneControl, correctedValue, players);

        return calculateControlState(systemWinRate);
    }

    /**
     * 获取系统胜率
     * @param sceneControlInfo 场控数据
     * @param correctedValue   修正值
     * @param players
     */
    private getSystemWin(sceneControlInfo: SceneControlInfo, correctedValue: number, players) {
        // 房间是否只有一人系统对赌情况
        if (players.length === 1) {
            const blackCorrectedValue = 1;
            return newPlayerALG(sceneControlInfo.baseSystemWinRate, correctedValue, blackCorrectedValue);
        } else {
            return ordinaryControlALG(sceneControlInfo.baseSystemWinRate, correctedValue);
        }
    }



    /**
     * 获取玩家胜率 适用与对战类玩家
     * @param sceneControl 场控信息
     * @param players 玩家列表
     * @param pool 奖池
     * @return uid:   真实玩家uid
     * @return winRate: 真实玩家的胜率
     */
    async getPlayersWinRate({sceneControl, players, pool}: GetControlStateParams): Promise<PlayersWinRate[]> {
        let weights = 0;

        if (sceneControl) {
            weights = sceneControl.weights;
        }

        // 如果奖池已经被锁定则使用设定的场控值
        const correctedValue = sceneControl.lockPool ? convertCorrectedValue(weights) : pool.correctedValue;

        const realPlayer = players.filter(player => player.isRobot === 0),
            realPlayerCount = realPlayer.length,
            baseWinRate = 1 / players.length;

        return realPlayer.map(player => {
            let winRate: number;

            // 如果真实玩家只有一个
            if (realPlayerCount === 1) {
                winRate = ordinaryPlayerControlALG(baseWinRate, correctedValue, 1);
            } else {
                winRate = playerControlALG(baseWinRate, correctedValue);
            }

            return {uid: player.uid, winRate};
        });
    }

    /**
     * 是否庄杀
     * @param sceneControlInfo
     */
    bankerKill(sceneControlInfo: SceneControlInfo): boolean {
        if (sceneControlInfo.bankerKillProbability > 0) {
            return random(0,100, 0) < sceneControlInfo.bankerKillProbability;
        }
        return false;
    }

    /**
     * 设置锁定奖池
     * @param nid
     * @param sceneId
     * @param lock
     */
    static async lockPool(nid: GameNidEnum, sceneId: number, lock: boolean): Promise<boolean> {
        if (!nid || typeof sceneId !== 'number' || typeof lock !== 'boolean') {
            throw new Error(`参数不合法`);
        }

        // 先更新数据库
        await this.DAO.updateOne({nid, sceneId}, {lockPool: lock});

        // 再更新缓存
        await this.DAO.removeOutOfCache({nid, sceneId});

        return true;
    }

    /**
     * 设置庄杀
     * @param nid 游戏nid
     * @param sceneId 场id
     * @param bankerKill 是否装杀
     * @param bankerKillProbability 庄杀概率
     */
    static async setBankerKill({nid, sceneId,  bankerKillProbability}: {
        nid: GameNidEnum,
        sceneId: number,
        bankerKillProbability: number
    }): Promise<void> {
        if (bankerKillProbability > 100 || bankerKillProbability < 0) {
            throw new Error(`参数不正确 取值范围应为 0 - 100`);
        }

        await this.DAO.updateOne({nid, sceneId}, {bankerKillProbability});
        // 再更新缓存
        await this.DAO.removeOutOfCache({nid, sceneId});
    }

    /**
     * 设置场控权重
     * @param scene
     * @param weights 权重值
     */
    static async setSceneControlWeight(scene: Scene, weights: number): Promise<void> {
        const sceneInfo = await this.DAO.findOne({nid: scene.nid, sceneId: scene.id});

        if (!sceneInfo) {
            throw new Error(`未差找到找场控信息 传入输入游戏id: ${scene.nid} 场id ${scene.id}`);
        }

        if (!sceneInfo.lockPool) {
            throw new Error(`未锁定奖池无法更改场控权重`);
        }

        if (weights > 100 || weights < -100) {
            throw new Error(`权重值设置错误 取值范围为 -100 - 100`);
        }

        await this.DAO.updateOne({nid: scene.nid, sceneId: scene.id}, {weights: weights});

        await this.DAO.removeOutOfCache({nid: scene.nid, sceneId: scene.id});
    }

    /**
     * 获取所有场控数据
     */
    static async getAllSceneControl() {
        return this.DAO.findDB({}, '-_id -updateTime -createTime -bankerGame -baseSystemWinRate');
    }

    /**
     * 获取单个游戏的所有场控数据
     * @param nid
     */
    static getOneGameSceneControl(nid: GameNidEnum) {
        return this.DAO.findDB({nid}, '-_id -updateTime -createTime -bankerGame -baseSystemWinRate');
    }

    /**
     * 获取场控信息
     * @param nid 游戏nid
     * @param sceneId 场控
     */
    static getOneSceneControlInfo(nid: GameNidEnum, sceneId: number): Promise<SceneControlInfo> {
        return this.DAO.findOne({nid, sceneId});
    }

    /**
     * 获取单个场的权重值
     * @param nid
     * @param sceneId
     */
    static async getOneSceneWight(nid: string, sceneId: number) {
        const sceneInfo = await this.DAO.findOne({nid, sceneId});

        return sceneInfo ? {
            weights: sceneInfo.weights,
            sceneId: sceneInfo.sceneId
        } : undefined;
    }
}


/**
 * 场控权重值
 * @param sceneWeight
 */
function convertCorrectedValue(sceneWeight: number) {
    return (sceneWeight + 100) / 100;
}

/**
 * 玩家胜利计算
 * @param baseWinRate               基础值赔率
 * @param bonusPoolCorrectedValue   奖池修正值
 * @param blackCorrectedValue       黑名单修正值
 * @param personalCorrectedValue    玩家库存值
 * @param correctedValue            修正系数
 */
function ordinaryPlayerControlALG(baseWinRate: number, bonusPoolCorrectedValue: number,
    blackCorrectedValue: number, personalCorrectedValue = 1, correctedValue = 2): number {
    return baseWinRate *
        Math.abs(correctedValue - bonusPoolCorrectedValue) *
        Math.abs(correctedValue - blackCorrectedValue) *
        Math.abs(personalCorrectedValue - correctedValue);
}

/**
 * 棋牌对战类游戏精控算法
 * @param baseWinRate               基础值赔率
 * @param bonusPoolCorrectedValue   奖池修正值
 * @param correctedValue            修正系数
 */
function playerControlALG(baseWinRate: number, bonusPoolCorrectedValue: number,
                          correctedValue = 2): number {
    return baseWinRate * Math.abs(correctedValue - bonusPoolCorrectedValue);
}

/**
 * 普通调控算法
 * @param baseWinRate              基础值赔率
 * @param bonusPoolCorrectedValue  奖池修正值
 * @param correctedValue           修正值
 */
function ordinaryControlALG(baseWinRate: number, bonusPoolCorrectedValue: number,
                            correctedValue = 1): number {
    return bonusPoolCorrectedValue - correctedValue;
}

/**
 * 新手调控算法
 * @param baseWinRate               基础值赔率
 * @param bonusPoolCorrectedValue   奖池修正值
 * @param blackCorrectedValue       黑名单修正值
 * @param personalCorrectedValue    个人库存修正值 暂时没有默认为100%
 * @param correctedValue
 */
function newPlayerALG(baseWinRate: number, bonusPoolCorrectedValue: number,
                      blackCorrectedValue: number, personalCorrectedValue = 1, correctedValue = 1): number {
    return bonusPoolCorrectedValue * blackCorrectedValue * personalCorrectedValue - correctedValue;
}

/**
 * 根据系统胜率计算调控状态
 * @param systemWinRate
 */
function calculateControlState(systemWinRate: number): ControlState {
    // 如果等于0 不调控
    if (systemWinRate === 0) {
        return ControlState.NONE;
    }

    // 大于零 且随机值小于系统胜率
    if (systemWinRate > 0 && Math.random() < systemWinRate) {
        return ControlState.SYSTEM_WIN;
    }

    // 小于零 且随机值小于系统胜率的绝对值
    if (systemWinRate < 0 && Math.random() < Math.abs(systemWinRate)) {
        return ControlState.PLAYER_WIN;
    }
    return ControlState.NONE;
}