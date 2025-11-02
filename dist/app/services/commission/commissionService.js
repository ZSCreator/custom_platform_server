'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayCommissionRatio = exports.withdrawCommissionInternal = void 0;
const RedisManager = require("../../common/dao/redis/lib/redisManager");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const withdrawCommissionInternal = async (commission, player, lock) => {
    const withdrawResult = { success: false, remain: 0 };
    try {
        return true;
    }
    catch (error) {
        Logger.error('CommissionService.withdrawCommissionInternal ==>', error);
        lock && await RedisManager.unlock(lock);
        return Promise.resolve(withdrawResult);
    }
};
exports.withdrawCommissionInternal = withdrawCommissionInternal;
const getPlayCommissionRatio = (playCommissionSetting, todayPlayFlowCount) => {
    let flowRange;
    for (let single of playCommissionSetting) {
        flowRange = single.flowRange;
        if (!Array.isArray(flowRange) || flowRange.length !== 2 || typeof flowRange[0] !== 'number' ||
            typeof flowRange[1] !== 'number' || flowRange[0] > flowRange[1]) {
            continue;
        }
        if (todayPlayFlowCount >= flowRange[0] && todayPlayFlowCount <= flowRange[1]) {
            return single.ratio || 0;
        }
    }
    return 0;
};
exports.getPlayCommissionRatio = getPlayCommissionRatio;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWlzc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvY29tbWlzc2lvbi9jb21taXNzaW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLHdFQUF5RTtBQUN6RSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQVc1QyxNQUFNLDBCQUEwQixHQUFHLEtBQUssRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO0lBQ3pFLE1BQU0sY0FBYyxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDckQsSUFBSTtRQTJCQSxPQUFPLElBQUksQ0FBQztLQUNmO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLElBQUksSUFBSSxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQzFDO0FBQ0wsQ0FBQyxDQUFDO0FBbkNXLFFBQUEsMEJBQTBCLDhCQW1DckM7QUE2QkssTUFBTSxzQkFBc0IsR0FBRyxDQUFDLHFCQUFxQixFQUFFLGtCQUFrQixFQUFVLEVBQUU7SUFDeEYsSUFBSSxTQUFTLENBQUM7SUFFZCxLQUFLLElBQUksTUFBTSxJQUFJLHFCQUFxQixFQUFFO1FBQ3RDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVE7WUFDdkYsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDakUsU0FBUztTQUNaO1FBQ0QsSUFBSSxrQkFBa0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQWtCLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzFFLE9BQU8sTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7U0FDNUI7S0FDSjtJQUNELE9BQU8sQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDO0FBZFcsUUFBQSxzQkFBc0IsMEJBY2pDIn0=