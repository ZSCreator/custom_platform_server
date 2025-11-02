'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOneDaySystemGiveGold = exports.getOneDaySystemGiveGold = void 0;
const HallConst = require("../consts/hallConst");
const RedisManager = require("../common/dao/redis/lib/redisManager");
const JsonMgr = require("../../config/data/JsonMgr");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const getOneDaySystemGiveGold = async () => {
    try {
        const systemGiveGoldObj = await RedisManager.getObjectFromRedis(HallConst.GIVE_GOLD_COUNT) ||
            JsonMgr.get('systemGiveGold').datas;
        return Promise.resolve(systemGiveGoldObj.gold);
    }
    catch (e) {
        Logger.info(`StatGoldService.getOneDaySystemGiveGold ==> 错误: ${e}`);
        return Promise.resolve(0);
    }
};
exports.getOneDaySystemGiveGold = getOneDaySystemGiveGold;
const removeOneDaySystemGiveGold = async () => {
    try {
        const systemGiveGoldObj = JsonMgr.get('systemGiveGold').datas;
        await RedisManager.setObjectIntoRedisNoExpiration(HallConst.GIVE_GOLD_COUNT, systemGiveGoldObj);
        return Promise.resolve(systemGiveGoldObj.gold);
    }
    catch (e) {
        Logger.info(`StatGoldService.removeOneDaySystemGiveGold ==> 错误: ${e}`);
        return Promise.resolve(0);
    }
};
exports.removeOneDaySystemGiveGold = removeOneDaySystemGiveGold;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdFN5c3RlbUdpdmVHb2xkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9zdGF0U3lzdGVtR2l2ZUdvbGRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7O0FBRVosaURBQWtEO0FBQ2xELHFFQUFzRTtBQUN0RSxxREFBc0Q7QUFDdEQsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFRNUMsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLElBQUksRUFBRTtJQUM5QyxJQUFJO1FBQ0EsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO1lBQ3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDeEMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xEO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLG1EQUFtRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3QjtBQUNMLENBQUMsQ0FBQztBQVRXLFFBQUEsdUJBQXVCLDJCQVNsQztBQU9LLE1BQU0sMEJBQTBCLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDakQsSUFBSTtRQUNBLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5RCxNQUFNLFlBQVksQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDaEcsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xEO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3QjtBQUNMLENBQUMsQ0FBQztBQVRXLFFBQUEsMEJBQTBCLDhCQVNyQyJ9