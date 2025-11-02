import mongoManager = require('./lib/mongoManager');
import { getLogger } from 'pinus-logger';

const logger = getLogger('server_out', __filename);
const bonusPoolsDao = mongoManager.bonus_pools;

export class BonusPoolsDao {

  static async findLastOneByParams(params) {
    try {
      const recordList = await bonusPoolsDao.find(params, 'lastUpdateUUID')
        .sort({ updateDateTime: -1 })
        .limit(1)
        .exec();
      return recordList;
    } catch (e) {
      logger.error(`查询最近奖池记录出错:`, e.stack);
      return [];
    }
  }

  /**
   * 定时更新 调用
   * @param params
   * @param where
   */
  static async updateLastOneByParams(params: object, where: object) {
    try {
      if (Object.keys(params).length === 0) {
        logger.error(`修改最近奖池记录出错，传入参数不应为空。修改内容:${params},修改条件:${where}`);
        return;
      }
      await bonusPoolsDao.updateOne(where, params);
    } catch (e) {
      logger.error(`修改最近奖池记录出错:`, e.stack);
    }
  }

  /**
   * http 接口调用
   * @param params
   */
  static async findList(params = {}) {
    try {
      return await bonusPoolsDao
        .find(params, ['_id', 'nid', 'sceneId', 'gameName', 'sceneName', 'bonus_initAmount', 'bonus_minAmount',
          'bonus_minParameter', 'bonus_maxAmount', 'bonus_maxParameter', 'bonus_maxAmountInStore',
          'bonus_maxAmountInStoreSwitch', 'bonus_personalReferenceValue', 'bonus_minBonusPoolCorrectedValue', 'bonus_maxBonusPoolCorrectedValue'])
        .sort({ nid: 1, sceneId: 1 });
    } catch (e) {
      logger.error(`查询所有奖池信息出错:`, e.stack);
      return [];
    }
  }

  /**
   * http 接口调用
   * @param params 具体列
   * @param _id 主键
   */
  static async updateById(params: object, _id: string) {
    try {
      if (Object.keys(params).length === 0) {
        logger.error(`修改配置信息出错，传入参数不应为空。修改内容:${params},修改条件:${_id}`);
        return;
      }
      await bonusPoolsDao.updateOne({ _id }, params);
    } catch (e) {
      logger.error(`修改奖池配置信息出错:`, e.stack);
    }
  }
}

/**
 * 自定义UUID
 * @return {string}
 */
export const getUUID = (): string => signMD5(`${randomString()}${Date.now()}`);

/**
 * MD5 信息摘要
 * @param str
 * @return {PromiseLike<String>} MD5 16进制编码
 */
const signMD5 = (str): string => require('crypto').createHash('md5').update(str).digest('hex');
/**
 * 返回长度为8的随机字符串
 * @return {string}
 */
const randomString = () => Math.random().toString(36).substr(2, 8);
