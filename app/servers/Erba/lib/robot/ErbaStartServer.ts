"use strict";

// 推筒子庄
import ErbaRobot from "./ErbaRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
import robotConst = require("../../../../consts/robotConst");
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import * as commonUtil from '../../../../utils/lottery/commonUtil';
import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";
const nid = GameNidEnum.Erba;

import ErbaRoomMgr from '../ErbaRoomMgr';


export function robotEnterErbaZhuang(Mode_IO = false) {
    const RoomMgr = ErbaRoomMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }

    // 创建一个机器人对象
    const ErbaRobot_ = new ErbaRobot({Mode_IO,});
    try {
        // 登录到大厅
        if (Mode_IO) {
            await ErbaRobot_.enterHall(player, nid);
          } else {
            ErbaRobot_.enterHallMode(player, nid);
          }
        // 调整金币
        ErbaRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        // 进入游戏、场、房间
        await ErbaRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        await ErbaRobot_.ErbaLoaded();
        // 监听所有通知
        ErbaRobot_.registerListener();
    } catch (error) {
        robotlogger.warn(`Erba|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        ErbaRobot_.destroy();
    }
}