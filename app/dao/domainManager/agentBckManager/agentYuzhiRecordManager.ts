'use strict';

// 提取记录
import mongoManager = require('../../../common/dao/mongoDB/lib/mongoManager');
const AgentYuzhiRecord = mongoManager.agent_yuzhi_record;



// 添加提取记录
export const addAgentYuzhiRecord = async (info) => {
    try {
        await AgentYuzhiRecord.create(info);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 查找玩家提取金币信息记录
export const findAgentYuzhiRecord = async (where, fields?, options?) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentYuzhiRecord.findOne(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 批量玩家提取金币信息记录
export const findAgentYuzhiRecordList = async (where, fields?, options?) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentYuzhiRecord.find(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 删除玩家提取金币信息记录
export const deleteAgentYuzhiRecordInfo = async (where) => {
    try {
        await AgentYuzhiRecord.remove(where);
    } catch (error) {
        return Promise.reject(error);
    }
};


//更新玩家提取金币信息记录
export const updateAgentYuzhiRecordInfo = async (where, fields?) => {
    try {
        await AgentYuzhiRecord.updateOne(where, fields, { multi: true });
    } catch (error) {
        return Promise.reject(error);
    }
};







