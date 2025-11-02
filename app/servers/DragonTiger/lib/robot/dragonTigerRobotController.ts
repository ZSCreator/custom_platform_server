"use strict";

// 龙虎斗机器人控制
import robotConst = require("../../../../consts/robotConst");
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import robotGoldUtil = require('../../../../utils/robot/robotGoldUtil');
import DragonTigerRobot from "./dragonTigerRobot";
import * as commonUtil from '../../../../utils/lottery/commonUtil';
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import events = require('events');
const EventEmitter = events.EventEmitter;

const nid = BairenNidEnum.DragonTiger;


import DragonTigerRoomMangerImpl from '../DragonTigerRoomMangerImpl';


export function robotEnterDragonTiger(Mode_IO = false) {
    const RoomMgr = DragonTigerRoomMangerImpl;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};
/**单个机器人进入 */
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const dragonTigerRobot = new DragonTigerRobot({ Mode_IO,betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    try {
        dragonTigerRobot.gold_min = intoGold_arr[0];
        dragonTigerRobot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await dragonTigerRobot.enterHall(player, nid);
          } else {
            dragonTigerRobot.enterHallMode(player, nid);
          }
        // 调整金币
        dragonTigerRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏
        await dragonTigerRobot.enterGameOrSelectionList(nid, sceneId, roomId);

        // 加载
        await dragonTigerRobot.dragonTigerLoaded();
        // 监听所有通知
        dragonTigerRobot.registerListener();
    } catch (err) {
        robotlogger.warn(`dragonTigerRobotController|uid:${dragonTigerRobot.uid}|${JSON.stringify(err)}`);
        dragonTigerRobot.destroy();
    }
}