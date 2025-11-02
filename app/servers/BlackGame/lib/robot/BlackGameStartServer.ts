"use strict";

// 推筒子庄
import BGRobot from "./BGRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
import robotConst = require("../../../../consts/robotConst");
import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";
import * as commonUtil from '../../../../utils/lottery/commonUtil';
const nid = GameNidEnum.BlackGame;

import roomManager from '../BGRoomManager';



export function robotEnterTTZZhuang(Mode_IO = false) {
    const RoomMgr = roomManager;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }
    // let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);

    // 创建一个机器人对象
    const BlackGameRobot = new BGRobot({ Mode_IO, });
    try {
        // BlackGameRobot.gold_min = intoGold_arr[0];
        // BlackGameRobot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await BlackGameRobot.enterHall(player, nid);
          } else {
            BlackGameRobot.enterHallMode(player, nid);
          }
        // 调整金币
        BlackGameRobot.setRobotGoldBeforeEnter(nid, sceneId);
        // 进入游戏、场、房间
        await BlackGameRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await BlackGameRobot.ttzLoaded();
        // 监听所有通知
        BlackGameRobot.registerListener();
    } catch (error) {
        robotlogger.warn(`BlackGame|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        BlackGameRobot.destroy();
    }
}