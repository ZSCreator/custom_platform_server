import mongoManager = require('./lib/mongoManager');
const realityVideoAgentBalanceRecordDao = mongoManager.reality_video_agent_balance_record;
import { getLogger } from "pinus-logger";
const logger = getLogger('server_out', __filename);

/**
 * 真人视讯代理余额履历表
 */
export default class RealityVideoAgentBalanceRecordDao {
  /**
   * 查询最近一条记录
   * @param {{}} objectSelective : 查询条件
   * @returns {Promise<{agentTotalOfHistory}>}
   */
  static async findLastRecord(objectSelective) {
    let queryCondition = {};
    if (Object.keys(objectSelective).length > 0) queryCondition = Object.assign({}, queryCondition, objectSelective);
    let balanceRecord = [{ integralAfterChange: 0, agentTotalOfHistory: 0 }];
    try {
      const tmpBalanceRecord = await realityVideoAgentBalanceRecordDao
        .find(queryCondition)
        .sort({ createTime: -1 })
        .limit(1);
      if (tmpBalanceRecord.length > 0) balanceRecord = tmpBalanceRecord;
    } catch (e) {
      logger.error(`真人视讯|RealityVideoAgentBalanceRecordDao|findLastRecord|详情:${e.stack}`);
    }
    return balanceRecord[0];
  }

  /**
   * 查询所有记录
   * @param {object} objectSelective 查询条件
   * @returns {Promise<{agentTotalOfHistory: number}[]>}
   */
  static async findList(objectSelective) {
    let queryCondition: any = { $or: [{ "changeStatus": 1 }, { "changeStatus": 2 }] };
    if (Object.keys(objectSelective).length > 0) queryCondition = Object.assign({}, queryCondition, objectSelective);
    const { startPage = 1, pageSize = 20 } = queryCondition;
    delete queryCondition['startPage'];
    delete queryCondition['pageSize'];
    let balanceRecordList = [{ changeIntegral: 0, agentTotalOfHistory: 0 }];
    try {
      const tmpBalanceRecordList = await realityVideoAgentBalanceRecordDao
        .find(queryCondition)
        .sort({ createTime: -1 })
        .skip((startPage - 1) * pageSize)
        .limit(pageSize);
      if (tmpBalanceRecordList.length > 0) balanceRecordList = tmpBalanceRecordList;
    } catch (e) {
      logger.error(`真人视讯|RealityVideoAgentBalanceRecordDao|findList|详情:${e.stack}`);
    }
    return balanceRecordList;
  }

  static async findListTotalPage(objectSelective) {
    let totalPage = 0;
    try {
      let queryCondition: any = { $or: [{ "changeStatus": 1 }, { "changeStatus": 2 }] };
      if (Object.keys(objectSelective).length > 0) queryCondition = Object.assign({}, queryCondition, objectSelective);
      const { pageSize = 20 } = queryCondition;
      delete queryCondition['startPage'];
      delete queryCondition['pageSize'];
      const count = await realityVideoAgentBalanceRecordDao
        .countDocuments(queryCondition);
      totalPage = count ? Math.ceil(count / pageSize) : 0;
    } catch (e) {
    }
    return totalPage;
  }

  static async save({ integralBeforeChange, changeIntegral, integralAfterChange, agentTotalOfHistory, changeStatus, createUser, createTime = Date.now() }) {
    try {
      await realityVideoAgentBalanceRecordDao.create({
        integralBeforeChange,
        changeIntegral,
        integralAfterChange,
        agentTotalOfHistory,
        changeStatus,
        createUser,
        createTime
      });
    } catch (e) {
      const errorInfo = `用户${createUser}|changeStatus:${changeStatus}|changeIntegral:${changeIntegral}`;
      logger.error(`真人视讯|RealityVideoAgentBalanceRecordDao|save|${errorInfo}|详情:${e.stack}`);
    }
  }
}