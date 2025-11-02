"use strict";

// 骰宝创建机器人进游戏
import up7Robot from "./up7Robot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
const EventEmitter = require('events').EventEmitter;
import robotGoldUtil = require('../../../../utils/robot/robotGoldUtil');
import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);
import up7RoomMgr from '../up7RoomMgr';
import * as commonUtil from '../../../../utils/lottery/commonUtil';
const nid = "3";



export function robotEnterSicbo(Mode_IO = false) {
    // 注册添加机器人事件
    const RoomMgr = up7RoomMgr;
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
    const up7Robot_ = new up7Robot({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) }); //创建一个机器人对象
    try {
        // 登录到大厅
        if (Mode_IO) {
            await up7Robot_.enterHall(player, nid);
          } else {
            up7Robot_.enterHallMode(player, nid);
          }
        // 调整金币
        up7Robot_.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏
        await up7Robot_.enterGameOrSelectionList(nid, sceneId, roomId);
        // 加载一次
        up7Robot_.gold_min = intoGold_arr[0];
        up7Robot_.gold_max = intoGold_arr[1];
        await up7Robot_.Loaded();
        up7Robot_.registerListener(); //监听所有通知
    } catch (error) {
        logger.warn(`up7 SingleRobotEnter|${nid}|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        up7Robot_.destroy();
    }
}