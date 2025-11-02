"use strict";

// 推筒子庄
import DiceRobot from "./DiceRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
import robotConst = require("../../../../consts/robotConst");
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import * as commonUtil from '../../../../utils/lottery/commonUtil';
import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";
const nid = GameNidEnum.DicePoker;

import DiceRoomMgr from '../DiceRoomMgr';


export function robotEnterDiceZhuang(Mode_IO = false) {
    const RoomMgr = DiceRoomMgr;
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
    const DiceRobot_ = new DiceRobot({Mode_IO,});
    try {
        // 登录到大厅
        if (Mode_IO) {
            await DiceRobot_.enterHall(player, nid);
          } else {
            DiceRobot_.enterHallMode(player, nid);
          }
        // 调整金币
        DiceRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        // 进入游戏、场、房间
        await DiceRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        await DiceRobot_.DiceLoaded();
        // 监听所有通知
        DiceRobot_.registerListener();
    } catch (error) {
        robotlogger.warn(`Dice|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        DiceRobot_.destroy();
    }
}