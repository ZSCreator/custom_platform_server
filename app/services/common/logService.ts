// 写log文件
import { getLogger } from 'pinus-logger';
import { pinus } from 'pinus';
import LogConst = require('../../consts/logConst');
import CommonUtil = require('../../utils/lottery/commonUtil');
import { RoleEnum } from '../../common/constant/player/RoleEnum';
const LotteryErrorLogger = getLogger(LogConst.FILE_NAME.LOTTERY_ERROR, __filename);
const PlayerUpdateLogger = getLogger('player_update_log', __filename);
const PlayerGoldLogger = getLogger('player_update_gold', __filename);
const PlayerRmbLogger = getLogger('player_update_addRmb', __filename);
const LockInfoLog = getLogger('lock_info', __filename);
const agentErrorLogger = getLogger('agent_error', __filename);
const buildAgentRelationLog = getLogger('build_relation_log', __filename);
const syncLog = getLogger('sync_log', __filename);
const activityError = getLogger('activity_error', __filename);
const hallRoute = getLogger('hall_route', __filename);


// 缓存和数据库同步日志
export function logSyncLog(msg: string) {
    syncLog.info(msg);
};



// 彩票错误 log
export function lotteryErrorLog(errorHead, errorMessage) {
    LotteryErrorLogger.error(`${errorHead}|错误：${errorMessage}`);
};

// 记录下需要更新的各个属性的值
export function UpdateAttrLog(valueType, player, updateAttrs) {
    // 机器人的不记录
    if (player.isRobot === RoleEnum.ROBOT) {
        return;
    }
    let logTag;
    if (valueType === LogConst.PLAYER_VALUE_TYPE.PARAM) {
        logTag = 'param';
    } else if (valueType === LogConst.PLAYER_VALUE_TYPE.TO_BE_UPDATE) {
        logTag = 'updating';
    } else {
        logTag = 'updated';
    }
    let updateValue = '';
    for (let attr of updateAttrs) {
        updateValue += attr + ':' + JSON.stringify(player[attr]) + '|';
    }
    PlayerUpdateLogger.debug(`${logTag}|${player.uid}|${updateValue}`);
    let logger;
    if (updateAttrs.includes('gold')) {
        logger = PlayerGoldLogger;
    } else if (updateAttrs.includes('addRmb')) {
        logger = PlayerRmbLogger;
    }
    // 如果是更新上述三个字段还需要额外记录一个日志
    if (logger) {
        const logTail = !player.gold ? '无金币字段或金币字段非法' : `${typeof player.gold}|${typeof player.gold}`;
        logger.info(`${logTag}|${player.uid}|${player.gold}|${player.addRmb}|${logTail}`);
    }
};






// 记录加锁成功后锁的信息、或者加锁失败的信息
export function logLockInfo(resourceKey, lock = null) {
    // 只记录大于1次尝试的锁状态
    if (lock && lock.attempts > 1) {
        // 记录资源的名称、尝试次数、锁的过期时间
        LockInfoLog.info(`${resourceKey}|attempts: ${lock.attempts}|${CommonUtil.getYearMonthDayHourMinuteSeconds(lock.expiration)}`);
    } else if (!lock) {
        LockInfoLog.info(`${resourceKey}|加锁失败`);
    }
};

// 记录代理相关的错误
export function logAgentError(msg: string) {
    agentErrorLogger.error(msg);
};

// 记录代理关系日志
export function logBuildAgentRelation(msg: string) {
    buildAgentRelationLog.info(msg);
};

// 记录活动报错
export function logActivityError(msg: string) {
    activityError.error(msg);
};

// 记录幸运红包
// export function logLuckyRedPacketInfo(msg: string) {
//     redPacketInfo.info(msg);
// };

// 记录机器人错误
// export function logRobotError(msg: string) {
//     robotLog.error(`${pinus.app.getServerId}|${msg}`);
// };
// 记录机器人 warn
// export function logRobotWarn(msg: string, level?: string) {
//     if (level && level == 'debug') {
//         robotLog.debug(`${pinus.app.getServerId()}|${msg}`);
//     } else if (level && level == 'info') {
//         robotLog.info(`${pinus.app.getServerId()}|${msg}`);
//     } else if (level && level == 'warn') {
//         robotLog.warn(`${pinus.app.getServerId()}|${msg}`);
//     } else {
//         robotLog.debug(`${pinus.app.getServerId()}|${msg}`);
//     }
// };
// 记录机器人socket错误
// export function robotSocketError(msg: string, level?: string) {
//     if (level && level == 'debug') {
//         robotSocketLog.debug(`${pinus.app.getServerId()}|${msg}`);
//     } else if (level && level == 'info') {
//         robotSocketLog.info(`${pinus.app.getServerId()}|${msg}`);
//     } else if (level && level == 'warn') {
//         robotSocketLog.warn(`${pinus.app.getServerId()}|${msg}`);
//     } else {
//         robotSocketLog.error(`${pinus.app.getServerId()}|${msg}`);
//     }
// };

// monitor 补机器人的记录
// export function robotMonitorLog(msg: string) {
//     addRobotMonitor.info(`${pinus.app.getServerId()}|${msg}`);
// };

// monitor 补机器人的记录
export function logHallRoute(msg: string) {
    hallRoute.info(`${pinus.app.getServerId()}|${msg}`);
};