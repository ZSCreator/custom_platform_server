"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusPoolImpl = void 0;
const BonusPoolAbstract_1 = require("../bean/BonusPoolAbstract");
const MongoManager = require("../../../common/dao/mongoDB/lib/mongoManager");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
const bonusPoolsDao = MongoManager.bonus_pools;
class BonusPoolImpl extends BonusPoolAbstract_1.BonusPoolAbstract {
    constructor(instance) {
        super();
        this.amount = 0;
        this.initAmount = 0;
        this.minAmount = 0;
        this.minParameter = 0;
        this.maxAmount = 0;
        this.maxParameter = 0;
        this.maxAmountInStore = 0;
        this.maxAmountInStoreSwitch = false;
        this.personalReferenceValue = 0;
        this.bonusPoolCorrectedValue = 1;
        this.lockJackpot = false;
        this.BASE_BONUS_CONTROL_VALUE = 1;
        this.pool = instance;
    }
    async initConfig(parameter) {
        this.pool.logger.info(`游戏:${parameter.nid}|更新奖池配置信息`);
        this.pool.logger.debug(`
    更新前基础信息:
      初始金额:${this.initAmount}
      阈值下限:${this.minAmount}
      吃水参数:${this.minParameter}
      阈值上限:${this.maxAmount}
      放水参数:${this.maxParameter}
      存储上限:${this.maxAmountInStore}
      超过上限是否自动转储至调控池:${this.maxAmountInStoreSwitch}
    `);
        if (!Number.isInteger(parameter['sceneId']))
            delete parameter['sceneId'];
        if (!parameter['roomId'])
            delete parameter['roomId'];
        const targetPoolInfo = await bonusPoolsDao.findOne(parameter);
        if (targetPoolInfo) {
            this.pool.autoUpdate = targetPoolInfo['autoUpdate'];
            this.initAmount = targetPoolInfo['bonus_initAmount'];
            this.minAmount = targetPoolInfo['bonus_minAmount'];
            this.minParameter = targetPoolInfo['bonus_minParameter'];
            this.maxAmount = targetPoolInfo['bonus_maxAmount'];
            this.maxParameter = targetPoolInfo['bonus_maxParameter'];
            this.maxAmountInStore = targetPoolInfo['bonus_maxAmountInStore'];
            this.maxAmountInStoreSwitch = targetPoolInfo['bonus_maxAmountInStoreSwitch'];
            this.personalReferenceValue = targetPoolInfo['bonus_personalReferenceValue'];
        }
        this.pool.logger.debug(`
    更新后基础信息:
      初始金额:${this.initAmount}
      阈值下限:${this.minAmount}
      吃水参数:${this.minParameter}
      阈值上限:${this.maxAmount}
      放水参数:${this.maxParameter}
      存储上限:${this.maxAmountInStore}
      超过上限是否自动转储至调控池:${this.maxAmountInStoreSwitch}
    `);
    }
    checkBonusPoolAmountAfterChange() {
        if (this.amount >= this.minAmount && this.amount <= this.maxAmount) {
            this.bonusPoolCorrectedValue = 1;
        }
    }
    addBonusPoolAmount(_amount) {
        if (this.maxAmountInStoreSwitch) {
            if (this.amount >= this.maxAmountInStore) {
                this.pool.controlPool.addControlPoolAmount(_amount);
                this.changeCorrectedValueAfterAddProxy();
                return;
            }
            if (this.amount + _amount >= this.maxAmountInStore) {
                let needAmount = this.maxAmountInStore - this.amount;
                this.amount += needAmount;
                this.pool.controlPool.addControlPoolAmount(_amount - needAmount);
                this.changeCorrectedValueAfterAddProxy();
                return;
            }
        }
        this.amount += _amount;
        this.amount = (0, commonUtil_1.fixNoRound)(this.amount, 2);
        this.changeCorrectedValueAfterAddProxy();
    }
    changeCorrectedValueAfterAddProxy() {
        this.checkBonusPoolAmountAfterChange();
        this.changeCorrectedValueAfterReduce();
        this.changeCorrectedValueAfterAdd();
        this.correctedValueCheck();
    }
    isEqualUpperLimitAndLowLimit() {
        return this.maxBonusPoolCorrectedValue === this.minBonusPoolCorrectedValue;
    }
    reducePoolAmount(_amount) {
        this.amount -= _amount;
        this.amount = (0, commonUtil_1.fixNoRound)(this.amount, 2);
        this.changeCorrectedValueAfterAddProxy();
    }
    setBonusPoolCorrectedValue(poolCorrectedValue) {
        this.bonusPoolCorrectedValue = poolCorrectedValue;
    }
    getMinBonusPoolCorrectedValue() {
        return this.minBonusPoolCorrectedValue;
    }
    setMinBonusPoolCorrectedValue(minBonusPoolCorrectedValue) {
        if (minBonusPoolCorrectedValue > 2 && minBonusPoolCorrectedValue < 0) {
            throw new Error('修正值下限不能大于二小于0');
        }
        this.minBonusPoolCorrectedValue = minBonusPoolCorrectedValue;
        return this;
    }
    getMaxBonusPoolCorrectedValue() {
        return this.maxBonusPoolCorrectedValue;
    }
    setMaxBonusPoolCorrectedValue(maxBonusPoolCorrectedValue) {
        if (maxBonusPoolCorrectedValue > 2 && maxBonusPoolCorrectedValue < 0) {
            throw new Error('修正值上限不能大于二小于0');
        }
        this.maxBonusPoolCorrectedValue = maxBonusPoolCorrectedValue;
        return this;
    }
    setLockJackpot(lockJackpot) {
        this.lockJackpot = lockJackpot;
    }
    isLockJackpot() {
        return this.lockJackpot;
    }
    changeCorrectedValueAfterAdd() {
        this.checkBonusPoolAmountAfterChange();
        if (this.amount > this.maxAmount) {
            const tmpAmountPer = ((this.amount - this.maxAmount) / this.maxParameter) * 0.01;
            this.bonusPoolCorrectedValue = this.BASE_BONUS_CONTROL_VALUE - tmpAmountPer <= this.minBonusPoolCorrectedValue ?
                this.minBonusPoolCorrectedValue : this.BASE_BONUS_CONTROL_VALUE - tmpAmountPer;
        }
    }
    changeCorrectedValueAfterReduce() {
        if (this.amount < this.minAmount) {
            const tmpAmountPer = Math.abs(((this.amount - this.minAmount) / this.minParameter) * 0.01);
            this.bonusPoolCorrectedValue = this.BASE_BONUS_CONTROL_VALUE + tmpAmountPer >= this.maxBonusPoolCorrectedValue ?
                this.maxBonusPoolCorrectedValue : this.BASE_BONUS_CONTROL_VALUE + tmpAmountPer;
        }
    }
    correctedValueCheck() {
        if (this.bonusPoolCorrectedValue > this.maxBonusPoolCorrectedValue) {
            this.bonusPoolCorrectedValue = this.maxBonusPoolCorrectedValue;
        }
        else if (this.bonusPoolCorrectedValue < this.minBonusPoolCorrectedValue) {
            this.bonusPoolCorrectedValue = this.minBonusPoolCorrectedValue;
        }
    }
}
exports.BonusPoolImpl = BonusPoolImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9udXNQb29sSW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9ib251c1Bvb2xzL3Bvb2wvQm9udXNQb29sSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpRUFBOEQ7QUFDOUQsNkVBQThFO0FBQzlFLGtFQUE2RDtBQUU3RCxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDO0FBa0IvQyxNQUFhLGFBQWMsU0FBUSxxQ0FBaUI7SUFtRWhELFlBQVksUUFBa0I7UUFDMUIsS0FBSyxFQUFFLENBQUM7UUFoRVosV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixpQkFBWSxHQUFXLENBQUMsQ0FBQztRQUN6QixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDN0IsMkJBQXNCLEdBQVksS0FBSyxDQUFDO1FBQ3hDLDJCQUFzQixHQUFXLENBQUMsQ0FBQztRQUtuQyw0QkFBdUIsR0FBVyxDQUFDLENBQUM7UUFFMUIsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFDL0IsNkJBQXdCLEdBQVcsQ0FBQyxDQUFDO1FBaUR6QyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBNUNELEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUztRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7O2FBRWxCLElBQUksQ0FBQyxVQUFVO2FBQ2YsSUFBSSxDQUFDLFNBQVM7YUFDZCxJQUFJLENBQUMsWUFBWTthQUNq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