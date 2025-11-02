'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAgentYuzhiRecordInfo = exports.deleteAgentYuzhiRecordInfo = exports.findAgentYuzhiRecordList = exports.findAgentYuzhiRecord = exports.addAgentYuzhiRecord = void 0;
const mongoManager = require("../../../common/dao/mongoDB/lib/mongoManager");
const AgentYuzhiRecord = mongoManager.agent_yuzhi_record;
const addAgentYuzhiRecord = async (info) => {
    try {
        await AgentYuzhiRecord.create(info);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.addAgentYuzhiRecord = addAgentYuzhiRecord;
const findAgentYuzhiRecord = async (where, fields, options) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentYuzhiRecord.findOne(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findAgentYuzhiRecord = findAgentYuzhiRecord;
const findAgentYuzhiRecordList = async (where, fields, options) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentYuzhiRecord.find(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findAgentYuzhiRecordList = findAgentYuzhiRecordList;
const deleteAgentYuzhiRecordInfo = async (where) => {
    try {
        await AgentYuzhiRecord.remove(where);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.deleteAgentYuzhiRecordInfo = deleteAgentYuzhiRecordInfo;
const updateAgentYuzhiRecordInfo = async (where, fields) => {
    try {
        await AgentYuzhiRecord.updateOne(where, fields, { multi: true });
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.updateAgentYuzhiRecordInfo = updateAgentYuzhiRecordInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRZdXpoaVJlY29yZE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZGFvL2RvbWFpbk1hbmFnZXIvYWdlbnRCY2tNYW5hZ2VyL2FnZW50WXV6aGlSZWNvcmRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsNkVBQThFO0FBQzlFLE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixDQUFDO0FBS2xELE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQzlDLElBQUk7UUFDQSxNQUFNLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN2QztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBTlcsUUFBQSxtQkFBbUIsdUJBTTlCO0FBR0ssTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU8sRUFBRSxPQUFRLEVBQUUsRUFBRTtJQUNuRSxJQUFJO1FBQ0EsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDekIsTUFBTSxJQUFJLE9BQU8sQ0FBQztRQUNsQixDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNqRTtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBVlcsUUFBQSxvQkFBb0Isd0JBVS9CO0FBR0ssTUFBTSx3QkFBd0IsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU8sRUFBRSxPQUFRLEVBQUUsRUFBRTtJQUN2RSxJQUFJO1FBQ0EsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDekIsTUFBTSxJQUFJLE9BQU8sQ0FBQztRQUNsQixDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM5RDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBVlcsUUFBQSx3QkFBd0IsNEJBVW5DO0FBR0ssTUFBTSwwQkFBMEIsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDdEQsSUFBSTtRQUNBLE1BQU0sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7QUFDTCxDQUFDLENBQUM7QUFOVyxRQUFBLDBCQUEwQiw4QkFNckM7QUFJSyxNQUFNLDBCQUEwQixHQUFHLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTyxFQUFFLEVBQUU7SUFDL0QsSUFBSTtRQUNBLE1BQU0sZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUNwRTtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBTlcsUUFBQSwwQkFBMEIsOEJBTXJDIn0=