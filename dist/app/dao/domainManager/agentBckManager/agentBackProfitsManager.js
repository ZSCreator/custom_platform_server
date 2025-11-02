'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAgentBackRecordInfo = exports.deleteAgentBackRecordInfo = exports.findAgentBackRecordList = exports.findAgentBackRecord = exports.addAgentBackRecord = void 0;
const mongoManager = require("../../../common/dao/mongoDB/lib/mongoManager");
const AgentBackRecord = mongoManager.agentBack_record;
const addAgentBackRecord = async (info) => {
    try {
        await AgentBackRecord.create(info);
        return true;
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.addAgentBackRecord = addAgentBackRecord;
const findAgentBackRecord = async (where, fields, options) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentBackRecord.findOne(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findAgentBackRecord = findAgentBackRecord;
const findAgentBackRecordList = async (where, fields, options) => {
    try {
        !fields && (fields = '');
        fields += ' -_id';
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await AgentBackRecord.find(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findAgentBackRecordList = findAgentBackRecordList;
const deleteAgentBackRecordInfo = async (where) => {
    try {
        await AgentBackRecord.deleteOne(where);
        return true;
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.deleteAgentBackRecordInfo = deleteAgentBackRecordInfo;
const updateAgentBackRecordInfo = async (where, fields) => {
    try {
        await AgentBackRecord.updateOne(where, fields, { multi: true });
        return true;
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.updateAgentBackRecordInfo = updateAgentBackRecordInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRCYWNrUHJvZml0c01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZGFvL2RvbWFpbk1hbmFnZXIvYWdlbnRCY2tNYW5hZ2VyL2FnZW50QmFja1Byb2ZpdHNNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2IsNkVBQThFO0FBQzlFLE1BQU0sZUFBZSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztBQUcvQyxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUM3QyxJQUFJO1FBQ0EsTUFBTSxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQztBQUNMLENBQUMsQ0FBQztBQVBXLFFBQUEsa0JBQWtCLHNCQU83QjtBQUdLLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFPLEVBQUUsT0FBUSxFQUFFLEVBQUU7SUFDbEUsSUFBSTtRQUNBLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sSUFBSSxPQUFPLENBQUM7UUFDbEIsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2QyxPQUFPLE1BQU0sZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ2hFO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7QUFDTCxDQUFDLENBQUM7QUFWVyxRQUFBLG1CQUFtQix1QkFVOUI7QUFHSyxNQUFNLHVCQUF1QixHQUFHLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTyxFQUFFLE9BQVEsRUFBRSxFQUFFO0lBQ3RFLElBQUk7UUFDQSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN6QixNQUFNLElBQUksT0FBTyxDQUFDO1FBQ2xCLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkMsT0FBTyxNQUFNLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM3RDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBVlcsUUFBQSx1QkFBdUIsMkJBVWxDO0FBR0ssTUFBTSx5QkFBeUIsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDckQsSUFBSTtRQUNBLE1BQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQztLQUNmO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7QUFDTCxDQUFDLENBQUM7QUFQVyxRQUFBLHlCQUF5Qiw2QkFPcEM7QUFJSyxNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTyxFQUFFLEVBQUU7SUFDOUQsSUFBSTtRQUNBLE1BQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEUsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBUFcsUUFBQSx5QkFBeUIsNkJBT3BDIn0=