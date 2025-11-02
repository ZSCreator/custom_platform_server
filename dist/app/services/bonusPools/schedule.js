"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearBonusPoolJob = exports.getTriggerOpts = exports.updateTimeConfig = exports.runScheduleJob = void 0;
const pinus_scheduler_1 = require("pinus-scheduler");
const PoolFactory_1 = require("./PoolFactory");
const moment = require("moment");
const redisManager_1 = require("../../common/dao/redis/lib/redisManager");
const CACHE_KEY = 'control:clear_pools_amount_time_config';
const DEFAULT_PERIOD = 24 * 60 * 60 * 1000;
const DEFAULT_TIME_CONFIG = {
    nextTime: 0,
    period: DEFAULT_PERIOD
};
let jobId;
async function runScheduleJob() {
    const trigger = await getTriggerOpts();
    setScheduleJob(trigger, clearBonusPoolJob);
}
exports.runScheduleJob = runScheduleJob;
async function updateTimeConfig(trigger) {
    const config = DEFAULT_TIME_CONFIG;
    config.nextTime = trigger.start;
    config.period = trigger.period;
    await (0, redisManager_1.setObjectIntoRedisNoExpiration)(CACHE_KEY, config);
}
exports.updateTimeConfig = updateTimeConfig;
async function getTriggerOpts() {
    let timeConfig = await (0, redisManager_1.getObjectFromRedis)(CACHE_KEY);
    if (!timeConfig) {
        timeConfig = DEFAULT_TIME_CONFIG;
    }
    return {
        start: !timeConfig.nextTime || timeConfig.nextTime < Date.now() ? nextTime() : timeConfig.nextTime,
        period: timeConfig.period
    };
}
exports.getTriggerOpts = getTriggerOpts;
async function clearBonusPoolJob() {
    await PoolFactory_1.PoolFactory.saveAllPoolsHistory();
    await PoolFactory_1.PoolFactory.clearAllPoolsAmount();
}
exports.clearBonusPoolJob = clearBonusPoolJob;
function nextTime(day = 1, hours = 0, min = 0, mill = 0) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    date.setHours(hours);
    date.setMinutes(min);
    date.setSeconds(mill);
    return date.getTime();
}
function setScheduleJob(trigger, func, funcData) {
    if (jobId) {
        (0, pinus_scheduler_1.cancelJob)(jobId);
    }
    console.warn('下次运行时间', moment(trigger.start).format('YYYY年MM月D日 HH:mm:ss'), '时间间隔:', trigger.period);
    jobId = (0, pinus_scheduler_1.scheduleJob)(trigger, func, funcData);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvYm9udXNQb29scy9zY2hlZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFBdUQ7QUFDdkQsK0NBQTBDO0FBQzFDLGlDQUFpQztBQUNqQywwRUFBMkc7QUFHM0csTUFBTSxTQUFTLEdBQUcsd0NBQXdDLENBQUM7QUFHM0QsTUFBTSxjQUFjLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRzNDLE1BQU0sbUJBQW1CLEdBQUc7SUFDeEIsUUFBUSxFQUFFLENBQUM7SUFDWCxNQUFNLEVBQUUsY0FBYztDQUN6QixDQUFDO0FBWUYsSUFBSSxLQUFhLENBQUM7QUFLWCxLQUFLLFVBQVUsY0FBYztJQUNoQyxNQUFNLE9BQU8sR0FBRyxNQUFNLGNBQWMsRUFBRSxDQUFDO0lBQ3ZDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBSEQsd0NBR0M7QUFNTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsT0FBb0I7SUFDdkQsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLENBQUM7SUFDbkMsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUUvQixNQUFNLElBQUEsNkNBQThCLEVBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFORCw0Q0FNQztBQUtNLEtBQUssVUFBVSxjQUFjO0lBQ2hDLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBQSxpQ0FBa0IsRUFBQyxTQUFTLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2IsVUFBVSxHQUFHLG1CQUFtQixDQUFDO0tBQ3BDO0lBRUQsT0FBTztRQUNILEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUTtRQUNsRyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07S0FDNUIsQ0FBQztBQUNOLENBQUM7QUFWRCx3Q0FVQztBQUtNLEtBQUssVUFBVSxpQkFBaUI7SUFFbkMsTUFBTSx5QkFBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFFeEMsTUFBTSx5QkFBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDNUMsQ0FBQztBQUxELDhDQUtDO0FBR0QsU0FBUyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUM7SUFDbkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV0QixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBUUQsU0FBUyxjQUFjLENBQUMsT0FBb0IsRUFBRSxJQUEwQixFQUFFLFFBQWM7SUFFcEYsSUFBSSxLQUFLLEVBQUU7UUFDUCxJQUFBLDJCQUFTLEVBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7SUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckcsS0FBSyxHQUFHLElBQUEsNkJBQVcsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pELENBQUMifQ==