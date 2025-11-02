'use strict';

/**
 * 数据统计
 */
import util = require('../../index');
import databaseService = require('../../../services/databaseService');


let redisClient;

/**
 *  统计系统侵吞的玩家充值金币总额
 *  增加 (num为负数时减少)
 */
export const addAnnexationRechargeMoney = async num => {
    num = util.Int(num);
    redisClient = await databaseService.getRedisClient();
    return redisClient.incrby('annexation:recharge:money', num);
};

/**
 *  统计龙虎斗的开奖记录
 *  增加
 */
export const addDragonTigerRecord = async ({ env, roomId, lotteryResult, properties, winAreas, userWin, roundNum }) => {
    redisClient = await databaseService.getRedisClient();
    return redisClient.lpush(`dragon_tiger:record:${env}:${roomId}:${roundNum}`, JSON.stringify({
        lotteryResult, properties, winAreas, userWin
    }));
};

/**
 *  统计龙虎斗的开奖记录
 *  获取
 */
export const getDragonTigerRecord = async ({ roundNum, env, roomId }, start, stop) => {
    start = start || 0;
    stop = stop || 250;
    redisClient = await databaseService.getRedisClient();
    return redisClient.lrange(`dragon_tiger:record:${env}:${roomId}:${roundNum}`, start, stop).then(records => {
        if (util.isVoid(records)) {
            return Promise.resolve([]);
        }
        return Promise.resolve(records.map(record => JSON.parse(record)));
    })
};

/**
 *  统计龙虎斗的回合记录
 *  更新
 */
export const udtDragonTigerRound = async ({ roundNum, env, roomId, usedCards, cards }) => {
    redisClient = await databaseService.getRedisClient();
    return redisClient.hset(`dragon_tiger:round:${env}:${roomId}`, roundNum, JSON.stringify({ usedCards, cards }));
};

/**
 *  统计龙虎斗的回合记录
 *  获取回合次数
 */
export const getDragonTigerRound = async ({ env, roomId }) => {
    redisClient = await databaseService.getRedisClient();
    return redisClient.hkeys(`dragon_tiger:round:${env}:${roomId}`).then(keys => {
        if (util.isVoid(keys)) {
            return Promise.resolve([]);
        }
        return Promise.resolve(keys);
    });
};

/**
 *  统计骰宝的开奖记录
 *  增加
 */
export const addSicBoRecord = async ({ env, roomId, lotteryResult, winAreas, userWin }) => {
    const date = util.dateKey();
    redisClient = await databaseService.getRedisClient();
    return redisClient.lpush(`SicBo:record:${env}:${roomId}:${date}`, JSON.stringify({
        lotteryResult, winAreas, userWin
    }));
};

/**
 *  统计骰宝的开奖记录
 *  获取
 */
export const getSicBoRecord = async ({ env, roomId }, start, stop) => {
    start = start || 0;
    stop = stop || 250;
    const date = util.dateKey();
    redisClient = await databaseService.getRedisClient();
    return redisClient.lrange(`SicBo:record:${env}:${roomId}:${date}`, start, stop).then(records => {
        if (util.isVoid(records)) {
            return Promise.resolve([]);
        }
        return Promise.resolve(records.map(record => JSON.parse(record)));
    })
};