import {scheduleJob, cancelJob} from "pinus-scheduler";
import {PoolFactory} from "./PoolFactory";
import * as moment from 'moment';
import {setObjectIntoRedisNoExpiration, getObjectFromRedis} from "../../common/dao/redis/lib/redisManager";

// 定时器配置
const CACHE_KEY = 'control:clear_pools_amount_time_config';

// 默认时间间隔
const DEFAULT_PERIOD = 24 * 60 * 60 * 1000;

// 默认时间参数配置
const DEFAULT_TIME_CONFIG = {
    nextTime: 0,
    period: DEFAULT_PERIOD
};

/**
 * 触发条件
 */
export interface triggerOpts {
    // 下次启动时间
    start: number,
    // 时间间隔
    period: number
}

let jobId: number;

/**
 * 运行
 */
export async function runScheduleJob() {
    const trigger = await getTriggerOpts();
    setScheduleJob(trigger, clearBonusPoolJob);
}

/**
 * 更新运行配置
 * @param trigger
 */
export async function updateTimeConfig(trigger: triggerOpts) {
    const config = DEFAULT_TIME_CONFIG;
    config.nextTime = trigger.start;
    config.period = trigger.period;

    await setObjectIntoRedisNoExpiration(CACHE_KEY, config);
}

/**
 * 获取调控
 */
export async function getTriggerOpts(): Promise<triggerOpts> {
    let timeConfig = await getObjectFromRedis(CACHE_KEY);
    if (!timeConfig) {
        timeConfig = DEFAULT_TIME_CONFIG;
    }

    return {
        start: !timeConfig.nextTime || timeConfig.nextTime < Date.now() ? nextTime() : timeConfig.nextTime,
        period: timeConfig.period
    };
}

/**
 * 清空奖池
 */
export async function clearBonusPoolJob() {
    // 保存记录
    await PoolFactory.saveAllPoolsHistory();
    // 清空
    await PoolFactory.clearAllPoolsAmount();
}

// 默认下次启动时间
function nextTime(day = 1, hours = 0, min = 0, mill = 0) {
    const date = new Date();

    date.setDate(date.getDate() + day);
    date.setHours(hours);
    date.setMinutes(min);
    date.setSeconds(mill);

    return date.getTime();
}

/**
 * 设置调控任务
 * @param trigger    促发条件
 * @param func       运行函数
 * @param funcData   函数参数
 */
function setScheduleJob(trigger: triggerOpts, func: (data?: any) => void, funcData?: any) {
    // 取消以前的定时任务
    if (jobId) {
        cancelJob(jobId);
    }

    console.warn('下次运行时间', moment(trigger.start).format('YYYY年MM月D日 HH:mm:ss'), '时间间隔:', trigger.period);
    jobId = scheduleJob(trigger, func, funcData);
}
