"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRemote = void 0;
const PoolFactory_1 = require("../../../services/bonusPools/PoolFactory");
const pinus_logger_1 = require("pinus-logger");
const schedule_1 = require("../../../services/bonusPools/schedule");
const platformControlManager_1 = require("../../../services/newControl/lib/platformControlManager");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new MainRemote(app);
}
exports.default = default_1;
;
class MainRemote {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.HEAD = 'control.mainRemote.';
    }
    errTag(functionName, e) {
        console.error(`${this.HEAD}${functionName}`, JSON.stringify(e));
    }
    async getPool(poolConfig) {
        try {
            const instance = await PoolFactory_1.PoolFactory.getInstance(poolConfig.nid, poolConfig.sceneId, poolConfig.roomId);
            let result = {};
            for (const [poolName, poolInstance] of Object.entries(instance)) {
                for (const [key, value] of Object.entries(poolInstance)) {
                    switch (poolName) {
                        case 'bonusPool':
                            if (typeof value === 'number')
                                result[`bonus_${key}`] = value;
                            break;
                        case 'controlPool':
                            if (typeof value === 'number')
                                result[`control_${key}`] = value;
                            break;
                        case 'profitPool':
                            if (typeof value === 'number')
                                result[`profit_${key}`] = value;
                            break;
                    }
                }
            }
            return result;
        }
        catch (e) {
            this.errTag('getPool', e.stack || e);
            return e;
        }
    }
    async getCorrectedValueAndLockJackpot(params) {
        try {
            const { nid, sceneId, roomId } = params;
            const pool = await PoolFactory_1.PoolFactory.getInstance(nid, sceneId, roomId);
            return pool.getCorrectedValueAndLockJackpot();
        }
        catch (e) {
            this.errTag('getCorrectedValueAndLockJackpot', e.stack || e);
            return 1;
        }
    }
    async lockBonusPool(params) {
        const { nid, sceneId, lock } = params;
        const pool = await PoolFactory_1.PoolFactory.getInstance(nid, sceneId);
        return pool.bonusPool.setLockJackpot(lock);
    }
    async addProfitPoolAmount(cf) {
        try {
            const pool = await PoolFactory_1.PoolFactory.getInstance(cf.nid, cf.sceneId, cf.roomId);
            pool.profitPool.addProfitPoolAmount(cf.amount);
            return true;
        }
        catch (e) {
            this.errTag('addProfitPoolAmount', e.stack || e);
            return false;
        }
    }
    async changeBonusPoolAmount(cf) {
        try {
            const pool = await PoolFactory_1.PoolFactory.getInstance(cf.nid, cf.sceneId, cf.roomId);
            logger.info(`获取奖池实例|nid: ${cf.nid}, sceneId: ${cf.sceneId}`);
            logger.info(`奖池金额:${pool.bonusPool.amount}|金额下限:${pool.bonusPool.minAmount}|金额上限:${pool.bonusPool.maxAmount}|吃水系数:${pool.bonusPool.minParameter}|放水系数:${pool.bonusPool.maxParameter}`);
            logger.info(`当前修正值:${pool.getBonusPoolCorrectedValue()}|修正值下限:${pool.bonusPool.minBonusPoolCorrectedValue}|修正值上限:${pool.bonusPool.maxBonusPoolCorrectedValue}`);
            await pool.changeBonusPoolAmount(cf.amount, cf.changeStatus);
            pool.changeAwardAmountAndBetAmount(cf.amount, cf.betAmount, cf.changeStatus);
            logger.info(`奖池${cf.changeStatus === 1 ? '增加' : '减少'}:${cf.amount}`);
            logger.info(`变化后的修正值:${pool.getBonusPoolCorrectedValue()}|修正值下限:${pool.bonusPool.minBonusPoolCorrectedValue}|修正值上限:${pool.bonusPool.maxBonusPoolCorrectedValue}`);
            return true;
        }
        catch (e) {
            this.errTag('changeBonusPoolAmount', e.stack || e);
            return false;
        }
    }
    async changeControlData(sheet) {
        try {
            const pool = await PoolFactory_1.PoolFactory.getInstance(sheet.nid, sheet.sceneId);
            const changeStatus = sheet.profit > 0 ? 2 : 1;
            const amount = Math.abs(sheet.profit);
            await pool.changeBonusPoolAmount(amount, changeStatus);
            pool.changeAwardAmountAndBetAmount(amount, sheet.betGold, changeStatus);
            platformControlManager_1.default.change(sheet);
            return true;
        }
        catch (e) {
            this.errTag('changeControlData', e.stack || e);
            return false;
        }
    }
    async getBonusPoolCorrectedValueByParams(params) {
        try {
            const { nid, sceneId, roomId } = params;
            const pool = await PoolFactory_1.PoolFactory.getInstance(nid, sceneId, roomId);
            return pool.getBonusPoolCorrectedValue();
        }
        catch (e) {
            this.errTag('getBonusPoolCorrectedValueByParams', e.stack || e);
            return 1;
        }
    }
    async changePoolConfig(params, changeParam) {
        try {
            const { nid, sceneId, roomId } = params;
            const pool = await PoolFactory_1.PoolFactory.getInstance(nid, sceneId, roomId);
            pool.bonusPool.minAmount = changeParam['minAmount'];
            pool.bonusPool.minParameter = changeParam['minParameter'];
            pool.bonusPool.maxAmount = changeParam['maxAmount'];
            pool.bonusPool.maxParameter = changeParam['maxParameter'];
            pool.bonusPool.maxAmountInStore = changeParam['maxAmountInStore'];
            pool.bonusPool.maxAmountInStoreSwitch = changeParam['maxAmountInStoreSwitch'];
            pool.bonusPool.setMinBonusPoolCorrectedValue(changeParam['minBonusPoolCorrectedValue']);
            pool.bonusPool.setMaxBonusPoolCorrectedValue(changeParam['maxBonusPoolCorrectedValue']);
            pool.bonusPool.personalReferenceValue = changeParam['personalReferenceValue'];
            pool.bonusPool.changeCorrectedValueAfterAdd();
            pool.bonusPool.changeCorrectedValueAfterReduce();
            return true;
        }
        catch (e) {
            this.errTag('getBonusPoolCorrectedValueByParams', e.stack || e);
            return false;
        }
    }
    async updateClearPoolsAmountTimeConfig(params) {
        await (0, schedule_1.updateTimeConfig)(params);
        (0, schedule_1.runScheduleJob)();
    }
    getPlatformControl({ platformId, tenantId, nid, betGold }) {
        return platformControlManager_1.default.needKill(platformId, tenantId, nid, betGold);
    }
    async clearPoolsAmount() {
        await (0, schedule_1.clearBonusPoolJob)();
    }
    async getPoolsAmountAndCorrectedValue(finds) {
        const results = {};
        for (let nid in finds) {
            const sceneIds = finds[nid];
            results[nid] = await Promise.all(sceneIds.map(async (sceneId) => {
                const pool = await PoolFactory_1.PoolFactory.getInstance(nid, sceneId);
                if (pool) {
                    return pool.getBonusAmountAndCorrectedValue();
                }
                return null;
            }));
        }
        return results;
    }
    async getPoolsOddsOfWinning(finds) {
        const results = {};
        for (let nid in finds) {
            const sceneIds = finds[nid];
            results[nid] = await Promise.all(sceneIds.map(async (sceneId) => {
                const pool = await PoolFactory_1.PoolFactory.getInstance(nid, sceneId);
                if (pool) {
                    return pool.getOddsOfWinning();
                }
                return null;
            }));
        }
        return results;
    }
    async getAllPlatformData() {
        return platformControlManager_1.default.getData(true);
    }
    async getPlatformData({ platformId }) {
        const result = platformControlManager_1.default.getPlatformData(platformId, true);
        if (!result) {
            return null;
        }
        return {
            platformId: '',
            betGoldAmount: result.comprehensive.betGoldAmount,
            profit: result.comprehensive.profit,
            betPlayersSet: result.comprehensive.betPlayersSet.length,
            playerWinCount: result.comprehensive.playerWinCount,
            systemWinCount: result.comprehensive.systemWinCount,
            equalityCount: result.comprehensive.equalityCount,
            systemWinRate: result.comprehensive.systemWinRate,
            killRate: result.comprehensive.killRate,
            controlWinCount: result.comprehensive.controlWinCount,
            controlLossCount: result.comprehensive.controlLossCount,
            controlEquality: result.comprehensive.controlEquality,
            betRoundCount: result.comprehensive.betRoundCount,
            serviceCharge: result.comprehensive.serviceCharge,
            controlStateStatistical: result.comprehensive.controlStateStatistical,
            killRateConfig: result.killRateConfig,
            games: result.games.map(g => {
                return {
                    nid: g.nid,
                    comprehensive: g.comprehensive,
                    killRateConfig: g.killRateConfig,
                };
            })
        };
    }
    async getPlatformGameData({ platformId, nid }) {
        const result = platformControlManager_1.default.getPlatformData(platformId, true);
        if (!result) {
            return null;
        }
        return result.games.find(g => g.nid === nid);
    }
    getPlatformGamesKillRateConfig({ platformId, games }) {
        const gameList = {};
        games.forEach(nid => gameList[nid] = platformControlManager_1.default.getPlatformKillRateConfig(platformId, nid));
        return {
            platformKillRateConfig: platformControlManager_1.default.getPlatformKillRateConfig(platformId),
            gameList
        };
    }
    async setPlatformControl({ platformId, killRate, nid }) {
        return await platformControlManager_1.default.addPlatformControl(platformId, killRate, nid);
    }
    async setTenantControl({ platformId, tenantId, killRate, nid }) {
        return await platformControlManager_1.default.addTenantControl(platformId, tenantId, killRate, nid);
    }
    async addTenantGameScene({ platformId, tenantId, nid, sceneId }) {
        return platformControlManager_1.default.addTenantGameScene(platformId, tenantId, nid, sceneId);
    }
}
exports.MainRemote = MainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NvbnRyb2wvcmVtb3RlL21haW5SZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMEVBQXVFO0FBQ3ZFLCtDQUF5QztBQUN6QyxvRUFBeUg7QUFDekgsb0dBQTZGO0FBSzdGLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUF3Q25ELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFFRixNQUFhLFVBQVU7SUFHbkIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcscUJBQXFCLENBQUM7SUFDdEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQU9ELEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBcUI7UUFDL0IsSUFBSTtZQUNBLE1BQU0sUUFBUSxHQUFHLE1BQU0seUJBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0RyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDaEIsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxD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