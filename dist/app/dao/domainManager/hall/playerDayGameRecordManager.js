'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayerDayGameRecord = exports.findPlayerDayGameRecordList = exports.findPlayerDayGameRecord = exports.updatePlayerDayGameRecord = exports.updateSortPlayerDayGameRecord = exports.addPlayerDayGameRecord = void 0;
const mongoManager = require("../../../common/dao/mongoDB/lib/mongoManager");
const PlayerDayGameRecord = mongoManager.player_day_game_record;
const addPlayerDayGameRecord = async (createInfo) => {
    try {
        return await PlayerDayGameRecord.create(createInfo);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.addPlayerDayGameRecord = addPlayerDayGameRecord;
const updateSortPlayerDayGameRecord = async (where, fields) => {
    try {
        const record = await PlayerDayGameRecord.findOne(where).sort('-createTime').limit(1);
        if (record) {
            await PlayerDayGameRecord.updateOne({ _id: record._id }, fields);
        }
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.updateSortPlayerDayGameRecord = updateSortPlayerDayGameRecord;
const updatePlayerDayGameRecord = async (where, fields) => {
    try {
        return await PlayerDayGameRecord.updateOne(where, { $set: fields });
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.updatePlayerDayGameRecord = updatePlayerDayGameRecord;
const findPlayerDayGameRecord = async (where, fields, options) => {
    try {
        return await PlayerDayGameRecord.findOne(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findPlayerDayGameRecord = findPlayerDayGameRecord;
const findPlayerDayGameRecordList = async (where, fields, options) => {
    try {
        !fields && (fields = '');
        !options && (options = {});
        Object.assign(options, { lean: true });
        return await PlayerDayGameRecord.find(where, fields, options);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.findPlayerDayGameRecordList = findPlayerDayGameRecordList;
const deletePlayerDayGameRecord = async (where) => {
    try {
        await PlayerDayGameRecord.remove(where);
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.deletePlayerDayGameRecord = deletePlayerDayGameRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyRGF5R2FtZVJlY29yZE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZGFvL2RvbWFpbk1hbmFnZXIvaGFsbC9wbGF5ZXJEYXlHYW1lUmVjb3JkTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLDZFQUE4RTtBQUU5RSxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQztBQU96RCxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFBRTtJQUN2RCxJQUFJO1FBQ0EsT0FBTyxNQUFNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN2RDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBTlcsUUFBQSxzQkFBc0IsMEJBTWpDO0FBT0ssTUFBTSw2QkFBNkIsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ2pFLElBQUk7UUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3BFO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQztBQUNMLENBQUMsQ0FBQztBQVRXLFFBQUEsNkJBQTZCLGlDQVN4QztBQU9LLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUM3RCxJQUFJO1FBQ0EsT0FBTyxNQUFNLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUN2RTtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBTlcsUUFBQSx5QkFBeUIsNkJBTXBDO0FBUUssTUFBTSx1QkFBdUIsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU8sRUFBRSxPQUFRLEVBQUUsRUFBRTtJQUN0RSxJQUFJO1FBQ0EsT0FBTyxNQUFNLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3BFO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7QUFDTCxDQUFDLENBQUM7QUFOVyxRQUFBLHVCQUF1QiwyQkFNbEM7QUFRSyxNQUFNLDJCQUEyQixHQUFHLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQVEsRUFBRSxFQUFFO0lBQ3pFLElBQUk7UUFDQSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sTUFBTSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNqRTtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQyxDQUFDO0FBVFcsUUFBQSwyQkFBMkIsK0JBU3RDO0FBT0ssTUFBTSx5QkFBeUIsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDckQsSUFBSTtRQUNBLE1BQU0sbUJBQW1CLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzNDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7QUFDTCxDQUFDLENBQUM7QUFOVyxRQUFBLHlCQUF5Qiw2QkFNcEMifQ==