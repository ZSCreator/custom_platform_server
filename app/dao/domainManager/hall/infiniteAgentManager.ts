'use strict';

// 无限等级代理
import mongoManager = require('../../../common/dao/mongoDB/lib/mongoManager');
const infiniteAgentInfoDao = mongoManager.infinite_agent_info;





// 添加代理信息
export const addAgentInfo = async (agentInfo) => {
    try {
        await infiniteAgentInfoDao.create(agentInfo);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 查找单个代理信息
export const findAgent = async (where, fields?, options?) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await infiniteAgentInfoDao.findOne(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 批量查找代理信息
export const findAgentList = async (where, fields, options?) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await infiniteAgentInfoDao.find(where, fields, options);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 更新代理信息
export const updateAgent = async (where, fields) => {
    try {
        await infiniteAgentInfoDao.updateMany(where, fields, { multi: true });
    } catch (error) {
        return Promise.reject(error);
    }
};

// 更新一个代理的信息
export const updateOneAgent = async (where, fields) => {
    try {
        await infiniteAgentInfoDao.updateOne(where, fields, { multi: true });
    } catch (error) {
        return Promise.reject(error);
    }
};

// 删除代理信息
export const deleteAgent = async (where) => {
    try {
        await infiniteAgentInfoDao.deleteOne(where);
    } catch (error) {
        return Promise.reject(error);
    }
};

// 根据某些条件的排序和查询条件来查询最近的条数
export const findSortAgentList = async (where,fields,sort,start,limit) => {
    try {
        const list = await infiniteAgentInfoDao.find(where,fields).sort(sort).skip(start).limit(limit);
        return list
    } catch (error) {
        return Promise.reject(error);
    }
};

// 查找代理条数
export const countDocumentsAgent = async (where) => {
    try {
        const num = await infiniteAgentInfoDao.countDocuments(where);
        return num
    } catch (error) {
        return Promise.reject(error);
    }
};