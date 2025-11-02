'use strict';

// 红包相关的操作
import * as commonUtil from '../../utils/lottery/commonUtil';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

/**
 * 获取幸运红包情况:
 * 1.后台配置未打开幸运红包：openLuckyRedPacket 为 false，仍然显示七日红包；为 true 显示幸运红包
 * 2.后台配置打开幸运红包，inSlot 为 true/false 表示处在/未处在配置时间段；均有 nextSlot，表示配置的下次幸运红包时间段字符串；
 * 3.后台配置打开幸运红包，处在配置阶段，lastOpenRedPacketGold 表示 上次已领的金币；randomGold 表示本次随机的金币；
 *
 * @param: needRandomGold 是否要计算随机金币
 * @return: {openLuckyRedPacket, inSlot, nextSlot, lastOpenRedPacketGold, randomGold}
 * */
export async function getLuckyRedPacketInfo(player, needRandomGold = false) {
    const redPacketInfo = { openLuckyRedPacket: false, nextSlot: '', inSlot: false, lastOpenRedPacketGold: null, randomGold: 0 };
    try {
        // 未充过值，仍然是七日红包
        // if (!player.addRmb) {
        //     return redPacketInfo;
        // }
        // // const systemConfig = await getDataService.getSystemConfig();
        // // 1.有没有开启幸运红包；
        // // 2.时间段是否开放；
        // // 3.是否该时间段已经领过
        // // 4.领取金额
        //
        // // 1.后台未开放幸运红包，仍然是七日红包
        // // if (!systemConfig.openLuckyRedPacket) {
        // //     return redPacketInfo;
        // // }
        // // 2.看时间段
        // // const isNowInAndNextSlot = getCurrAndNextSlot(systemConfig.redPacketTimeSlot);
        // // 返回 undefined，仍然是七日红包
        // if (commonUtil.isNullOrUndefined(isNowInAndNextSlot)) {
        //     return redPacketInfo;
        // }
        // /******显示幸运红包*******/
        // redPacketInfo.openLuckyRedPacket = true;
        // // 下一次开放的时间段字符串
        // redPacketInfo.nextSlot = getStrByTimeSlot(isNowInAndNextSlot.nextTimeSlot);
        // // 当前时间不在开放时间段
        // if (!isNowInAndNextSlot.inSlot) {
        //     redPacketInfo.inSlot = false;
        //     return redPacketInfo;
        // }
        // // 当前时间在开放的时间段内
        // redPacketInfo.inSlot = true;
        // const dateA = new Date().setHours(isNowInAndNextSlot.currTimeSlot[0], isNowInAndNextSlot.currTimeSlot[1], 0, 0);
        // const dateB = new Date().setHours(isNowInAndNextSlot.currTimeSlot[2], isNowInAndNextSlot.currTimeSlot[3], 59, 999);
        // // 当前开放时间已领取过
        // if (player.lastOpenRedPacketTime >= dateA && player.lastOpenRedPacketTime <= dateB) {
        //     redPacketInfo.lastOpenRedPacketGold = player.lastOpenRedPacketGold;
        //     return redPacketInfo;
        // }
        // // 需要计算随机金币的情况
        // if (needRandomGold) {
        //     // 当前开放时间段未领过，根据上次领取时的充值金额和当前总的充值金额，及配置的金额范围来计算本次红包的金额
        //     redPacketInfo.randomGold = randomRedPacketGold(systemConfig.redPacketMoneySetting, player.addRmb, player.lastOpenRedPacketRmb);
        // }
        return redPacketInfo;
    } catch (error) {
        robotlogger.warn(`redPacketController.getLuckyRedPacketInfo|${player.uid}|${error.stack || error.message}`);
        return redPacketInfo;
    }
};

// 根据[2, 10, 3, 30] 获取时间字符串
function getStrByTimeSlot(timeSlot) {
    return `${commonUtil.alignByLength(timeSlot[0])}:${commonUtil.alignByLength(timeSlot[1])}` +
        `-${commonUtil.alignByLength(timeSlot[2])}:${commonUtil.alignByLength(timeSlot[3])}`
}

/**
 * 检查当前是否在开放时间段内，并返回下一次开放的时间段：
 * 当前时间在开放时间段内，返回开放时间段和下一次领红包的时间段
 * 不在开放时间段，值返回下一次领红包的时间段
 * redPacketTimeSlot = [
 *      [12, 0, 13, 0],
 *      [14, 15, 15, 45],
 *      [16, 40, 17, 40],
 * ];
 * */
function getCurrAndNextSlot(redPacketTimeSlot) {
    // redPacketTimeSlot 不是数组，返回 undefined，表示未开放领红包
    if (!Array.isArray(redPacketTimeSlot)) {
        return;
    }
    const timeNotice = { inSlot: false, currTimeSlot: null, nextTimeSlot: null };
    const dateOfNow = new Date();
    const dateA = new Date();
    const dateB = new Date();
    // 记录比当前时间大的最小的时间slot
    let nearestDate = new Date(new Date().setHours(23, 59, 59, 999));
    let nearestSlot;
    // 时间按从早到晚排好序
    redPacketTimeSlot.sort((a, b) => {
        return dateA.setHours(a[0], a[1], 0, 0) - dateB.setHours(b[0], b[1], 0, 0);
    });
    for (let slot of redPacketTimeSlot) {
        if (!Array.isArray(slot) || slot.length !== 4) {
            continue;
        }
        dateA.setHours(slot[0], slot[1], 0, 0);
        dateB.setHours(slot[2], slot[3], 59, 999);
        // 处于配置的时间之内
        if (dateOfNow >= dateA && dateOfNow <= dateB) {
            timeNotice.inSlot = true;
            timeNotice.currTimeSlot = slot;
        }
        if (dateOfNow < dateA && dateA < nearestDate) {
            nearestSlot = slot;
            nearestDate.setHours(slot[0], slot[0], 0, 0);
        }
    }
    // 一轮循环过后，如果 nearestSlot undefined，说明是最晚的时间段之后，则下一次领红包的时间应该是第一个时间段
    if (nearestSlot === undefined) {
        nearestSlot = redPacketTimeSlot[0];
    }
    if (!Array.isArray(nearestSlot) || nearestSlot.length !== 4) {
        return;
    }
    timeNotice.nextTimeSlot = nearestSlot;
    return timeNotice;
}

/**
 * 根据上次领取时的充值金额和当前总的充值金额，及配置的金额范围来计算本次红包的金额:
 * [
 *    {rechargeRange: [0, 1], redPacketRange: [0, 10]}
 *    {rechargeRange: [1, 2], redPacketRange: [10, 100]}
 * ]
 * 注：rechargeRange 的单位是元，redPacketRange 的单位是后端的金币
 * */
function randomRedPacketGold(redPacketMoneySetting, rmbAmount, lastOpenRedPacketRmb) {
    // 单位是分
    let effectiveRmb = rmbAmount;
    if (rmbAmount < 0) {
        return 0
    }
    if (!commonUtil.isNullOrUndefined(lastOpenRedPacketRmb) && Number.isInteger(lastOpenRedPacketRmb)) {
        effectiveRmb -= lastOpenRedPacketRmb;
    }
    // 取整，不然边界的小数找不到合适的范围
    effectiveRmb = (effectiveRmb / 100);
    // 红包的范围
    let redPacketRange;
    let rechargeRange;
    for (let single of redPacketMoneySetting) {
        rechargeRange = single.rechargeRange;
        if (!Array.isArray(rechargeRange) || rechargeRange.length !== 2) {
            continue;
        }
        // 看充值差额是否在设置的充值范围之内
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

// 保存红包发送定时任务，每次重设都取消上次的任务
const redPacketNoticeJob = [];
/**
 * 设置红包到可领时间段的时候通知所有在线的人
 * fromStart：为true 表示来自刚启动的时候，如果刚启动，是不用调用开启和关闭的回调函数的，默认是 false
 * */
export async function resetLuckyRedPacketNotice(fromStart = false) {
    try {
        // 启动的时候，记下处理的大厅服务器id
        // if (fromStart) {
        //     await redisManager.setObjectIntoRedisNoExpiration(activityConst.RED_PACKET_HANDLE_SERVER, pinus.app.getServerId())
        // }
        // // 先把上次设置的任务全部取消掉
        // cancelScheduleJobAndClean();
        // const systemConfig: any = await getDataService.getSystemConfig();
        // // 所有的在线充过值的非机器人
        // const allOnlinePlayer = (await getDataService.getAllOnlinePlayers('uid sid isRobot addRmb lastOpenRedPacketRmb ' +
        //     'lastOpenRedPacketTime lastOpenRedPacketGold')).filter(player => player.isRobot !== RoleEnum.ROBOT && player.addRmb);
        // // 已关闭幸运红包，通知所有人关闭
        // if (!systemConfig || !systemConfig.openLuckyRedPacket) {
        //     // 不是刚启动的时候才需要调用关闭的回调函数
        //     !fromStart && await onCloseLuckyRedPacket(allOnlinePlayer);
        //     return;
        // } else if (!fromStart) {
        //     // 不是刚启动的时候才需要调用打开的回调函数
        //     await onOpenLuckyRedPacket(systemConfig.redPacketTimeSlot, allOnlinePlayer);
        // }
        // let job;
        // // 根据时间段设置通知，时间段的开始和结束都发送通知
        // for (let timeSlot of systemConfig.redPacketTimeSlot) {
        //     if (!Array.isArray(timeSlot) || timeSlot.length !== 4) {
        //         continue;
        //     }
        //     // 设置一到起始/结束时间点，重新发送所有人的红包信息
        //     job = nodeSchedule.scheduleJob(`0 ${timeSlot[1]} ${timeSlot[0]} * * *`, async () => {
        //         await onTimeSettingStartOrEnd(timeSlot);
        //     });
        //     redPacketNoticeJob.push(job);
        //     job = nodeSchedule.scheduleJob(`59 ${timeSlot[3]} ${timeSlot[2]} * * *`, async () => {
        //         await onTimeSettingStartOrEnd(timeSlot);
        //     });
        //     redPacketNoticeJob.push(job);
        //     robotlogger.info(`redPacketController.resetLuckyRedPacketNotice|重设红包信息发送时间：${timeSlot[0]}时${timeSlot[1]}分0秒`);
        //     robotlogger.info(`redPacketController.resetLuckyRedPacketNotice|重设红包信息发送时间：${timeSlot[2]}时${timeSlot[3]}分59秒`);
        // }
        robotlogger.info(`redPacketController.resetLuckyRedPacketNotice|任务数组长度：${redPacketNoticeJob.length}`);
    } catch (error) {
        robotlogger.warn(`redPacketController.resetLuckyRedPacketNotice|${error.stack || error.message}`);
    }
};

// 关闭幸运红包的回调函数
async function onCloseLuckyRedPacket(allOnlinePlayer) {
    await broadcastAndCleanUp(allOnlinePlayer);
}

// 打开幸运红包时的回调函数
async function onOpenLuckyRedPacket(redPacketTimeSlot, allOnlinePlayer) {
    try {
        const { inSlot, currTimeSlot, nextTimeSlot } = getCurrAndNextSlot(redPacketTimeSlot);
        await noticeAll(inSlot, currTimeSlot, nextTimeSlot, allOnlinePlayer)
    } catch (error) {
        return Promise.reject(error);
    }
}

/**设置的时间开始或结束时，重新给所有人发送幸运红包信息 */
async function onTimeSettingStartOrEnd(timeSlot) {
    try {
        // 所有的在线充过值的非机器人
        // const allOnlinePlayer = (await getDataService.getAllOnlinePlayers('uid sid isRobot addRmb lastOpenRedPacketRmb ' +
        //     'lastOpenRedPacketTime lastOpenRedPacketGold')).filter(player => player.isRobot !== RoleEnum.ROBOT && player.addRmb);
        // const systemConfig = await getDataService.getSystemConfig();
        // // 幸运红包已关闭，关闭幸运红包
        // if (!systemConfig || !systemConfig.openLuckyRedPacket) {
        //     // 通知所有人关闭幸运红包
        //     await broadcastAndCleanUp(allOnlinePlayer);
        //     return;
        // }
        // const { inSlot, nextTimeSlot } = getCurrAndNextSlot(systemConfig.redPacketTimeSlot);
        // await noticeAll(inSlot, timeSlot, nextTimeSlot, allOnlinePlayer);
    } catch (error) {
        robotlogger.warn(`redPacketController.onTimeSettingStartOrEnd|${error.stack || error.message}`);
    }
}

/**通知所有人 每日充值红包 */
async function noticeAll(inSlot, currTimeSlot, nextTimeSlot, allOnlinePlayer) {
    try {
        // 返回undefined，报错，关闭幸运红包
        if (commonUtil.isNullOrUndefined(inSlot)) {
            // 通知所有人关闭幸运红包
            await broadcastAndCleanUp(allOnlinePlayer);
            return Promise.reject('未获取到 inSlot 值');
        }
        const nextSlot = getStrByTimeSlot(nextTimeSlot);
        let dateA;
        let dateB;
        // 需要发送的通知
        let redPacketInfo;
        for (let player of allOnlinePlayer) {
            if (!player.addRmb) {
                continue;
            }
            redPacketInfo = { openLuckyRedPacket: true, nextSlot };
            // 当前时间不在开放时间段
            if (!inSlot) {
                redPacketInfo.inSlot = false;
            } else {
                redPacketInfo.inSlot = true;
                // 检查每个人是不是领过了
                dateA = new Date().setHours(currTimeSlot[0], currTimeSlot[1], 0, 0);
                // 此处只要一到 59秒就算结束
                dateB = new Date().setHours(currTimeSlot[2], currTimeSlot[3], 59, 0);
                // 当前开放时间已领取过
                if (player.lastOpenRedPacketTime >= dateA && player.lastOpenRedPacketTime <= dateB) {
                    redPacketInfo.lastOpenRedPacketGold = player.lastOpenRedPacketGold;
                }
            }
            // 发送消息给前端
            // await noticeService.pushMessageToReceiver([{ uid: player.uid, sid: player.sid }], activityConst.RED_PACKET_CHANGED_ROUTE, redPacketInfo)
        }
        robotlogger.info('redPacketController.noticeAll|发送红包信息成功');
    } catch (error) {
        return Promise.reject(error)
    }
}

// 通知所有人关闭幸运红包，并清理数据
async function broadcastAndCleanUp(allOnlinePlayer) {
    try {
        const receiver = allOnlinePlayer.map(player => {
            return { uid: player.uid, sid: player.sid };
        });
        // 通知
        // await noticeService.pushMessageToReceiver(receiver, activityConst.RED_PACKET_CHANGED_ROUTE, { openLuckyRedPacket: false });
        // 取消全部定时任务，清空数组
        cancelScheduleJobAndClean();
    } catch (error) {
        robotlogger.warn(`redPacketController.broadcastAndCleanUp|${error.stack || error.message}`);
    }
}

// 取消全部定时任务，清空数组
function cancelScheduleJobAndClean() {
    // 先把上次设置的任务全部取消掉
    redPacketNoticeJob.forEach(scheduleJob => scheduleJob.cancel());
    // 数组置空
    redPacketNoticeJob.splice(0, redPacketNoticeJob.length);
}

/**供外部调用的通知前端幸运红包信息变了 */
export async function noticeRedPacketChanged(player) {
    try {
        // 重新发送幸运红包信息给前端
        const redPacketInfo = await getLuckyRedPacketInfo(player);
        // 通知
        // await noticeService.pushMessageToReceiver([{ uid: player.uid, sid: player.sid }], activityConst.RED_PACKET_CHANGED_ROUTE, redPacketInfo);
    } catch (error) {
        robotlogger.warn(`noticeRedPacketChanged|${error.stack || error.message}`);
    }
};