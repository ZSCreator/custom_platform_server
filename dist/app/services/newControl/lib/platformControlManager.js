"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformControlManager = void 0;
const platformControlBase_1 = require("./platformControlBase");
const PlatformNameAgentList_redis_dao_1 = require("../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const utils_1 = require("./utils");
const constants_1 = require("../constants");
const pinus_logger_1 = require("pinus-logger");
const node_schedule_1 = require("node-schedule");
const PlatformControl_manager_1 = require("../../../common/dao/daoManager/PlatformControl.manager");
class PlatformControlManager {
    constructor() {
        this.platformMap = new Map();
        this.platformDataMap = new Map();
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.dateLastUpdated = Date.now();
        this.dateChanged = Date.now();
    }
    async init() {
        const now = Date.now();
        this.dateLastUpdated = now;
        this.dateChanged = now;
        const platformList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(true);
        await Promise.all(platformList.map(platform => {
            return this.addPlatform(platform.platformUid);
        }));
        await this.initAllPlatforms();
        this.initTimer();
    }
    initTimer() {
        this.timer = setInterval(async () => {
            await Promise.all([...this.platformMap.values()].map(async (p) => {
                await p.updateToDB();
                return p.removeTenantControl();
            }));
            if (this.dateLastUpdated < this.dateChanged) {
                await this.updateDataToDB();
            }
        }, 60 * 1000 * 5);
        (0, node_schedule_1.scheduleJob)('00 00 * * *', async () => {
            this.logger.warn('初始化平台数据表 建立以天为单位的新场数据 ');
            await Promise.all([...this.platformMap.values()].map(p => p.timingInitial()));
            await PlatformControl_manager_1.default.deleteGoldEqualsZero();
        });
        (0, node_schedule_1.scheduleJob)('00 00 1 * *', async () => {
            console.warn('初始化平台数据 建立以月为单位的汇总数据 ');
            this.initSummaryData();
            await this.createDataToDB();
            this.initPlatformControlStateData();
        });
    }
    async saveAll() {
        await Promise.all([...this.platformMap.values()].map(p => p.updateToDB()));
        await this.updateDataToDB();
    }
    async addPlatform(platformId) {
        const platform = new platformControlBase_1.PlatformControlBase(platformId);
        await platform.initPlatform();
        this.platformMap.set(platformId, platform);
    }
    getPlatformData(platformId, backend) {
        if (!this.platformMap.has(platformId)) {
            return null;
        }
        const platformData = this.platformDataMap.get(platformId);
        if (!platformData || (Date.now() - platformData.time > 20000)) {
            return this.statisticsOnPlatformData(platformId, backend);
        }
        return platformData.result;
    }
    async addTenantGameScene(platformId, tenantId, nid, sceneId) {
        const platform = this.platformMap.get(platformId);
        if (!platform) {
            return;
        }
        await platform.addTenantControl(tenantId, nid, sceneId);
    }
    async addPlatformControl(platformId, killRate, nid) {
        const platform = this.platformMap.get(platformId);
        if (!platform) {
            console.warn('没有该平台');
            return { success: false };
        }
        this.platformDataMap.delete(platformId);
        return await platform.addPlatformControl(killRate, nid);
    }
    async addTenantControl(platformId, tenantId, killRate, nid) {
        const platform = this.platformMap.get(platformId);
        if (!platform) {
            console.warn('没有该平台');
            return { success: false };
        }
        return await platform.changeTenantControlKillRate(tenantId, killRate, nid);
    }
    needKill(platformId, tenantId, nid, betGold) {
        const platform = this.platformMap.get(platformId);
        if (!platform) {
            return constants_1.ControlState.NONE;
        }
        const controlState = platform.getControlState(tenantId, nid);
        if (!controlState) {
            return constants_1.ControlState.NONE;
        }
        return controlState.needKill(betGold);
    }
    statisticsOnPlatformData(platformId, backend) {
        const platform = this.platformMap.get(platformId);
        if (!platform) {
            return null;
        }
        const result = platform.getData(backend);
        result.games.map(g => {
            g.comprehensive.betPlayersSet = g.comprehensive.betPlayersSet.length;
        });
        this.platformDataMap.set(platformId, { time: Date.now(), result });
        return result;
    }
    change(sheet) {
        let platform = this.platformMap.get(sheet.platformId);
        if (!platform) {
            this.logger.warn(`平台统计异常, 未初始化到该平台数据 平台号: ${sheet.platformId}`);
            return;
        }
        platform.change(sheet);
        this.statisticsForAllPlatforms(sheet);
    }
    getData(backend = false) {
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
            type: constants_1.RecordTypes.ALL,
        };
    }
    async updateDataToDB() {
        await PlatformControl_manager_1.default.updateSummaryData(this._id, this.getData());
        this.dateLastUpdated = Date.now();
    }
    async createDataToDB() {
        const results = await PlatformControl_manager_1.default.createOne(this.getData());
        this._id = results.id;
        this.dateLastUpdated = Date.now();
    }
    getPlatformKillRateConfig(platformId, nid) {
        const platform = this.platformMap.get(platformId);
        if (!platform) {
            return null;
        }
        return platform.getKillRateConfig(nid);
    }
    initPlatformControlStateData() {
        [...this.platformMap.values()].forEach(p => p.beginningMonthInit());
    }
    initSummaryData() {
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
            [constants_1.ControlTypes.platformControlWin]: 0,
            [constants_1.ControlTypes.platformControlLoss]: 0,
            [constants_1.ControlTypes.sceneControlWin]: 0,
            [constants_1.ControlTypes.sceneControlLoss]: 0,
            [constants_1.ControlTypes.personalControlWin]: 0,
            [constants_1.ControlTypes.personalControlLoss]: 0,
            [constants_1.ControlTypes.none]: 0
        };
    }
    async initAllPlatforms() {
        const date = new Date();
        const result = await PlatformControl_manager_1.default.getTotalPlatformDuringTheMonth(date.getMonth());
        if (!result) {
            this.result = (0, utils_1.summaryList)([...this.platformMap.values()].map(c => c.getData().comprehensive));
            const betPlayersSet = new Set();
            this.result.betPlayersSet.forEach(uid => betPlayersSet.add(uid));
            this.result.betPlayersSet = betPlayersSet;
            await this.createDataToDB();
            return;
        }
        this._id = result.id;
        const betPlayersSet = new Set();
        result.betPlayersSet.forEach(uid => betPlayersSet.add(uid));
        result.betPlayersSet = betPlayersSet;
        this.result = result;
    }
    statisticsForAllPlatforms(sheet) {
        this.result.betRoundCount++;
        this.result.betPlayersSet.add(sheet.uid);
        this.result.profit -= sheet.profit;
        this.result.betGoldAmount += sheet.betGold;
        this.result.serviceCharge += sheet.serviceCharge;
        if (sheet.profit > 0) {
            this.result.playerWinCount++;
        }
        else if (sheet.profit < 0) {
            this.result.systemWinCount++;
        }
        else {
            this.result.equalityCount++;
        }
        if (sheet.controlType !== constants_1.ControlTypes.none) {
            if (sheet.profit > 0) {
                this.result.controlWinCount++;
            }
            else if (sheet.profit < 0) {
                this.result.controlLossCount++;
            }
            else {
                this.result.controlEquality++;
            }
            this.result.controlStateStatistical[sheet.controlType]++;
        }
        else {
            this.result.controlStateStatistical[sheet.controlType]++;
        }
        this.result.killRate = this.result.profit / this.result.betGoldAmount;
        this.result.systemWinRate = this.result.systemWinCount / this.result.betRoundCount;
        this.dateChanged = Date.now();
    }
}
exports.PlatformControlManager = PlatformControlManager;
exports.default = new PlatformControlManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1Db250cm9sTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9uZXdDb250cm9sL2xpYi9wbGF0Zm9ybUNvbnRyb2xNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUEwRDtBQUMxRCwrR0FBMEY7QUFDMUYsbUNBQW9DO0FBQ3BDLDRDQUFxRTtBQUVyRSwrQ0FBaUQ7QUFDakQsaURBQTBDO0FBQzFDLG9HQUF3RjtBQUd4RixNQUFhLHNCQUFzQjtJQUFuQztRQUdJLGdCQUFXLEdBQXFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUQsb0JBQWUsR0FBNkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUd0RSxXQUFNLEdBQVcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRCxvQkFBZSxHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQyxnQkFBVyxHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQTJXckMsQ0FBQztJQXpXRyxLQUFLLENBQUMsSUFBSTtRQUNOLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQztRQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUd2QixNQUFNLFlBQVksR0FDZCxNQUFNLHlDQUFrQixDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTFELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzFDLE9BQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUdKLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENB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