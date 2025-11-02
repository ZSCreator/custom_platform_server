'use strict';

/**
 * 记录每日玩家进入游戏前的金币和出房间的金币
 */
import mongoManager = require('../../../common/dao/mongoDB/lib/mongoManager');
// const infiniteAgentInfoDao = mongoManager.getDao("agent_info");
const PlayerDayGameRecord = mongoManager.player_day_game_record;


/**
 *   添加当日玩家进出游戏记录
 * @param where,fields
 */
export const addPlayerDayGameRecord = async (createInfo) => {
    try {
        return await PlayerDayGameRecord.create(createInfo);
    } catch (error) {
        return Promise.reject(error);
    }
};


/**
 *   更新最近一条的数据
 * @param where,fields
 */
export const updateSortPlayerDayGameRecord = async (where, fields) => {
    try {
        const record = await PlayerDayGameRecord.findOne(where).sort('-createTime').limit(1);
        if (record) {
            await PlayerDayGameRecord.updateOne({ _id: record._id }, fields);
        }
    } catch (error) {
        return Promise.reject(error);
    }
};


/**
 *   更新当日玩家进出游戏记录
 * @param where,fields
 */
export const updatePlayerDayGameRecord = async (where, fields) => {
    try {
        return await PlayerDayGameRecord.updateOne(where, { $set: fields });
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 *  查找单个
 * @param where
 * @param fields
 * @param options
 */
export const findPlayerDayGameRecord = async (where, fields?, options?) => {
    try {
        return await PlayerDayGameRecord.findOne(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 *  查找多个
 * @param where
 * @param fields
 * @param options
 */
export const findPlayerDayGameRecordList = async (where, fields, options?) => {
    try {
        !fields && (fields = '');
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await PlayerDayGameRecord.find(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 *  删除
 * @param where
 */

export const deletePlayerDayGameRecord = async (where) => {
    try {
        await PlayerDayGameRecord.remove(where);
    } catch (error) {
        return Promise.reject(error);
    }
};