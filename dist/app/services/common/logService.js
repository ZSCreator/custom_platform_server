"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHallRoute = exports.logActivityError = exports.logBuildAgentRelation = exports.logAgentError = exports.logLockInfo = exports.UpdateAttrLog = exports.lotteryErrorLog = exports.logSyncLog = void 0;
const pinus_logger_1 = require("pinus-logger");
const pinus_1 = require("pinus");
const LogConst = require("../../consts/logConst");
const CommonUtil = require("../../utils/lottery/commonUtil");
const RoleEnum_1 = require("../../common/constant/player/RoleEnum");
const LotteryErrorLogger = (0, pinus_logger_1.getLogger)(LogConst.FILE_NAME.LOTTERY_ERROR, __filename);
const PlayerUpdateLogger = (0, pinus_logger_1.getLogger)('player_update_log', __filename);
const PlayerGoldLogger = (0, pinus_logger_1.getLogger)('player_update_gold', __filename);
const PlayerRmbLogger = (0, pinus_logger_1.getLogger)('player_update_addRmb', __filename);
const LockInfoLog = (0, pinus_logger_1.getLogger)('lock_info', __filename);
const agentErrorLogger = (0, pinus_logger_1.getLogger)('agent_error', __filename);
const buildAgentRelationLog = (0, pinus_logger_1.getLogger)('build_relation_log', __filename);
const syncLog = (0, pinus_logger_1.getLogger)('sync_log', __filename);
const activityError = (0, pinus_logger_1.getLogger)('activity_error', __filename);
const hallRoute = (0, pinus_logger_1.getLogger)('hall_route', __filename);
function logSyncLog(msg) {
    syncLog.info(msg);
}
exports.logSyncLog = logSyncLog;
;
function lotteryErrorLog(errorHead, errorMessage) {
    LotteryErrorLogger.error(`${errorHead}|错误：${errorMessage}`);
}
exports.lotteryErrorLog = lotteryErrorLog;
;
function UpdateAttrLog(valueType, player, updateAttrs) {
    if (player.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
        return;
    }
    let logTag;
    if (valueType === LogConst.PLAYER_VALUE_TYPE.PARAM) {
        logTag = 'param';
    }
    else if (valueType === LogConst.PLAYER_VALUE_TYPE.TO_BE_UPDATE) {
        logTag = 'updating';
    }
    else {
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
    }
    else if (updateAttrs.includes('addRmb')) {
        logger = PlayerRmbLogger;
    }
    if (logger) {
        const logTail = !player.gold ? '无金币字段或金币字段非法' : `${typeof player.gold}|${typeof player.gold}`;
        logger.info(`${logTag}|${player.uid}|${player.gold}|${player.addRmb}|${logTail}`);
    }
}
exports.UpdateAttrLog = UpdateAttrLog;
;
function logLockInfo(resourceKey, lock = null) {
    if (lock && lock.attempts > 1) {
        LockInfoLog.info(`${resourceKey}|attempts: ${lock.attempts}|${CommonUtil.getYearMonthDayHourMinuteSeconds(lock.expiration)}`);
    }
    else if (!lock) {
        LockInfoLog.info(`${resourceKey}|加锁失败`);
    }
}
exports.logLockInfo = logLockInfo;
;
function logAgentError(msg) {
    agentErrorLogger.error(msg);
}
exports.logAgentError = logAgentError;
;
function logBuildAgentRelation(msg) {
    buildAgentRelationLog.info(msg);
}
exports.logBuildAgentRelation = logBuildAgentRelation;
;
function logActivityError(msg) {
    activityError.error(msg);
}
exports.logActivityError = logActivityError;
;
function logHallRoute(msg) {
    hallRoute.info(`${pinus_1.pinus.app.getServerId()}|${msg}`);
}
exports.logHallRoute = logHallRoute;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9jb21tb24vbG9nU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBeUM7QUFDekMsaUNBQThCO0FBQzlCLGtEQUFtRDtBQUNuRCw2REFBOEQ7QUFDOUQsb0VBQWlFO0FBQ2pFLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25GLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3RFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sZUFBZSxHQUFHLElBQUEsd0JBQVMsRUFBQyxzQkFBc0IsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN0RSxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM5RCxNQUFNLHFCQUFxQixHQUFHLElBQUEsd0JBQVMsRUFBQyxvQkFBb0IsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMxRSxNQUFNLE9BQU8sR0FBRyxJQUFBLHdCQUFTLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sYUFBYSxHQUFHLElBQUEsd0JBQVMsRUFBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM5RCxNQUFNLFNBQVMsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSXRELFNBQWdCLFVBQVUsQ0FBQyxHQUFXO0lBQ2xDLE9BQU8s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