'use strict'

import HallConst = require('../consts/hallConst');
import RedisManager = require('../common/dao/redis/lib/redisManager');
import JsonMgr = require('../../config/data/JsonMgr');
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);



/**
 * 获取00:00 - 23:59 玩家领取的系统赠送的总金币
 * @return {Number} totalGold 总金币
 * */
export const getOneDaySystemGiveGold = async () => {
    try {
        const systemGiveGoldObj = await RedisManager.getObjectFromRedis(HallConst.GIVE_GOLD_COUNT) ||
            JsonMgr.get('systemGiveGold').datas;
        return Promise.resolve(systemGiveGoldObj.gold);
    } catch (e) {
        Logger.info(`StatGoldService.getOneDaySystemGiveGold ==> 错误: ${e}`);
        return Promise.resolve(0);
    }
};


/**
 * 清空金币计数
 * @return {Number} totalGold 总金币
 * */
export const removeOneDaySystemGiveGold = async () => {
    try {
        const systemGiveGoldObj = JsonMgr.get('systemGiveGold').datas;
        await RedisManager.setObjectIntoRedisNoExpiration(HallConst.GIVE_GOLD_COUNT, systemGiveGoldObj);
        return Promise.resolve(systemGiveGoldObj.gold);
    } catch (e) {
        Logger.info(`StatGoldService.removeOneDaySystemGiveGold ==> 错误: ${e}`);
        return Promise.resolve(0);
    }
};
