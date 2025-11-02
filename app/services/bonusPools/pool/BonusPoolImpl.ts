import { PoolImpl } from './PoolImpl';
import { BonusPoolAbstract } from '../bean/BonusPoolAbstract';
import MongoManager = require('../../../common/dao/mongoDB/lib/mongoManager');
import {fixNoRound} from "../../../utils/lottery/commonUtil";

const bonusPoolsDao = MongoManager.bonus_pools;

/**
 * 公共池
 * @property amount 当前金额
 * @property minAmount 最低金额
 * @property maxAmount 最高金额
 * @property maxAmountInStore 最高储蓄金额
 * @property maxAmountInStoreSwitch 储蓄满时 自动/手动 将溢出金额引入"调控池"
 * @property personalReferenceValue 个人房间基准值
 * @function initConfig 初始化基本函数
 * @property amount 当前金额
 * @property bonusPoolCorrectedValue 公共修正值参数 单位( 百分比 )
 * @property minBonusPoolCorrectedValue 公共修正值参数 下限
 * @property maxBonusPoolCorrectedValue 公共修正值参数 上限
 * @author Andy
 * @date 2019年5月23日
 */
export class BonusPoolImpl extends BonusPoolAbstract {

    pool: PoolImpl;
    // 基础属性
    amount: number = 0;
    initAmount: number = 0;
    minAmount: number = 0;
    minParameter: number = 0;
    maxAmount: number = 0;
    maxParameter: number = 0;
    maxAmountInStore: number = 0;
    maxAmountInStoreSwitch: boolean = false;
    personalReferenceValue: number = 0;
    // 游戏时基础属性
     minBonusPoolCorrectedValue: number;
     maxBonusPoolCorrectedValue: number;
    // 游戏进行时动态属性
    bonusPoolCorrectedValue: number = 1;
    // 奖池是否被锁定
    protected lockJackpot: boolean = false;
    private BASE_BONUS_CONTROL_VALUE: number = 1;

    /**
     * 此处函数是用于后台更新配置时
     * @param parameter {object<nid,sceneId?,roomId?>}
     */
    async initConfig(parameter): Promise<void> {
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
        if (!Number.isInteger(parameter['sceneId'])) delete parameter['sceneId'];
        if (!parameter['roomId']) delete parameter['roomId'];
        const targetPoolInfo = await bonusPoolsDao.findOne(parameter);

        if (targetPoolInfo) {
            this.pool.autoUpdate = targetPoolInfo['autoUpdate'];
            // this.pool.recordUUID = targetPoolInfo['lastUpdateUUID'];
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

    constructor(instance: PoolImpl) {
        super();
        this.pool = instance;
    }

    /**
     * 奖金池当前值在 minAmount~maxAmount 波动时，系统不做任何干预
     */
    checkBonusPoolAmountAfterChange() {
        if (this.amount >= this.minAmount && this.amount <= this.maxAmount) {
            this.bonusPoolCorrectedValue = 1;
        }
    }

    /**
     * 增加公共奖池金额
     * @param _amount
     */
    addBonusPoolAmount(_amount: number): void {
        // 是否自动转入
        if (this.maxAmountInStoreSwitch) {
            // 公共奖池 已达 最高储蓄金额
            if (this.amount >= this.maxAmountInStore) {
                this.pool.controlPool.addControlPoolAmount(_amount);
                this.changeCorrectedValueAfterAddProxy();
                return;
            }
            // 公共奖池+传入参数 大于 最高储蓄金额
            if (this.amount + _amount >= this.maxAmountInStore) {
                let needAmount = this.maxAmountInStore - this.amount;
                this.amount += needAmount;
                this.pool.controlPool.addControlPoolAmount(_amount - needAmount);
                this.changeCorrectedValueAfterAddProxy();
                return;
            }
        }

        this.amount += _amount;
        // 保留两位小数
        this.amount = fixNoRound(this.amount, 2);
        this.changeCorrectedValueAfterAddProxy();
    }

    /**
     * 加奖池改变修正值代理
     */
    changeCorrectedValueAfterAddProxy() {
        // 检查初始修正值
        this.checkBonusPoolAmountAfterChange();
        // 如果奖池未被锁定 修改调控值
        this.changeCorrectedValueAfterReduce();
        this.changeCorrectedValueAfterAdd();
        // 防止超限
        this.correctedValueCheck();
    }

    /**
     * 修正值上限 下限是否相等
     */
    isEqualUpperLimitAndLowLimit(): boolean {
        return this.maxBonusPoolCorrectedValue === this.minBonusPoolCorrectedValue;
    }

    /**
     * 减少公共奖池金额
     * @param _amount
     */
    reducePoolAmount(_amount: number) {

        this.amount -= _amount;
        this.amount = fixNoRound(this.amount, 2);

        this.changeCorrectedValueAfterAddProxy();
    }

    /**
     * 调控修正值
     * @param poolCorrectedValue
     */
    public setBonusPoolCorrectedValue(poolCorrectedValue: number) {
        this.bonusPoolCorrectedValue = poolCorrectedValue;
    }

    /**
     * 获取调控下限
     */
    public getMinBonusPoolCorrectedValue(): number {
        return this.minBonusPoolCorrectedValue;
    }

    /**
     * 修改修正值下限
     * @param minBonusPoolCorrectedValue
     */
    public setMinBonusPoolCorrectedValue(minBonusPoolCorrectedValue: number): BonusPoolImpl {
        // if (minBonusPoolCorrectedValue > this.maxBonusPoolCorrectedValue) {
        //     throw new Error('修正值下限不能超过修正值上限')
        // }

        if (minBonusPoolCorrectedValue > 2 && minBonusPoolCorrectedValue < 0) {
            throw new Error('修正值下限不能大于二小于0');
        }

        this.minBonusPoolCorrectedValue = minBonusPoolCorrectedValue;
        return this;
    }

    /**
     * 获取调控上限
     */
    public getMaxBonusPoolCorrectedValue(): number {
        return this.maxBonusPoolCorrectedValue;
    }

    /**
     * 修改修正值上限
     * @param maxBonusPoolCorrectedValue
     */
    public setMaxBonusPoolCorrectedValue(maxBonusPoolCorrectedValue: number): BonusPoolImpl {
        // if (maxBonusPoolCorrectedValue < this.minBonusPoolCorrectedValue) {
        //     throw new Error('修正值上限不能小于修正值下限');
        // }

        if (maxBonusPoolCorrectedValue > 2 && maxBonusPoolCorrectedValue < 0) {
            throw new Error('修正值上限不能大于二小于0');
        }

        this.maxBonusPoolCorrectedValue = maxBonusPoolCorrectedValue;
        return this;
    }

    /**
     * 设置锁定jackpot
     * @param lockJackpot
     */
    public setLockJackpot(lockJackpot: boolean): void {
        this.lockJackpot = lockJackpot;
    }

    /**
     * 获取奖池是否已被锁定
     */
    public isLockJackpot(): boolean {
        return this.lockJackpot;
    }

    /**
     * 当奖池资金高于 maxAmount 时，意味着奖池资金高于阈值，系统进入放水状态。接下来的游戏中，玩家胜率会增加。
     */
    changeCorrectedValueAfterAdd(): void {
        this.checkBonusPoolAmountAfterChange();
        if (this.amount > this.maxAmount) {
            // 公共奖池修正 = 100% + 1% *（当前奖池值 - maxAmount）/ 放水快慢参数 maxParamter
            const tmpAmountPer = ((this.amount - this.maxAmount) / this.maxParameter) * 0.01;

            // 修正值不应高于上限 maxBonusPoolCorrectedValue
            this.bonusPoolCorrectedValue = this.BASE_BONUS_CONTROL_VALUE - tmpAmountPer <= this.minBonusPoolCorrectedValue ?
                this.minBonusPoolCorrectedValue : this.BASE_BONUS_CONTROL_VALUE - tmpAmountPer;
        }
    }

    /**
     * 当奖池资金低于 minAmount 时，意味着奖池资金低于阈值，系统进入吃水状态。接下来的游戏中，系统胜率会增加
     */
    changeCorrectedValueAfterReduce(): void {
        if (this.amount < this.minAmount) {
            // 公共奖池修正 = 100% + 1% *（当前奖池值 - minAmount）/ 吃水快慢参数 minParamter
            const tmpAmountPer = Math.abs(((this.amount - this.minAmount) / this.minParameter) * 0.01);

            // 修正值不应低于下限 maxBonusPoolCorrectedValue

            this.bonusPoolCorrectedValue =  this.BASE_BONUS_CONTROL_VALUE + tmpAmountPer >= this.maxBonusPoolCorrectedValue ?
                this.maxBonusPoolCorrectedValue : this.BASE_BONUS_CONTROL_VALUE  + tmpAmountPer;
        }
    }

    /**
     * 修正值检查 以防后台突然对修正值赏析限做强制限定
     */
    correctedValueCheck() {
        if (this.bonusPoolCorrectedValue > this.maxBonusPoolCorrectedValue) {
            this.bonusPoolCorrectedValue = this.maxBonusPoolCorrectedValue;
        } else if (this.bonusPoolCorrectedValue < this.minBonusPoolCorrectedValue) {
            this.bonusPoolCorrectedValue = this.minBonusPoolCorrectedValue;
        }
    }
}