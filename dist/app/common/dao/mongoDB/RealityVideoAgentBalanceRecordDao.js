"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoManager = require("./lib/mongoManager");
const realityVideoAgentBalanceRecordDao = mongoManager.reality_video_agent_balance_record;
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class RealityVideoAgentBalanceRecordDao {
    static async findLastRecord(objectSelective) {
        let queryCondition = {};
        if (Object.keys(objectSelective).length > 0)
            queryCondition = Object.assign({}, queryCondition, objectSelective);
        let balanceRecord = [{ integralAfterChange: 0, agentTotalOfHistory: 0 }];
        try {
            const tmpBalanceRecord = await realityVideoAgentBalanceRecordDao
                .find(queryCondition)
                .sort({ createTime: -1 })
                .limit(1);
            if (tmpBalanceRecord.length > 0)
                balanceRecord = tmpBalanceRecord;
        }
        catch (e) {
            logger.error(`真人视讯|RealityVideoAgentBalanceRecordDao|findLastRecord|详情:${e.stack}`);
        }
        return balanceRecord[0];
    }
    static async findList(objectSelective) {
        let queryCondition = { $or: [{ "changeStatus": 1 }, { "changeStatus": 2 }] };
        if (Object.keys(objectSelective).length > 0)
            queryCondition = Object.assign({}, queryCondition, objectSelective);
        const { startPage = 1, pageSize = 20 } = queryCondition;
        delete queryCondition['startPage'];
        delete queryCondition['pageSize'];
        let balanceRecordList = [{ changeIntegral: 0, agentTotalOfHistory: 0 }];
        try {
            const tmpBalanceRecordList = await realityVideoAgentBalanceRecordDao
                .find(queryCondition)
                .sort({ createTime: -1 })
                .skip((startPage - 1) * pageSize)
                .limit(pageSize);
            if (tmpBalanceRecordList.length > 0)
                balanceRecordList = tmpBalanceRecordList;
        }
        catch (e) {
            logger.error(`真人视讯|RealityVideoAgentBalanceRecordDao|findList|详情:${e.stack}`);
        }
        return balanceRecordList;
    }
    static async findListTotalPage(objectSelective) {
        let totalPage = 0;
        try {
            let queryCondition = { $or: [{ "changeStatus": 1 }, { "changeStatus": 2 }] };
            if (Object.keys(objectSelective).length > 0)
                queryCondition = Object.assign({}, queryCondition, objectSelective);
            const { pageSize = 20 } = queryCondition;
            delete queryCondition['startPage'];
            delete queryCondition['pageSize'];
            const count = await realityVideoAgentBalanceRecordDao
                .countDocuments(queryCondition);
            totalPage = count ? Math.ceil(count / pageSize) : 0;
        }
        catch (e) {
        }
        return totalPage;
    }
    static async save({ integralBeforeChange, changeIntegral, integralAfterChange, agentTotalOfHistory, changeStatus, createUser, createTime = Date.now() }) {
        try {
            await realityVideoAgentBalanceRecordDao.create({
                integralBeforeChange,
                changeIntegral,
                integralAfterChange,
                agentTotalOfHistory,
                changeStatus,
                createUser,
                createTime
            });
        }
        catch (e) {
            const errorInfo = `用户${createUser}|changeStatus:${changeStatus}|changeIntegral:${changeIntegral}`;
            logger.error(`真人视讯|RealityVideoAgentBalanceRecordDao|save|${errorInfo}|详情:${e.stack}`);
        }
    }
}
exports.default = RealityVideoAgentBalanceRecordDao;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhbGl0eVZpZGVvQWdlbnRCYWxhbmNlUmVjb3JkRGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9SZWFsaXR5VmlkZW9BZ2VudEJhbGFuY2VSZWNvcmREYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBb0Q7QUFDcEQsTUFBTSxpQ0FBaUMsR0FBRyxZQUFZLENBQUMsa0NBQWtDLENBQUM7QUFDMUYsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFLbkQsTUFBcUIsaUNBQWlDO0lBTXBELE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWU7UUFDekMsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDakgsSUFBSSxhQUFhLEdBQUcsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLElBQUk7WUFDRixNQUFNLGdCQUFnQixHQUFHLE1BQU0saUNBQWlDO2lCQUM3RCxJQUFJLENBQUMsY0FBYyxDQUFDO2lCQUNwQixJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztpQkFDeEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1osSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFBRSxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7U0FDbkU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMs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