"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolImpl = void 0;
const BasePool_1 = require("../bean/BasePool");
const BonusPoolImpl_1 = require("./BonusPoolImpl");
const ControlPoolImpl_1 = require("./ControlPoolImpl");
const ProfitPoolImpl_1 = require("./ProfitPoolImpl");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const BonusPool_mysql_dao_1 = require("../../../common/dao/mysql/BonusPool.mysql.dao");
const BonusPoolHistory_mysql_dao_1 = require("../../../common/dao/mysql/BonusPoolHistory.mysql.dao");
const pinus_logger_1 = require("pinus-logger");
const nodeSchedule = require("node-schedule");
class PoolImpl extends BasePool_1.BasePool {
    constructor(opt) {
        super(opt);
        this.oddsOfWinning = 0;
        this.betAmount = 0;
        this.awardAmount = 0;
        this.rateLastUpdateTime = Date.now();
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.sceneId = opt['sceneId'];
        this.bonusPool = new BonusPoolImpl_1.BonusPoolImpl(this);
        this.controlPool = new ControlPoolImpl_1.ControlPoolImpl(this);
        this.profitPool = new ProfitPoolImpl_1.ProfitPoolImpl(this);
    }
    async changeBonusPoolAmount(amount, changeStatus) {
        try {
            this.logger.info(`是否加减 ${amount}/${changeStatus}/${typeof changeStatus}`);
            switch (changeStatus) {
                case 1:
                    this.bonusPool.addBonusPoolAmount(amount);
                    break;
                case 2: {
                    this.bonusPool.reducePoolAmount(amount);
                    break;
                }
            }
            this.updateRecordUUID();
        }
        catch (e) {
            this.logger.error(`改变奖池金额出错: nid:${this.nid}|sceneId:${this.sceneId}|金额:${amount}|修改状态:${changeStatus}。错误详情`, e.stack);
        }
    }
    changeAwardAmountAndBetAmount(amount, betAmount, changeStatus) {
        if (changeStatus === 1) {
            this.awardAmount += (amount + betAmount);
        }
        else {
            this.awardAmount += (betAmount - amount);
        }
        this.addBetAmount(betAmount);
        this.updateOddsOfWinning();
    }
    addBetAmount(amount) {
        this.betAmount += amount;
    }
    updateRecordUUID() {
        this.recordUUID = BonusPool_mysql_dao_1.default.getUUID();
    }
    getBonusPoolCorrectedValue() {
        return this.bonusPool.bonusPoolCorrectedValue;
    }
    getCorrectedValueAndLockJackpot() {
        return {
            lockJackpot: this.bonusPool.isLockJackpot(),
            correctedValue: this.bonusPool.bonusPoolCorrectedValue
        };
    }
    getBonusAmountAndCorrectedValue() {
        return {
            amount: this.bonusPool.amount,
            correctedValue: this.bonusPool.bonusPoolCorrectedValue
        };
    }
    async initAllPoolConfig(parameter, option) {
        if (!Number.isInteger(parameter['sceneId']))
            delete parameter['sceneId'];
        if (!parameter['roomId'])
            delete parameter['roomId'];
        const bonusPoolsConfigInfo = await BonusPool_mysql_dao_1.default.findOne(parameter);
        if (!bonusPoolsConfigInfo) {
            const poolInfoList = (0, JsonMgr_1.get)(`pool/${this.serverName}`);
            if (!poolInfoList)
                throw Error(`未曾在 config/data/pool/${this.serverName}.json 读到相关配置信息，请确认传递参数:${JSON.stringify(parameter)}`);
            let criterion = parameter.hasOwnProperty('sceneId') && Number.isInteger(parameter['sceneId']) && parameter['sceneId'] >= 0 ? parameter['sceneId'] : -1;
            const bonusPoolInfoIdx = poolInfoList.datas.findIndex(poolInfo => poolInfo.id === criterion);
            const targetBonusPoolInfo = poolInfoList.datas[bonusPoolInfoIdx];
            try {
                this.sceneName = targetBonusPoolInfo['sceneName'];
                this.bonusPool.amount = targetBonusPoolInfo['initAmount'];
                this.bonusPool.initAmount = targetBonusPoolInfo['initAmount'];
                this.bonusPool.minAmount = targetBonusPoolInfo['minAmount'];
                this.bonusPool.minParameter = targetBonusPoolInfo['minParameter'];
                this.bonusPool.maxAmount = targetBonusPoolInfo['maxAmount'];
                this.bonusPool.maxParameter = targetBonusPoolInfo['maxParameter'];
                this.bonusPool.maxAmountInStore = targetBonusPoolInfo['maxAmountInStore'];
                this.bonusPool.maxAmountInStoreSwitch = targetBonusPoolInfo['maxAmountInStoreSwitch'];
                this.bonusPool.setMinBonusPoolCorrectedValue(targetBonusPoolInfo['minBonusPoolCorrectedValue']);
                this.bonusPool.setMaxBonusPoolCorrectedValue(targetBonusPoolInfo['maxBonusPoolCorrectedValue']);
                this.bonusPool.personalReferenceValue = targetBonusPoolInfo['personalReferenceValue'];
                this.autoUpdate = true;
                await BonusPool_mysql_dao_1.default.insertOne({
                    nid: this.nid,
                    gameName: targetBonusPoolInfo['gameName'] || '',
                    sceneId: this.sceneId,
                    sceneName: targetBonusPoolInfo['sceneName'] || '',
                    bonus_amount: this.bonusPool.initAmount,
                    bonus_initAmount: this.bonusPool.initAmount,
                    bonus_minAmount: this.bonusPool.minAmount,
                    bonus_minParameter: this.bonusPool.minParameter,
                    bonus_maxAmount: this.bonusPool.maxAmount,
                    bonus_maxParameter: this.bonusPool.maxParameter,
                    bonus_maxAmountInStore: this.bonusPool.maxAmountInStore,
                    bonus_maxAmountInStoreSwitch: this.bonusPool.maxAmountInStoreSwitch,
                    bonus_poolCorrectedValue: this.bonusPool.bonusPoolCorrectedValue,
                    bonus_personalReferenceValue: this.bonusPool.personalReferenceValue,
                    bonus_minBonusPoolCorrectedValue: targetBonusPoolInfo['minBonusPoolCorrectedValue'],
                    bonus_maxBonusPoolCorrectedValue: targetBonusPoolInfo['maxBonusPoolCorrectedValue'],
                    control_amount: this.controlPool.amount,
                    profit_amount: this.profitPool.amount,
                    autoUpdate: true,
                    lockJackpot: this.bonusPool.isLockJackpot(),
                    lastUpdateUUID: BonusPool_mysql_dao_1.default.getUUID(),
                });
            }
            catch (error) {
                this.logger.warn(`条件:${criterion}  参数:${JSON.stringify(parameter, null, 2)}---| `);
                this.logger.warn(`serverName:${this.serverName} | 查找下标:${bonusPoolInfoIdx} | 参数:${JSON.stringify(parameter, null, 2)}---| `);
            }
        }
        else {
            this.sceneName = bonusPoolsConfigInfo['sceneName'];
            this.autoUpdate = bonusPoolsConfigInfo['autoUpdate'];
            this.recordUUID = bonusPoolsConfigInfo['lastUpdateUUID'];
            this.bonusPool.amount = bonusPoolsConfigInfo['bonus_amount'];
            this.bonusPool.initAmount = bonusPoolsConfigInfo['bonus_initAmount'];
            this.bonusPool.minAmount = bonusPoolsConfigInfo['bonus_minAmount'];
            this.bonusPool.minParameter = bonusPoolsConfigInfo['bonus_minParameter'];
            this.bonusPool.maxAmount = bonusPoolsConfigInfo['bonus_maxAmount'];
            this.bonusPool.maxParameter = bonusPoolsConfigInfo['bonus_maxParameter'];
            this.bonusPool.maxAmountInStore = bonusPoolsConfigInfo['bonus_maxAmountInStore'];
            this.bonusPool.maxAmountInStoreSwitch = bonusPoolsConfigInfo['bonus_maxAmountInStoreSwitch'];
            this.bonusPool.bonusPoolCorrectedValue = bonusPoolsConfigInfo['bonus_poolCorrectedValue'];
            this.bonusPool.personalReferenceValue = bonusPoolsConfigInfo['bonus_personalReferenceValue'];
            this.bonusPool.setMinBonusPoolCorrectedValue(bonusPoolsConfigInfo['bonus_minBonusPoolCorrectedValue']);
            this.bonusPool.setMaxBonusPoolCorrectedValue(bonusPoolsConfigInfo['bonus_maxBonusPoolCorrectedValue']);
            this.bonusPool.setLockJackpot(bonusPoolsConfigInfo['lockJackpot'] || true);
            this.controlPool.amount = bonusPoolsConfigInfo['control_amount'];
            this.profitPool.amount = bonusPoolsConfigInfo['profit_amount'];
        }
        await this.checkAutoUpdate();
        this.oddsOfWinningSchedule();
    }
    async checkAutoUpdate() {
        if (this.autoUpdate)
            this.bonusPoolsJob = nodeSchedule.scheduleJob('*/45 * * * * *', this.updatePoolRecord.bind(this));
    }
    oddsOfWinningSchedule() {
        const rule = new nodeSchedule.RecurrenceRule();
        rule.minute = 0;
        rule.second = 0;
        nodeSchedule.scheduleJob(rule, () => {
            this.awardAmount = 0;
            this.betAmount = 0;
            this.updateOddsOfWinning();
            this.rateLastUpdateTime = Date.now();
        });
    }
    updateOddsOfWinning() {
        this.oddsOfWinning = Number((this.awardAmount / this.betAmount).toFixed(2));
    }
    async updatePoolRecord() {
        const pool = await BonusPool_mysql_dao_1.default.findLastOneByParams({
            nid: this.nid,
            sceneId: this.sceneId
        });
        if (pool['lastUpdateUUID'] !== this.recordUUID) {
            const { id } = pool;
            await BonusPool_mysql_dao_1.default.updateOne({ id }, {
                bonus_amount: this.bonusPool.amount,
                bonus_poolCorrectedValue: this.bonusPool.bonusPoolCorrectedValue,
                bonus_minBonusPoolCorrectedValue: this.bonusPool.getMinBonusPoolCorrectedValue(),
                bonus_maxBonusPoolCorrectedValue: this.bonusPool.getMaxBonusPoolCorrectedValue(),
                control_amount: this.controlPool.amount,
                profit_amount: this.profitPool.amount,
                lockJackpot: this.bonusPool.isLockJackpot(),
                lastUpdateUUID: this.recordUUID,
            });
        }
    }
    async saveBonusPoolHistory() {
        await BonusPoolHistory_mysql_dao_1.default.insertOne({
            nid: this.nid,
            gameName: this.gameName,
            sceneId: this.sceneId,
            sceneName: this.sceneName,
            bonus_amount: this.bonusPool.amount,
            control_amount: this.controlPool.amount,
            profit_amount: this.profitPool.amount,
        });
    }
    async clearAllPool() {
        this.updateRecordUUID();
        this.bonusPool.amount = 0;
        this.controlPool.amount = 0;
        this.profitPool.amount = 0;
        this.bonusPool.changeCorrectedValueAfterAdd();
        this.bonusPool.changeCorrectedValueAfterReduce();
        await this.updatePoolRecord();
    }
    getOddsOfWinning() {
        return {
            sceneId: this.sceneId,
            oddsOfWinning: this.oddsOfWinning,
            lastUpdateTime: this.rateLastUpdateTime,
            betAmount: this.betAmount
        };
    }
}
exports.PoolImpl = PoolImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvYm9udXNQb29scy9wb29sL1Bvb2xJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUE0QztBQUM1QyxtREFBNkQ7QUFDN0QsdURBQW9EO0FBQ3BELHFEQUFrRDtBQUNsRCw2REFBdUU7QUFDdkUsdUZBQThFO0FBQzlFLHFHQUE0RjtBQUM1RiwrQ0FBaUQ7QUFDakQsOENBQStDO0FBYy9DLE1BQWEsUUFBUyxTQUFRLG1CQUFRO0lBb0JwQyxZQUFZLEdBQUc7UUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFOYixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLHVCQUFrQixHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUl0QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLDZCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGlDQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLCtCQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQVVELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFjLEVBQUUsWUFBbUI7UUFDN0QsSUFBSTtZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsTUFBTSxJQUFJLFlBQVksSUFBSSxPQUFPLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDMUUsUUFBUSxZQUFZLEVBQUU7Z0JBQ3BCLEtBQUssQ0FBQztvQkFDSixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMxQyxNQUFNO2dCQUNSLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDeEMsTUFBTTtpQkFDUDthQUNGO1lBR0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixJQUFJLENBQUMsR0FBRyxZQUFZLElBQUksQ0FBQyxPQUFPLE9BQU8sTUFBTSxTQUFTLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4SDtJQUNILENBQUM7SUFRTSw2QkFBNkIsQ0FBQyxNQUFjLEVBQUUsU0FBaUIsRUFBRSxZQUFtQjtRQUV6RixJQUFJLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQztTQUMxQzthQUFNO1lBRUwsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQztTQUMxQztRQUdELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFHN0IsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQU1NLFlBQVksQ0FBQyxNQUFjO1FBQ2hDLElBQUksQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDO0lBQzNCLENBQUM7SUFRTSxnQkFBZ0I7UUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyw2QkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBS0QsMEJBQTBCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQztJQUNoRCxDQUFDO0lBS0QsK0JBQStCO1FBQzdCLE9BQU87WUFDTCxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUU7WUFDM0MsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCO1NBQ3ZELENBQUE7SUFDSCxDQUFDO0lBS0QsK0JBQStCO1FBQzdCLE9BQU87WUFDTCxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNO1lBQzdCLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QjtTQUN2RCxDQUFBO0lBQ0gsQ0FBQztJQVFELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsTUFBZTtRQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFBRSxPQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUFFLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSw2QkFBaUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBRXpCLE1BQU0sWUFBWSxHQUFHLElBQUEsYUFBYSxFQUFDLFFBQVEsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsTUFBTSxLQUFLLENBQUMsd0JBQXdCLElBQUksQ0FBQyxVQUFVLDBCQUEwQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3SCxJQUFJLFNBQVMsR0FBb0IsU0FBUyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEssTUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLENBQUM7WUFDN0YsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFakUsSUFBSTtnQkFDRixJQUFJLENBQUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEdBQUcsbUJBQW1CLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDdEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxtQkFBbUIsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hHLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQUMsbUJBQW1CLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO2dCQUNoRyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixHQUFHLG1CQUFtQixDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0JBQ3RGLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUV2QixNQUFNLDZCQUFpQixDQUFDLFNBQVMsQ0FBQztvQkFDaEMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO29CQUNiLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO29CQUMvQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ3JCLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO29CQUNqRCxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVO29CQUN2QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVU7b0JBQzNDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVM7b0JBQ3pDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWTtvQkFDL0MsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUztvQkFDekMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZO29CQUMvQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQjtvQkFDdkQsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0I7b0JBQ25FLHdCQUF3QixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCO29CQUNoRSw0QkFBNEIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQjtvQkFDbkUsZ0NBQWdDLEVBQUUsbUJBQW1CLENBQUMsNEJBQTRCLENBQUM7b0JBQ25GLGdDQUFnQyxFQUFFLG1CQUFtQixDQUFDLDRCQUE0QixDQUFDO29CQUNuRixjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNO29CQUN2QyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNO29CQUNyQyxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO29CQUMzQyxjQUFjLEVBQUUsNkJBQWlCLENBQUMsT0FBTyxFQUFFO2lCQUM1QyxDQUFDLENBQUE7YUFDSDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sU0FBUyxRQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLFVBQVUsV0FBVyxnQkFBZ0IsU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzlIO1NBRUY7YUFBTTtZQUNMLElBQUksQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsVUFBVSxHQUFHLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixHQUFHLG9CQUFvQixDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDN0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsR0FBRyxvQkFBb0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEdBQUcsb0JBQW9CLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLG9CQUFvQixDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUN2RyxJQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLG9CQUFvQixDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUN2RyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ2hFO1FBRUQsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFHN0IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUtELEtBQUssQ0FBQyxlQUFlO1FBQ25CLElBQUksSUFBSSxDQUFDLFVBQVU7WUFBRSxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pILENBQUM7SUFLTyxxQkFBcUI7UUFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7UUFHL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFaEIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBR2xDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBR25CLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRzNCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBS00sbUJBQW1CO1FBRXhCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUdELEtBQUssQ0FBQyxnQkFBZ0I7UUFFcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSw2QkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQztZQUN2RCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDdEIsQ0FBQyxDQUFDO1FBR0gsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQzlDLE1BQU0sRUFBQyxFQUFFLEVBQUMsR0FBRyxJQUFJLENBQUM7WUFDbEIsTUFBTSw2QkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxFQUFFLEVBQUMsRUFBRTtnQkFDdEMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTTtnQkFDbkMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUI7Z0JBQ2hFLGdDQUFnQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLEVBQUU7Z0JBQ2hGLGdDQUFnQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLEVBQUU7Z0JBQ2hGLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU07Z0JBQ3ZDLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07Z0JBQ3JDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRTtnQkFDM0MsY0FBYyxFQUFFLElBQUksQ0FBQyxVQUFVO2FBQ2hDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUtELEtBQUssQ0FBQyxvQkFBb0I7UUFDeEIsTUFBTSxvQ0FBd0IsQ0FBQyxTQUFTLENBQUM7WUFDdkMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTTtZQUNuQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNO1lBQ3ZDLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07U0FDdEMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUtELEtBQUssQ0FBQyxZQUFZO1FBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRzNCLElBQUksQ0FBQyxTQUFTLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsU0FBUyxDQUFDLCtCQUErQixFQUFFLENBQUM7UUFDakQsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBS0QsZ0JBQWdCO1FBQ2QsT0FBTztZQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDakMsY0FBYyxFQUFFLElBQUksQ0FBQyxrQkFBa0I7WUFDdkMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQzFCLENBQUE7SUFDSCxDQUFDO0NBQ0Y7QUE1VEQsNEJBNFRDIn0=