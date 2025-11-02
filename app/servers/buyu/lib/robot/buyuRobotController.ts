"use strict";

// 欢乐百人进机器人控制
import buyuRobot from "./buyuRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import events = require('events');
const EventEmitter = events.EventEmitter;
import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";

import BuYuRoomManagerImpl from '../BuYuRoomManagerImpl';


// 百家根据配置加机器人
export function robotEnterbuyu(Mode_IO = false) {
    // 所有打开的房间
    const RoomMgr = BuYuRoomManagerImpl;
    const robotManger = new RobotManger();
    // robotManger.registerAddRobotListener(GameNidEnum.buyu, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    // robotManger.start();
    return robotManger;
};

// 百家单个机器人进入
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold: number[]) {
    if (!player) {
        return;
    }
    const BuyuRobot = new buyuRobot({ Mode_IO, }); //创建一个机器人对象
    try {
        // 登录到大厅
        if (Mode_IO) {
            await BuyuRobot.enterHall(player, nid);
          } else {
            BuyuRobot.enterHallMode(player, nid);
          }
        // 调整金币
        BuyuRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold[0]);
        await BuyuRobot.baiJiaLeLoaded({ roomId: roomId });
        // 监听所有通知
        BuyuRobot.registerListener();
    } catch (error) {
        robotlogger.warn(`baiJiaStartServer.baijiaSingleRobotEnter|${nid}|${BuyuRobot.sceneId}|${BuyuRobot.roomId}|${error.stack || error}`);
        BuyuRobot.destroy();
    }
}