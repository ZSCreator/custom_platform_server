"use strict";

// 红黑机器人控制
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import robotConst = require("../../../../consts/robotConst");
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import events = require('events');
const EventEmitter = events.EventEmitter;
import robotGoldUtil = require('../../../../utils/robot/robotGoldUtil');
import RedBlackRobot from "./redBlackRobot";
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import JsonConfig = require("../../../../pojo/JsonConfig");
import * as commonUtil from '../../../../utils/lottery/commonUtil';
const nid = BairenNidEnum.RedBlack;

import RedBlackMgr from '../RedBlackMgr';



export function robotEnterRedBlack(Mode_IO = false) {

    const RoomMgr = RedBlackMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

// 单个机器人进入
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const redBlackrobot = new RedBlackRobot({ Mode_IO,betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    try {
        redBlackrobot.gold_min = intoGold_arr[0];
        redBlackrobot.gold_max = intoGold_arr[1];

        // 登录到大厅
        if (Mode_IO) {
            await redBlackrobot.enterHall(player, nid);
          } else {
            redBlackrobot.enterHallMode(player, nid);
          }
        // 调整金币
        redBlackrobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏
        await redBlackrobot.enterGameOrSelectionList(nid, sceneId, roomId);

        // 加载
        await redBlackrobot.redBlackLoaded();
        // 监听所有通知
        redBlackrobot.registerListener();
    } catch (err) {
        robotlogger.warn(`redBlackSingleRobotEnter|uid:${redBlackrobot.uid}|${err.stack || err}`);
        redBlackrobot.destroy();
    }
}
