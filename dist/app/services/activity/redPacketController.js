'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.noticeRedPacketChanged = exports.resetLuckyRedPacketNotice = exports.getLuckyRedPacketInfo = void 0;
const commonUtil = require("../../utils/lottery/commonUtil");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
async function getLuckyRedPacketInfo(player, needRandomGold = false) {
    const redPacketInfo = { openLuckyRedPacket: false, nextSlot: '', inSlot: false, lastOpenRedPacketGold: null, randomGold: 0 };
    try {
        return redPacketInfo;
    }
    catch (error) {
        robotlogger.warn(`redPacketController.getLuckyRedPacketInfo|${player.uid}|${error.stack || error.message}`);
        return redPacketInfo;
    }
}
exports.getLuckyRedPacketInfo = getLuckyRedPacketInfo;
;
function getStrByTimeSlot(timeSlot) {
    return `${commonUtil.alignByLength(timeSlot[0])}:${commonUtil.alignByLength(timeSlot[1])}` +
        `-${commonUtil.alignByLength(timeSlot[2])}:${commonUtil.alignByLength(timeSlot[3])}`;
}
function getCurrAndNextSlot(redPacketTimeSlot) {
    if (!Array.isArray(redPacketTimeSlot)) {
        return;
    }
    const timeNotice = { inSlot: false, currTimeSlot: null, nextTimeSlot: null };
    const dateOfNow = new Date();
    const dateA = new Date();
    const dateB = new Date();
    let nearestDate = new Date(new Date().setHours(23, 59, 59, 999));
    let nearestSlot;
    redPacketTimeSlot.sort((a, b) => {
        return dateA.setHours(a[0], a[1], 0, 0) - dateB.setHours(b[0], b[1], 0, 0);
    });
    for (let slot of redPacketTimeSlot) {
        if (!Array.isArray(slot) || slot.length !== 4) {
            continue;
        }
        dateA.setHours(slot[0], slot[1], 0, 0);
        dateB.setHours(slot[2], slot[3], 59, 999);
        if (dateOfNow >= dateA && dateOfNow <= dateB) {
            timeNotice.inSlot = true;
            timeNotice.currTimeSlot = slot;
        }
        if (dateOfNow < dateA && dateA < nearestDate) {
            nearestSlot = slot;
            nearestDate.setHours(slot[0], slot[0], 0, 0);
        }
    }
    if (nearestSlot === undefined) {
        nearestSlot = redPacketTimeSlot[0];
    }
    if (!Array.isArray(nearestSlot) || nearestSlot.length !== 4) {
        return;
    }
    timeNotice.nextTimeSlot = nearestSlot;
    return timeNotice;
}
function randomRedPacketGold(redPacketMoneySetting, rmbAmount, lastOpenRedPacketRmb) {
    let effectiveRmb = rmbAmount;
    if (rmbAmount < 0) {
        return 0;
    }
    if (!commonUtil.isNullOrUndefined(lastOpenRedPacketRmb) && Number.isInteger(lastOpenRedPacketRmb)) {
        effectiveRmb -= lastOpenRedPacketRmb;
    }
    effectiveRmb = (effectiveRmb / 100);
    let redPacketRange;
    let rechargeRange;
    for (let single of redPacketMoneySetting) {
        rechargeRange = single.rechargeRange;
        if (!Array.isArray(rechargeRange) || rechargeRange.length !== 2) {
            continue;
        }
        if (effectiveRmb >= rechargeRange[0] && effectiveRmb <= rechargeRange[1]) {
            redPacketRange = single.redPacketRange;
            break;
        }
    }
    if (!redPacketRange) {
        return 0;
    }
    return commonUtil.randomFromRange(redPacketRange[0], redPacketRange[1]);
}
const redPacketNoticeJob = [];
async function resetLuckyRedPacketNotice(fromStart = false) {
    try {
        robotlogger.info(`redPacketController.resetLuckyRedPacketNotice|任务数组长度：${redPacketNoticeJob.length}`);
    }
    catch (error) {
        robotlogger.warn(`redPacketController.resetLuckyRedPacketNotice|${error.stack || error.message}`);
    }
}
exports.resetLuckyRedPacketNotice = resetLuckyRedPacketNotice;
;
async function onCloseLuckyRedPacket(allOnlinePlayer) {
    await broadcastAndCleanUp(allOnlinePlayer);
}
async function onOpenLuckyRedPacket(redPacketTimeSlot, allOnlinePlayer) {
    try {
        const { inSlot, currTimeSlot, nextTimeSlot } = getCurrAndNextSlot(redPacketTimeSlot);
        await noticeAll(inSlot, currTimeSlot, nextTimeSlot, allOnlinePlayer);
    }
    catch (error) {
        return Promise.reject(error);
    }
}
async function onTimeSettingStartOrEnd(timeSlot) {
    try {
    }
    catch (error) {
        robotlogger.warn(`redPacketController.onTimeSettingStartOrEnd|${error.stack || error.message}`);
    }
}
async function noticeAll(inSlot, currTimeSlot, nextTimeSlot, allOnlinePlayer) {
    try {
        if (commonUtil.isNullOrUndefined(inSlot)) {
            await broadcastAndCleanUp(allOnlinePlayer);
            return Promise.reject('未获取到 inSlot 值');
        }
        const nextSlot = getStrByTimeSlot(nextTimeSlot);
        let dateA;
        let dateB;
        let redPacketInfo;
        for (let player of allOnlinePlayer) {
            if (!player.addRmb) {
                continue;
            }
            redPacketInfo = { openLuckyRedPacket: true, nextSlot };
            if (!inSlot) {
                redPacketInfo.inSlot = false;
            }
            else {
                redPacketInfo.inSlot = true;
                dateA = new Date().setHours(currTimeSlot[0], currTimeSlot[1], 0, 0);
                dateB = new Date().setHours(currTimeSlot[2], currTimeSlot[3], 59, 0);
                if (player.lastOpenRedPacketTime >= dateA && player.lastOpenRedPacketTime <= dateB) {
                    redPacketInfo.lastOpenRedPacketGold = player.lastOpenRedPacketGold;
                }
            }
        }
        robotlogger.info('redPacketController.noticeAll|发送红包信息成功');
    }
    catch (error) {
        return Promise.reject(error);
    }
}
async function broadcastAndCleanUp(allOnlinePlayer) {
    try {
        const receiver = allOnlinePlayer.map(player => {
            return { uid: player.uid, sid: player.sid };
        });
        cancelScheduleJobAndClean();
    }
    catch (error) {
        robotlogger.warn(`redPacketController.broadcastAndCleanUp|${error.stack || error.message}`);
    }
}
function cancelScheduleJobAndClean() {
    redPacketNoticeJob.forEach(scheduleJob => scheduleJob.cancel());
    redPacketNoticeJob.splice(0, redPacketNoticeJob.length);
}
async function noticeRedPacketChanged(player) {
    try {
        const redPacketInfo = await getLuckyRedPacketInfo(player);
    }
    catch (error) {
        robotlogger.warn(`noticeRedPacketChanged|${error.stack || error.message}`);
    }
}
exports.noticeRedPacketChanged = noticeRedPacketChanged;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkUGFja2V0Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9hY3Rpdml0eS9yZWRQYWNrZXRDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsNkRBQTZEO0FBQzdELCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBV2hELEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsY0FBYyxHQUFHLEtBQUs7SUFDdEUsTUFBTSxhQUFhLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDN0gsSUFBSTtRQTRDQSxPQUFPLGFBQWEsQ0FBQztLQUN4QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osV0FBVyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsTUFBTSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzVHLE9BQU8sYUFBYSxDQUFDO0tBQ3hCO0FBQ0wsQ0FBQztBQW5ERCxzREFtREM7QUFBQSxDQUFDO0FBR0YsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFRO0lBQzlCLE9BQU8sR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDdEYsSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFD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