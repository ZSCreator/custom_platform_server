"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActivityInfo = exports.saveOrUpdateActivityInfo = exports.getOpenActivityInfo = exports.getAllActivityInfo = void 0;
const ActivityMongoManager = require("../../../common/dao/mongoDB/ActivityInfoDao");
const commonUtil = require("../../../utils/lottery/commonUtil");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const getAllActivityInfo = async () => {
    return await ActivityMongoManager.findAllActivityInfos();
};
exports.getAllActivityInfo = getAllActivityInfo;
const getOpenActivityInfo = async () => {
    return await ActivityMongoManager.findOpenActivityInfos();
};
exports.getOpenActivityInfo = getOpenActivityInfo;
const saveOrUpdateActivityInfo = async (activityInfo) => {
    try {
        if (!activityInfo) {
            return false;
        }
        activityInfo.updateTime = Date.now();
        if (!activityInfo.id) {
            activityInfo.id = commonUtil.generateID();
            activityInfo.createTime = Date.now();
        }
        let list = [];
        list.push(activityInfo.contentImg);
        activityInfo.contentImg = list;
        await ActivityMongoManager.saveOrUpdateActivityInfo(activityInfo);
        return true;
    }
    catch (e) {
        logger.error(`ActivityService.insertOrUpdateActivityInfo exception : ${e.stack | e}`);
        return false;
    }
};
exports.saveOrUpdateActivityInfo = saveOrUpdateActivityInfo;
const deleteActivityInfo = async (id) => {
    try {
        if (!id) {
            return false;
        }
        await ActivityMongoManager.deleteActivityInfo(id);
        return true;
    }
    catch (e) {
        logger.error(`ActivityService.deleteActivityInfo exception : ${e.stack | e}`);
        return false;
    }
};
exports.deleteActivityInfo = deleteActivityInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aXZpdHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvaGFsbC9zZXJ2aWNlL0FjdGl2aXR5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvRkFBcUY7QUFDckYsZ0VBQWlFO0FBQ2pFLCtDQUF1QztBQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSTVDLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDekMsT0FBTyxNQUFNLG9CQUFvQixDQUFDLG9CQUFvQixFQUFFLENBQUM7QUFDN0QsQ0FBQyxDQUFDO0FBRlcsUUFBQSxrQkFBa0Isc0JBRTdCO0FBSUssTUFBTSxtQkFBbUIsR0FBRyxLQUFLLElBQUksRUFBRTtJQUMxQyxPQUFPLE1BQU0sb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUM5RCxDQUFDLENBQUM7QUFGVyxRQUFBLG1CQUFtQix1QkFFOUI7QUFLSyxNQUFNLHdCQUF3QixHQUFHLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFBRTtJQUMzRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUU7WUFDbEIsWUFBWSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDeEM7UUFDRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNuQyxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMvQixNQUFNLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0RixPQUFPLEtBQUssQ0FBQztLQUNoQjtBQUNMLENBQUMsQ0FBQztBQW5CVyxRQUFBLHdCQUF3Qiw0QkFtQm5DO0FBS0ssTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsRUFBVSxFQUFFLEVBQUU7SUFDbkQsSUFBSTtRQUNBLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDTCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELE1BQU0sb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFbEQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQyxDQUFDO0FBWlcsUUFBQSxrQkFBa0Isc0JBWTdCIn0=