"use strict";

// 欢乐百人进机器人控制
import baiJiaRobot from "./baiJiaRobot";
import robotConst = require("../../../../consts/robotConst");
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import events = require('events');
import * as commonUtil from '../../../../utils/lottery/commonUtil';
const EventEmitter = events.EventEmitter;
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);
const nid = BairenNidEnum.baijia;
import roomManager, { BaijiaRoomManager } from '../BaijiaRoomManagerImpl';


export function robotEnterBaijia(Mode_IO = false) {
    const RoomMgr = roomManager;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};
// 百家单个机器人进入
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);

    const baiJiaLeRobot = new baiJiaRobot({ Mode_IO, }); //创建一个机器人对象
    try {
        baiJiaLeRobot.gold_min = intoGold_arr[0];
        baiJiaLeRobot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await baiJiaLeRobot.enterHall(player, nid);
          } else {
            baiJiaLeRobot.enterHallMode(player, nid);
          }
        // 调整金币
        baiJiaLeRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏、场、房间
        await baiJiaLeRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await baiJiaLeRobot.baiJiaLeLoaded();
        // 监听所有通知
        baiJiaLeRobot.registerListener();
    } catch (error) {
        logger.warn(`baijia|SingleRobotEnter|${baiJiaLeRobot.uid}|${JSON.stringify(error)}`);
        baiJiaLeRobot.destroy();
    }
}
