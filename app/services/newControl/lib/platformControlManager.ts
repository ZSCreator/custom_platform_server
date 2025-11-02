import {PlatformControlBase} from "./platformControlBase";
import platformAgentRedis from '../../../common/dao/redis/PlatformNameAgentList.redis.dao'
import {summaryList} from "./utils";
import {ControlState, ControlTypes, RecordTypes} from "../constants";
import {SheetDTO} from "./controlScene";
import { getLogger, Logger } from 'pinus-logger';
import {scheduleJob} from 'node-schedule';
import PlatformControlDao from '../../../common/dao/daoManager/PlatformControl.manager';
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export class PlatformControlManager {
    private _id: number;

    platformMap: Map<string, PlatformControlBase> = new Map();
    platformDataMap: Map<string, {time: number, result: any}> = new Map();
    result: any;
    timer: NodeJS.Timer;
    logger: Logger = getLogger('server_out', __filename);
    dateLastUpdated: number = Date.now();
    dateChanged: number = Date.now();

    async init() {
        const now = Date.now();
        this.dateLastUpdated = now;
        this.dateChanged = now;

        // 获取平台列表
        const platformList: {platformName: string, platformUid: string}[] =
            await platformAgentRedis.findAllPlatformUidList(true);

        await Promise.all(platformList.map(platform => {
            return  this.addPlatform(platform.platformUid);
        }));

        // 统计结果
        await this.initAllPlatforms();

        // 开始定时更新
        this.initTimer();
    }

    /**
     * 初始化定时器
     */
    initTimer() {
        this.timer = setInterval(async () => {
            await Promise.all([...this.platformMap.values()].map(async p => {
                await p.updateToDB();
                return p.removeTenantControl();
            }));

            if (this.dateLastUpdated < this.dateChanged) {
                await this.updateDataToDB();
            }

        }, 60 * 1000 * 5);

        scheduleJob('00 00 * * *', async () => {
            this.logger.warn('初始化平台数据表 建立以天为单位的新场数据 ');
            await Promise.all([...this.platformMap.values()].map(p => p.timingInitial()));

            // 清理所有没有统计数据的表
            await PlatformControlDao.deleteGoldEqualsZero();
        });

        scheduleJob('00 00 1 * *', async () => {
            console.warn('初始化平台数据 建立以月为单位的汇总数据 ');
            this.initSummaryData();
            await this.createDataToDB();

            // 初始化 各个平台的杀率累计
            this.initPlatformControlStateData();
        });
    }

    /**
     * 保存
     */
    async saveAll() {
        await Promise.all([...this.platformMap.values()].map(p => p.updateToDB()));
        await this.updateDataToDB();
    }

    /**
     * 添加一个平台
     * @param platformId
     */
    async addPlatform(platformId: string) {
        const platform = new PlatformControlBase(platformId);
        await platform.initPlatform();

        this.platformMap.set(platformId, platform);
    }

    /**
     * 获取一个平台数据今日数据
     * @param platformId
     * @param backend 是否是后台要数据
     */
    getPlatformData(platformId: string, backend: boolean) {
        if (!this.platformMap.has(platformId)) {
            return null;
        }

        const platformData = this.platformDataMap.get(platformId);

        if (!platformData || (Date.now() - platformData.time > 20000)) {
            return this.statisticsOnPlatformData(platformId, backend);
        }

        return platformData.result;
    }

    /**
     * 添加租户场
     * @param platformId 平台id
     * @param tenantId 租户id
     * @param nid 游戏id
     * @param sceneId 场id
     */
    async addTenantGameScene(platformId: string, tenantId: string, nid: GameNidEnum, sceneId: number) {
        const platform = this.platformMap.get(platformId);

        if (!platform) {
            return;
        }

        await platform.addTenantControl(tenantId, nid, sceneId);
    }

    /**
     * 添加平台调控
     * @param platformId
     * @param killRate
     * @param nid
     */
    async addPlatformControl(platformId: string, killRate: number, nid?: string) {
        const platform = this.platformMap.get(platformId);

        if (!platform) {
            console.warn('没有该平台');
            return {success: false};
        }

        this.platformDataMap.delete(platformId);

        return await platform.addPlatformControl(killRate, nid);
    }

    /**
     * 添加租户调控
     * @param platformId 平台id
     * @param tenantId 租户id
     * @param killRate
     * @param nid
     */
    async addTenantControl(platformId: string, tenantId: string, killRate: number, nid?: GameNidEnum) {
        const platform = this.platformMap.get(platformId);

        if (!platform) {
            console.warn('没有该平台');
            return {success: false};
        }

        return await platform.changeTenantControlKillRate(tenantId, killRate, nid);
    }

    /**
     * 判断是否需要调控
     * @param platformId
     * @param tenantId 租户id
     * @param nid
     * @param betGold
     */
    needKill(platformId: string, tenantId: string, nid: string, betGold: number): ControlState {
        const platform = this.platformMap.get(platformId);

        if (!platform) {
            return ControlState.NONE;
        }

        const controlState = platform.getControlState(tenantId, nid);

        if (!controlState) {
            return ControlState.NONE;
        }

        return controlState.needKill(betGold);
    }

    /**
     * 统计并返回一个平台数据
     */
    statisticsOnPlatformData(platformId: string, backend: boolean) {
        const platform = this.platformMap.get(platformId);

        if (!platform) {
            return null;
        }

        const result = platform.getData(backend);

        result.games.map(g => {
            g.comprehensive.betPlayersSet = (g.comprehensive.betPlayersSet as any).length;
            // Reflect.deleteProperty(g, 'details');
        });

        this.platformDataMap.set(platformId, {time: Date.now(), result});

        return result;
    }

    /**
     * 有个订单
     * @param sheet
     */
    change(sheet: SheetDTO) {
        // 根据租户号查找id
        let platform = this.platformMap.get(sheet.platformId);

        if (!platform) {
            this.logger.warn(`平台统计异常, 未初始化到该平台数据 平台号: ${sheet.platformId}`);
            return;
        }

        platform.change(sheet);
        this.statisticsForAllPlatforms(sheet);
    }

    getData(backend: boolean = false) {
        return {
            betGoldAmount: this.result.betGoldAmount,
            profit: this.result.profit,
            betPlayersSet: backend ? this.result.betPlayersSet.size : [...this.result.betPlayersSet.values()],
            playerWinCount: this.result.playerWinCount,
            systemWinCount: this.result.systemWinCount,
            equalityCount: this.result.equalityCount,
            systemWinRate: this.result.systemWinRate,
            killRate: this.result.killRate,
            controlWinCount: this.result.controlWinCount,
            controlLossCount: this.result.controlLossCount,
            controlEquality: this.result.controlEquality,
            betRoundCount: this.result.betRoundCount,
            serviceCharge: this.result.serviceCharge,
            controlStateStatistical: this.result.controlStateStatistical,
            type: RecordTypes.ALL,
        };
    }

    /**
     * 更新到数据库
     */
    async updateDataToDB() {
        await PlatformControlDao.updateSummaryData(this._id, this.getData());
        this.dateLastUpdated = Date.now();
    }

    /**
     * 创建数据到数据库
     */
    async createDataToDB() {
        // 创建平台数据
        const results = await PlatformControlDao.createOne(this.getData());
        this._id = results.id;

        this.dateLastUpdated = Date.now();
    }

    /**
     * 获取平台杀率配置
     * @param platformId
     * @param nid 游戏nid
     */
    getPlatformKillRateConfig(platformId: string, nid?: string) {
        const platform = this.platformMap.get(platformId);

        if (!platform) {
            return null;
        }

        return platform.getKillRateConfig(nid);
    }

    /**
     * 初始化平台的调控状态
     * @private
     */
    private initPlatformControlStateData() {
        [...this.platformMap.values()].forEach(p => p.beginningMonthInit());
    }

    private initSummaryData() {
        this.result.betGoldAmount = 0;
        this.result.profit = 0;
        this.result.betPlayersSet.clear();
        this.result.playerWinCount = 0;
        this.result.systemWinRate = 0;
        this.result.systemWinCount = 0;
        this.result.killRate = 0;
        this.result.controlWinCount = 0;
        this.result.controlLossCount = 0;
        this.result.controlEquality = 0;
        this.result.betRoundCount = 0;
        this.result.serviceCharge = 0;
        this.result.equalityCount = 0;

        this.result.controlStateStatistical = {
            [ControlTypes.platformControlWin]: 0,
            [ControlTypes.platformControlLoss]: 0,
            [ControlTypes.sceneControlWin]: 0,
            [ControlTypes.sceneControlLoss]: 0,
            [ControlTypes.personalControlWin]: 0,
            [ControlTypes.personalControlLoss]: 0,
            [ControlTypes.none]: 0
        };
    }


    /**
     * 初始化平台数据
     * @private
     */
    private async initAllPlatforms() {
        const date = new Date();
        // 查找总平台数据
        const result = await PlatformControlDao.getTotalPlatformDuringTheMonth(date.getMonth());

        if (!result) {
            this.result = summaryList([...this.platformMap.values()].map(c => c.getData().comprehensive));
            const betPlayersSet = new Set();
            this.result.betPlayersSet.forEach(uid => betPlayersSet.add(uid));
            this.result.betPlayersSet = betPlayersSet;

            // 创建平台数据
            await this.createDataToDB();
            return;
        }

        this._id = result.id;
        const betPlayersSet = new Set();
        result.betPlayersSet.forEach(uid => betPlayersSet.add(uid));
        result.betPlayersSet = betPlayersSet;
        this.result = result;
    }

    /**
     * 统计汇总数据
     */
    private statisticsForAllPlatforms(sheet: SheetDTO) {
        this.result.betRoundCount++;
        this.result.betPlayersSet.add(sheet.uid);
        this.result.profit -= sheet.profit;
        this.result.betGoldAmount += sheet.betGold;
        this.result.serviceCharge += sheet.serviceCharge;

        if (sheet.profit > 0) {
            this.result.playerWinCount++;
        } else if (sheet.profit < 0) {
            this.result.systemWinCount++;
        } else {
            this.result.equalityCount++;
        }

        if (sheet.controlType !== ControlTypes.none) {
            if (sheet.profit > 0) {
                this.result.controlWinCount++;
            } else if (sheet.profit < 0) {
                this.result.controlLossCount++;
            } else {
                this.result.controlEquality++;
            }

            this.result.controlStateStatistical[sheet.controlType]++;
        } else {
            this.result.controlStateStatistical[sheet.controlType]++;
        }

        this.result.killRate = this.result.profit / this.result.betGoldAmount;
        this.result.systemWinRate = this.result.systemWinCount / this.result.betRoundCount;

        this.dateChanged = Date.now();
    }
}

export default new PlatformControlManager();