"use strict";

// 万人金花进机器人
import WanRenJHrobot from "./wrjhRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import * as robotConst from '../../../../consts/robotConst';
import events = require('events');
const EventEmitter = events.EventEmitter;
import * as commonUtil from '../../../../utils/lottery/commonUtil';


import WanrenMgr from '../WanrenMgr';
import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";



export function robotEnterWanRenJinHua(Mode_IO = false) {
    const RoomMgr = WanrenMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(GameNidEnum.WanRenJH, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    if (!player) return;
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    let wrjhRobot = new WanRenJHrobot({Mode_IO,}); //创建一个机器人对象
    try {
        wrjhRobot.gold_min = intoGold_arr[0];
        wrjhRobot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await wrjhRobot.enterHall(player, nid);
          } else {
            wrjhRobot.enterHallMode(player, nid);
          }
        // 调整金币
        wrjhRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏
        await wrjhRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await wrjhRobot.loaded();
        wrjhRobot.registerListener(); //监听所有通知
    } catch (error) {
        robotlogger.warn(`WanRenJinHuaStartServer.wrJinHuaSingleRobotEnter ==> ${error.stack || error.message || JSON.stringify(error)}`);
        wrjhRobot.destroy();
    }
}