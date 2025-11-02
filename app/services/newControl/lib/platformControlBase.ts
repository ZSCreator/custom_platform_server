import {buildControlGame, ControlGame,} from "./controlGame";
import {summaryList} from './utils';
import GameManager from "../../../common/dao/daoManager/Game.manager";
import {getLogger} from "pinus-logger";
import {SheetDTO} from "./controlScene";
import {buildControlState, ControlState} from "./controlState";
import PlatformControlDao from '../../../common/dao/daoManager/PlatformControl.manager';
import PlatformControlStateDao from '../../../common/dao/daoManager/PlatformControlState.manager';
import {PlatformControlType, RecordTypes} from "../constants";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {buildTenantControl, TenantControlBase} from "./tenantControlBase";


const logger = getLogger('server_out', __filename);

/**
 * 平台
 */
export class PlatformControlBase {
    /** 平台号 */
    platformId: string;
    /** 游戏列表 */
    gameList: ControlGame[] = [];
    /** 平台游戏map */
    gameMap: Map<string, ControlGame> = new Map();
    /** 平台调控的状态 */
    platformControlState: ControlState;
    /** 租户表 */
    tenantMap:Map<string, TenantControlBase> = new Map();

    /** 平台结果 */
    result: any;

    constructor(platformId: string) {
        this.platformId = platformId;
    }

    /**
     * 初始化一个平台 在后台添加一个新平台的时候
     */
    async initPlatform() {
        // 获取所有游戏
        const games = await GameManager.findList({}, true);
        await Promise.all(games.map(g => this.addGame(g.nid)));

        // 查看这个平台是否有平台调控状态
        const result = await PlatformControlStateDao.findOne({platformId: this.platformId, type: PlatformControlType.PLATFORM});

        if (result) {
            this.platformControlState = buildControlState(result, PlatformControlType.PLATFORM);
            // 这个月的打码 和 系统收益
            const monthBill = await PlatformControlDao.getMonthlyGameBill(
                {platformId: this.platformId, type: RecordTypes.SCENE, tenantId: ''});
            this.platformControlState.init(monthBill.betGoldAmount, monthBill.profit);
        }
    }

    /**
     * 添加一个租户调控场
     * @param tenantId 租户id
     * @param nid 游戏id
     * @param sceneId 场id
     */
    async addTenantControl(tenantId: string, nid: GameNidEnum, sceneId: number) {
        let tenantControl = this.tenantMap.get(tenantId);

        if (!tenantControl) {
            tenantControl = buildTenantControl(this.platformId, tenantId);

            // 租户调控初始化
            await tenantControl.init();

            // 放到租户表里面
            this.tenantMap.set(tenantId, tenantControl);
        }
        
        await tenantControl.addGameScene(nid, sceneId);
    }

    /**
     * 添加一个租户调控场
     * @param tenantId 租户id
     * @param nid 游戏id
     * @param killRate 杀率
     */
    async changeTenantControlKillRate(tenantId: string, killRate: number, nid?: GameNidEnum) {
        let tenantControl = this.tenantMap.get(tenantId);

        if (!tenantControl) {
            tenantControl = buildTenantControl(this.platformId, tenantId);

            // 租户调控初始化
            await tenantControl.init();

            // 放到租户表里面
            this.tenantMap.set(tenantId, tenantControl);
        }

        return await tenantControl.changeControlKillRate(killRate, nid);
    }

    /**
     * 移除租户调控
     */
    async removeTenantControl() {
        const values = this.tenantMap.values();
        for (let tenantControl of values) {
            if (tenantControl.needRemove()) {
                this.tenantMap.delete(tenantControl.tenantId);
                // 保存数据
                await tenantControl.updateToDB();
            }
        }
    }

    /**
     * 获取调控状态
     * @param nid
     * @param tenantId 租户id
     */
    getControlState(tenantId: string, nid: string) {
        const tenant = this.tenantMap.get(tenantId);

        if (tenant) {
            const controlState = tenant.getControlState(nid);

            if (controlState) {
                return controlState;
            }
        }

        const game = this.gameMap.get(nid);

        if (!game) {
            console.warn(`未初始化该游戏 nid: ${nid} ${typeof nid}`)
            return this.platformControlState;
        }

        if (game.controlState) {
            return game.controlState;
        }

        return this.platformControlState;
    }

    /**
     * 获取平台或者游戏杀率
     * @param nid
     */
    getKillRateConfig(nid?: string): number | null {
        if (!!nid) {
            const game = this.gameMap.get(nid);

            if (!game) {
                return null;
            }

            return game.getKillRateConfig();
        }

        return !!this.platformControlState ? this.platformControlState.getKillRate() : null;
    }


    /**
     * 添加 平台调控
     * @param killRate
     * @param nid
     */
    async addPlatformControl(killRate: number, nid?: string): Promise<{success: boolean, killRate?: number}> {
        if (nid) {
            // 查找是否已经添加游戏调控
            const platformControlGame = this.gameMap.get(nid);

            if (!platformControlGame) {
                console.warn('没有游戏平台');
                return {success: false};
            }

            await platformControlGame.addControlGame(killRate);

            return {success: true, killRate};
        }

        // 如果已经创建则直接修改
        if (this.platformControlState) {
            await this.platformControlState.changeKillRate(killRate);
            return {success: true, killRate};
        }

        // 没有则创建
        this.platformControlState = new ControlState({platformId: this.platformId, killRate: killRate / 100},
            PlatformControlType.PLATFORM);

        // 这个月的打码 和 系统收益
        const monthBill = await PlatformControlDao.getMonthlyGameBill(
            {platformId: this.platformId, type: RecordTypes.SCENE, tenantId: ''});

        this.platformControlState.init(monthBill.betGoldAmount, monthBill.profit);
        await this.platformControlState.createToDB();

        return {success: true, killRate};
    }

    /**
     * 定时初始化
     */
    async timingInitial() {
        await Promise.all(this.gameList.map(g => g.timingInitial()));
        await Promise.all([...this.tenantMap.values()].map(g => g.timingInitial()));
    }

    /**
     * 月初初始化
     */
    beginningMonthInit() {
        if (this.platformControlState) {
            this.platformControlState.init(0, 0);
        }

        this.gameList.forEach(g => g.beginningMonthInit());

        [...this.tenantMap.values()].forEach(tenant => tenant.beginningMonthInit());
    }

    /**
     * 更新
     */
    async updateToDB() {
        // 平台游戏保存
        await Promise.all(this.gameList.map(g => g.updateToDB()));
        // 租户数据保存
        await Promise.all([...this.tenantMap.values()].map(tenant => tenant.updateToDB()));
    }

    /**
     * 添加一个游戏
     * @param nid
     */
    async addGame(nid: GameNidEnum) {
        const platformControlGame = buildControlGame(this.platformId, '', nid);
        await platformControlGame.init();

        this.gameList.push(platformControlGame);
        this.gameMap.set(nid, platformControlGame);
        this.gameList.sort((x, y) => parseInt(x.nid) - parseInt(y.nid));
    }

    // 数据改变接口
    change(sheet: SheetDTO) {
        const platformControlGame = this.gameMap.get(sheet.nid);

        if (!platformControlGame) {
            logger.warn(`PlatformControlBase 未找到游戏 nid ${sheet.nid}`);
            return;
        }

        platformControlGame.change(sheet);

        if (this.platformControlState) {
            this.platformControlState.change(sheet.betGold, sheet.profit);
        }

        const tenant = this.tenantMap.get(sheet.groupRemark);

        if (tenant) {
            tenant.change(sheet);
        }
    }

    /**
     * 获取平台数据
     */
    getData(backend = false) {
        const data = this.gameList.map(g => g.summary(backend));

        return {
            platform: this.platformId,
            games: data,
            comprehensive: summaryList([...(data.map(c => c.comprehensive))]),
            killRateConfig: this.getKillRateConfig(),
        }
    }
}