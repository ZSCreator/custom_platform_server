'use strict';
import caohuajiConst = require('../servers/caohuaji/lib/caohuajiConst');
import { pinus } from 'pinus';
import { GameNidEnum } from '../common/constant/game/GameNidEnum';


//重置开奖记录
export const resetHistory = async function () {
    // const rooms = await RoomManager.getRoomsOfGame(GameNidEnum.caohuaji, false)
    // rooms.forEach(room => {
    //     room['caohuajiHistory'] = 0;
    //     RoomManager.updateOneRoomFromCluster(pinus.app.getServerId(), room, ['caohuajiHistory'])
    // });
    return true;
}

//判断是不是机器人(需不需要记录日志)
export const isRobotLog = function (isRobot: number) {
    return caohuajiConst.LOG_ISROBOT ? true : isRobot != 2;
}

