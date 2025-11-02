"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActivityInfo = exports.saveOrUpdateActivityInfo = exports.insertActivityInfo = exports.findOpenActivityInfos = exports.findAllActivityInfos = void 0;
const MongoManager = require("./lib/mongoManager");
const dao = MongoManager.activity_info;
const findAllActivityInfos = async () => {
    return await dao.find();
};
exports.findAllActivityInfos = findAllActivityInfos;
const findOpenActivityInfos = async () => {
    return await dao.find({ isOpen: true });
};
exports.findOpenActivityInfos = findOpenActivityInfos;
const insertActivityInfo = async (activityInfo) => {
    let res = await dao.create(activityInfo);
};
exports.insertActivityInfo = insertActivityInfo;
const saveOrUpdateActivityInfo = async (activityInfo) => {
    await dao.updateOne({ id: activityInfo.id }, activityInfo, { upsert: true });
};
exports.saveOrUpdateActivityInfo = saveOrUpdateActivityInfo;
const deleteActivityInfo = async (id) => {
    await dao.deleteOne({ id: id });
};
exports.deleteActivityInfo = deleteActivityInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aXZpdHlJbmZvRGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9BY3Rpdml0eUluZm9EYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbURBQW9EO0FBRXBELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUM7QUFJaEMsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLElBQUksRUFBRTtJQUMzQyxPQUFPLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzVCLENBQUMsQ0FBQztBQUZXLFFBQUEsb0JBQW9CLHdCQUUvQjtBQUlLLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDNUMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM1QyxDQUFDLENBQUM7QUFGVyxRQUFBLHFCQUFxQix5QkFFaEM7QUFLSyxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFBRTtJQUNyRCxJQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0MsQ0FBQyxDQUFDO0FBRlcsUUFBQSxrQkFBa0Isc0JBRTdCO0FBS0ssTUFBTSx3QkFBd0IsR0FBRyxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUU7SUFDM0QsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNqRixDQUFDLENBQUM7QUFGVyxRQUFBLHdCQUF3Qiw0QkFFbkM7QUFLSyxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxFQUFVLEVBQUUsRUFBRTtJQUNuRCxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUM7QUFGVyxRQUFBLGtCQUFrQixzQkFFN0IifQ==