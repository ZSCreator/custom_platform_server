import {buildControlGame, ControlGame} from "./controlGame";
import {getLogger} from "pinus-logger";
import {SheetDTO} from "./controlScene";
import {buildControlState, ControlState} from "./controlState";
import platformControlDao from '../../../common/dao/daoManager/PlatformControl.manager';
import controlStateDao from '../../../common/dao/daoManager/PlatformControlState.manager';
import {PlatformControlType, RecordTypes} from "../constants";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import PlatformControlDao from "../../../common/dao/daoManager/PlatformControl.manager";

const logger = getLogger('server_out', __filename);

/**
 * 构造租户调控实例
 * @param platformId
 * @param tenantId
 */
export function buildTenantControl(platformId: string, tenantId: string) {
    return new TenantControlBase(platformId, tenantId);
}

/**
 * 租户
 */
export class TenantControlBase {
    /** 平台号 */
    platformId: string;
    /** 租户号 */
    tenantId: string;
    gameList: ControlGame[] = [];
    gameMap: Map<string, ControlGame> = new Map();
    controlState: ControlState;

    /** 租户结果 */
    result: any;

    /** 最后改变时间 */
    dateChanged: number;

    constructor(platformId: string, tenantId: string) {
        this.platformId = platformId;
        this.tenantId = tenantId;
        this.dateChanged = Date.now();
    }

    /**
     * 初始化一个租户
     */
    async init() {
        // 查看这个租户是否有租户调控状态
        const result = await controlStateDao.findOne(
            {platformId: this.platformId, type: PlatformControlType.TENANT, tenantId: this.tenantId});

        if (result) {
            this.controlState = buildControlState(result, PlatformControlType.TENANT);
            // 这个月的打码 和 系统收益
            const monthBill = await platformControlDao.getMonthlyGameBill(
                {platformId: this.platformId, tenantId: this.tenantId, type: RecordTypes.TENANT_SCENE});
            this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
        }
    }

    /**
     * 如果租户两小时没有更新则删除
     */
    needRemove() {
        return Date.now() - this.dateChanged > 1000 * 60 * 60 * 2;
    }

    /**
     * 获取调控状态
     * @param nid
     */
    getControlState(nid: string) {
        const game = this.gameMap.get(nid);

        if (!game) {
            console.warn(`未初始化该游戏 nid: ${nid} ${typeof nid}`)
            return this.controlState;
        }

        if (game.controlState) {
            return game.controlState;
        }

        return this.controlState;
    }


    /**
     * 定时初始化
     */
    async timingInitial() {
        await Promise.all(this.gameList.map(g => g.timingInitial()));
    }

    /**
     * 月初初始化
     */
    beginningMonthInit() {
        if (this.controlState) {
            this.controlState.init(0, 0);
        }

        this.gameList.forEach(g => g.beginningMonthInit());
    }

    /**
     * 更新
     */
    async updateToDB() {
        return Promise.all(this.gameList.map(g => g.updateToDB()));
    }

    /**
     * 添加一个游戏场
     * @param nid 游戏id
     * @param sceneId 场id
     */
    async addGameScene(nid: GameNidEnum, sceneId: number) {
        let controlGame = this.gameMap.get(nid);
        
        if (!controlGame) {
            controlGame = buildControlGame(this.platformId, this.tenantId, nid);
            this.gameList.push(controlGame);
            this.gameMap.set(nid, controlGame);
            this.gameList.sort((x, y) => parseInt(x.nid) - parseInt(y.nid));
        }

        await controlGame.initScene(sceneId);
    }

    // 数据改变接口
    change(sheet: SheetDTO) {
        this.dateChanged = Date.now();
        const controlGame = this.gameMap.get(sheet.nid);

        if (!controlGame) {
            logger.warn(`tenantControlBase 未找到游戏 nid ${sheet.nid}`);
            return;
        }

        controlGame.change(sheet);

        if (this.controlState) {
            this.controlState.change(sheet.betGold, sheet.profit);
        }
    }

    /**
     * 添加 平台调控
     * @param killRate
     * @param nid
     */
    async changeControlKillRate(killRate: number, nid?: GameNidEnum): Promise<{success: boolean, killRate?: number}> {
        if (nid) {
            // 查找是否已经添加游戏调控
            let controlGame = this.gameMap.get(nid);

            if (!controlGame) {
                controlGame = buildControlGame(this.platformId, this.tenantId, nid);
            }

            await controlGame.addControlGame(killRate);
            return {success: true, killRate};
        }

        // 如果已经创建则直接修改
        if (this.controlState) {
            await this.controlState.changeKillRate(killRate);
            return {success: true, killRate};
        }

        // 没有则创建
        this.controlState = buildControlState(
            {platformId: this.platformId, tenantId: this.tenantId, killRate: killRate / 100},
            PlatformControlType.TENANT);

        // 这个月的打码 和 系统收益
        const monthBill = await PlatformControlDao.getMonthlyGameBill(
            {platformId: this.platformId, type: RecordTypes.SCENE, tenantId: ''});

        this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
        await this.controlState.createToDB();

        return {success: true, killRate};
    }
}