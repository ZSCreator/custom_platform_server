import { BasePool } from '../bean/BasePool';
import { BonusPoolImpl as BonusPool } from './BonusPoolImpl';
import { ControlPoolImpl } from './ControlPoolImpl';
import { ProfitPoolImpl } from './ProfitPoolImpl';
import { get as getJsonConfig } from "../../../../config/data/JsonMgr";
import BonusPoolMysqlDao from '../../../common/dao/mysql/BonusPool.mysql.dao';
import BonusPoolHistoryMysqlDao from '../../../common/dao/mysql/BonusPoolHistory.mysql.dao';
import { getLogger, Logger } from 'pinus-logger';
import nodeSchedule = require('node-schedule');

// const bonusPoolsDao = MongoManager.bonus_pools;


/**
 * @property bonusPool 公共奖金池
 * @property controlPool 调控池
 * @property profitPool 盈利池
 * @property oddsOfWinning 返奖率
 * @property betAmount 押注累积
 * @property awardAmount 返奖累积
 * @property rateLastUpdateTime 返奖率更新时间
 */
export class PoolImpl extends BasePool {

  logger: Logger;
  // 数据库 数据相关
  autoUpdate: boolean;
  recordUUID: string;
  bonusPoolsJob: any;
  // 基础属性
  sceneId: number;
  sceneName: string;
  bonusPool: BonusPool;
  controlPool: ControlPoolImpl;
  profitPool: ProfitPoolImpl;

  // 新增属性
  oddsOfWinning: number = 0;
  betAmount: number = 0;
  awardAmount: number = 0;
  rateLastUpdateTime: number = Date.now();

  constructor(opt) {
    super(opt);
    this.logger = getLogger('server_out', __filename);
    this.sceneId = opt['sceneId'];
    this.bonusPool = new BonusPool(this);
    this.controlPool = new ControlPoolImpl(this);
    this.profitPool = new ProfitPoolImpl(this);
  }

  // 此处即可实现对局过程过程的相关函数，如 奖金池满，则引入调控池；
  // 其次是可以在此处动态实现 游戏调控里的 动态调控参数

  /**
   *
   * @param amount 变化金币 (正整数)
   * @param changeStatus 改变状态 1.增加 ;2.减少
   */
  async changeBonusPoolAmount(amount: number, changeStatus: 1 | 2): Promise<void> {
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

      // 更新uuid
      this.updateRecordUUID();
    } catch (e) {
      this.logger.error(`改变奖池金额出错: nid:${this.nid}|sceneId:${this.sceneId}|金额:${amount}|修改状态:${changeStatus}。错误详情`, e.stack);
    }
  }

  /**
   * 累加返奖金额
   * @param amount 累加奖池的金额
   * @param betAmount  下注的金额
   * @param changeStatus 改变奖池状态 1.增加 ;2.减少
   */
  public changeAwardAmountAndBetAmount(amount: number, betAmount: number, changeStatus: 1 | 2) {
    // 如果是减少代表玩家盈利了 而累加的是纯利润
    if (changeStatus === 1) {
      this.awardAmount += (amount + betAmount);
    } else {
      // 如果是累加奖池 代表玩家输了
      this.awardAmount += (betAmount - amount);
    }

    // 加押注金币
    this.addBetAmount(betAmount);

    // 更新返奖率
    this.updateOddsOfWinning();
  }

  /**
   * 累加下注金额
   * @param amount 下注金额
   */
  public addBetAmount(amount: number) {
    this.betAmount += amount;
  }

  /**
   * 更新recordUUID
   * des: 向外暴露更新uuid接口
   * updateTime: 2019.10.7
   * auth: shaw
   */
  public updateRecordUUID() {
    this.recordUUID = BonusPoolMysqlDao.getUUID();
  }

  /**
   * 获取当前 公共奖池修正值
   */
  getBonusPoolCorrectedValue() {
    return this.bonusPool.bonusPoolCorrectedValue;
  }

  /**
   * 获取奖池修正值以及奖池是否锁定
   */
  getCorrectedValueAndLockJackpot() {
    return {
      lockJackpot: this.bonusPool.isLockJackpot(),
      correctedValue: this.bonusPool.bonusPoolCorrectedValue
    }
  }

  /**
   * 获取bonus 值以及修正值
   */
  getBonusAmountAndCorrectedValue() {
    return {
      amount: this.bonusPool.amount,
      correctedValue: this.bonusPool.bonusPoolCorrectedValue
    }
  }

  /**
   * 构建各池初始信息
   * 红包扫雷，百人类，有场无房间
   * @param parameter
   * @param option
   */
  async initAllPoolConfig(parameter, option?: object) {
    if (!Number.isInteger(parameter['sceneId'])) delete parameter['sceneId'];
    if (!parameter['roomId']) delete parameter['roomId'];
    const bonusPoolsConfigInfo = await BonusPoolMysqlDao.findOne(parameter);
    if (!bonusPoolsConfigInfo) {
      // 数据库未查询到信息，则从 config/data/pool/**.json 获取初始配置信息
      const poolInfoList = getJsonConfig(`pool/${this.serverName}`);
      if (!poolInfoList) throw Error(`未曾在 config/data/pool/${this.serverName}.json 读到相关配置信息，请确认传递参数:${JSON.stringify(parameter)}`);
      let criterion: number | string = parameter.hasOwnProperty('sceneId') && Number.isInteger(parameter['sceneId']) && parameter['sceneId'] >= 0 ? parameter['sceneId'] : -1;
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
        // 将初始信息存入数据库
        await BonusPoolMysqlDao.insertOne({
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
          lastUpdateUUID: BonusPoolMysqlDao.getUUID(),
        })
      } catch (error) {
        this.logger.warn(`条件:${criterion}  参数:${JSON.stringify(parameter, null, 2)}---| `);
        this.logger.warn(`serverName:${this.serverName} | 查找下标:${bonusPoolInfoIdx} | 参数:${JSON.stringify(parameter, null, 2)}---| `);
      }

    } else {
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

    // 设置定时更新返奖率任务
    this.oddsOfWinningSchedule();
  }

  /**
   * 自动更新维护 各奖池金额变化
   */
  async checkAutoUpdate() {
    if (this.autoUpdate) this.bonusPoolsJob = nodeSchedule.scheduleJob('*/45 * * * * *', this.updatePoolRecord.bind(this));
  }

  /**
   * 定时统计返奖率
   */
  private oddsOfWinningSchedule() {
    const rule = new nodeSchedule.RecurrenceRule();

    // 每小时的0分执行一次
    rule.minute = 0;
    rule.second = 0;

    nodeSchedule.scheduleJob(rule, () => {

      // 清空累积值
      this.awardAmount = 0;
      this.betAmount = 0;

      // 更新返奖率
      this.updateOddsOfWinning();

      // 设置最后更新时间
      this.rateLastUpdateTime = Date.now();
    });
  }

  /**
   * 更新返奖率
   */
  public updateOddsOfWinning() {
    // 计算返奖率 保留两位小数
    this.oddsOfWinning = Number((this.awardAmount / this.betAmount).toFixed(2));
  }


  async updatePoolRecord() {
    // Step 1:获取最近更新记录
    const pool = await BonusPoolMysqlDao.findLastOneByParams({
      nid: this.nid,
      sceneId: this.sceneId
    });

    // Step 2:record uuid 不同则自动更新
    if (pool['lastUpdateUUID'] !== this.recordUUID) {
      const {id} = pool;
      await BonusPoolMysqlDao.updateOne({id}, {
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

  /**
   * 把当前奖池数值放入记录
   */
  async saveBonusPoolHistory() {
    await BonusPoolHistoryMysqlDao.insertOne({
      nid: this.nid,                                              // 游戏id
      gameName: this.gameName,                                    // 游戏名称
      sceneId: this.sceneId,                                      // 场id
      sceneName: this.sceneName,                                  // 场名称：玩法类型
      bonus_amount: this.bonusPool.amount,                        // 公共奖池 当前金额
      control_amount: this.controlPool.amount,                    // 调控池 当前金额
      profit_amount: this.profitPool.amount,                      // 盈利池 当前金额
    })
  }

  /**
   * 清空所有奖池
   */
  async clearAllPool() {
    this.updateRecordUUID();
    this.bonusPool.amount = 0;
    this.controlPool.amount = 0;
    this.profitPool.amount = 0;

    // 重新计算修正值
    this.bonusPool.changeCorrectedValueAfterAdd();
    this.bonusPool.changeCorrectedValueAfterReduce();
    await this.updatePoolRecord();
  }

  /**
   * 获取返奖率 以及 押注额
   */
  getOddsOfWinning() {
    return {
      sceneId: this.sceneId,
      oddsOfWinning: this.oddsOfWinning,
      lastUpdateTime: this.rateLastUpdateTime,
      betAmount: this.betAmount
    }
  }
}