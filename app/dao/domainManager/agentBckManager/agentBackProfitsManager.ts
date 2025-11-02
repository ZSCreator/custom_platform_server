'use strict';

/**
 * 代理返佣的数据总和    manager
 */
import mongoManager = require('../../../common/dao/mongoDB/lib/mongoManager');
const AgentBackRecord = mongoManager.agentBack_record;

// 添加提取记录
export const addAgentBackRecord = async (info) => {
    try {
        await AgentBackRecord.create(info);
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
};

// 查找代理返点码相关信息
export const findAgentBackRecord = async (where, fields?, options?) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentBackRecord.findOne(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 批量查找代理信息
export const findAgentBackRecordList = async (where, fields?, options?) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentBackRecord.find(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 删除代理信息
export const deleteAgentBackRecordInfo = async (where) => {
    try {
        await AgentBackRecord.deleteOne(where);
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
};


// 更新代理返点码相关信息
export const updateAgentBackRecordInfo = async (where, fields?) => {
    try {
        await AgentBackRecord.updateOne(where, fields, { multi: true });
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
};







