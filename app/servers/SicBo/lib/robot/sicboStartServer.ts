"use strict";

// 骰宝创建机器人进游戏
import SicboRobot from "./sicboRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import robotConst = require("../../../../consts/robotConst");
const EventEmitter = require('events').EventEmitter;
import robotGoldUtil = require('../../../../utils/robot/robotGoldUtil');
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import * as commonUtil from '../../../../utils/lottery/commonUtil';
const nid = BairenNidEnum.SicBo;

import SicBoRoomMgr from '../SicBoRoomMgr';



export function robotEnterSicbo(Mode_IO = false) {
    const RoomMgr = SicBoRoomMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const sicboRobot = new SicboRobot({Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) }); //创建一个机器人对象
    try {
        sicboRobot.gold_min = intoGold_arr[0];
        sicboRobot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await sicboRobot.enterHall(player, nid);
          } else {
            sicboRobot.enterHallMode(player, nid);
          }
        // 调整金币
        sicboRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏
        await sicboRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        // 加载一次
        await sicboRobot.sicboLoaded();
        sicboRobot.registerListener(); //监听所有通知
    } catch (error) {
        robotlogger.warn(`sicboSingleRobotEnter|${nid}|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        sicboRobot.destroy();
    }
}