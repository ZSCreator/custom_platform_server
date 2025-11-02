'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.countDocumentsAgent = exports.findSortAgentList = exports.deleteAgent = exports.updateOneAgent = exports.updateAgent = exports.findAgentList = exports.findAgent = exports.addAgentInfo = void 0;
const mongoManager = require("../../../common/dao/mongoDB/lib/mongoManager");
const infiniteAgentInfoDao = mongoManager.infinite_agent_info;
const addAgentInfo = async (agentInfo) => {
    try {
        await infiniteAgentInfoDao.create(agentInfo);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.addAgentInfo = addAgentInfo;
const findAgent = async (where, fields, options) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await infiniteAgentInfoDao.findOne(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findAgent = findAgent;
const findAgentList = async (where, fields, options) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await infiniteAgentInfoDao.find(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findAgentList = findAgentList;
const updateAgent = async (where, fields) => {
    try {
        await infiniteAgentInfoDao.updateMany(where, fields, { multi: true });
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.updateAgent = updateAgent;
const updateOneAgent = async (where, fields) => {
    try {
        await infiniteAgentInfoDao.updateOne(where, fields, { multi: true });
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.updateOneAgent = updateOneAgent;
const deleteAgent = async (where) => {
    try {
        await infiniteAgentInfoDao.deleteOne(where);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.deleteAgent = deleteAgent;
const findSortAgentList = async (where, fields, sort, start, limit) => {
    try {
        const list = await infiniteAgentInfoDao.find(where, fields).sort(sort).skip(start).limit(limit);
        return list;
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findSortAgentList = findSortAgentList;
const countDocumentsAgent = async (where) => {
    try {
        const num = await infiniteAgentInfoDao.countDocuments(where);
        return num;
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.countDocumentsAgent = countDocumentsAgent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGVBZ2VudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZGFvL2RvbWFpbk1hbmFnZXIvaGFsbC9pbmZpbml0ZUFnZW50TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLDZFQUE4RTtBQUM5RSxNQUFNLG9CQUFvQixHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztBQU92RCxNQUFNLFlBQVksR0FBRyxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUU7SUFDNUMsSUFBSTtRQUNBLE1BQU0sb0JBQW9CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2hEO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7QUFDTCxDQUFDLENBQUM7QUFOVyxRQUFBLFlBQVksZ0JBTXZCO0FBR0ssTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFPLEVBQUUsT0FBUSxFQUFFLEVBQUU7SUFDeEQsSUFBSTtRQUNBLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sSUFBSSxPQUFPLENBQUM7UUFDbEIsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2QyxPQUFPLE1BQU0sb0JBQW9CLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckU7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQztBQUNMLENBQUMsQ0FBQztBQVZX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