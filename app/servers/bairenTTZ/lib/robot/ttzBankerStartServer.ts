"use strict";

// 推筒子庄
import TTZRobot from "./ttzRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
import robotConst = require("../../../../consts/robotConst");
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import * as commonUtil from '../../../../utils/lottery/commonUtil';
const nid = BairenNidEnum.ttz_zhuang;
import ttzRoomMgr from '../ttzRoomMgr';


export function robotEnterTTZZhuang(Mode_IO = false) {
    const RoomMgr = ttzRoomMgr;
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

    // 创建一个机器人对象
    const ttzRobot = new TTZRobot({ Mode_IO, });
    try {
        ttzRobot.gold_min = intoGold_arr[0];
        ttzRobot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await ttzRobot.enterHall(player, nid);
          } else {
            ttzRobot.enterHallMode(player, nid);
          }
        // 调整金币
        ttzRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏、场、房间
        await ttzRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await ttzRobot.ttzLoaded();
        // 监听所有通知
        ttzRobot.registerListener();
    } catch (error) {
        robotlogger.warn(`ttz|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        ttzRobot.destroy();
    }
}