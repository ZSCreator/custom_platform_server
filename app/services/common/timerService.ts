'use strict';
import schedule = require('node-schedule');
import fisheryManager = require('../../servers/fishery/lib/FisheryRoomManagerImpl');
import utils = require('../../utils/index');
const TimerService = module.exports;
import caohuajiConst = require('../../servers/caohuaji/lib/caohuajiConst');
import RoomManagerDao from '../../common/dao/daoManager/Room.manager';
import { pinus } from 'pinus';








let awardTimer = {}

//关闭放奖监控
const closeAwardSetInterval = TimerService.closeAwardSetInterval = function (room) {
    const str = 'AWARD_' + room.nid + '' + room.roomId + '';
    console.log('关闭放奖监控', str);
    clearInterval(awardTimer[str]);
}

// //每天凌晨12点清空红黑大战房间开奖记录
// export const clearRoomHistorys = function (nid) {
//     schedule.scheduleJob('0 59 23 * * *', function () {
//         RoomManager.getRoomsOfGame(nid, true).then(room => {
//             room.forEach((m) => {
//                 m.RedBlackHistory = [];
//                 RoomManager.updateOneRoom(m, ['RedBlackHistory']);
//             });
//         });
//     });
// }

/**延迟服务器关闭 */
export const delayServerClose = function (time = 3 * 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve({});
        }, time)
    });
}

//草花机每十分钟执行一次把流水池的钱转入基础奖池
export const caohuajiTimerJackpot = function (nid) {
    // setInterval(() => {
    //     console.log('草花机每20s执行一次把流水池的钱转入基础奖池');
    //       RoomManagerDao.findList({serverId:pinus.app.getServerId()}).then(room => {
    //         room.forEach((m) => {
    //             if (m.runningPool <= 0) {
    //                 return;
    //             }
    //             m.jackpot += m.runningPool;
    //             m.runningPool = 0;
    //             RoomManagerDao.updateOne({serverId:pinus.app.getServerId(),roomId:m.roomId},{jackpot: m.jackpot ,runningPool: m.runningPool });
    //         });
    //     });
    // }, caohuajiConst.JACKPOTTIME);
};


