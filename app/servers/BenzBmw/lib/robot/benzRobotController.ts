"use strict";

// 骰宝创建机器人进游戏
import benzRobot from "./benzRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
const EventEmitter = require('events').EventEmitter;
import robotGoldUtil = require('../../../../utils/robot/robotGoldUtil');
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";
const robotlogger = getLogger('robot_out', __filename);
import * as commonUtil from '../../../../utils/lottery/commonUtil';

import benzRoomMgr from '../benzRoomMgr';


const nid = GameNidEnum.BenzBmw;
export function robotEnterBenzBmw(Mode_IO = false) {
    const RoomMgr = benzRoomMgr;
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

    const benzRobot_ = new benzRobot({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(GameNidEnum.BenzBmw, sceneId) }); //创建一个机器人对象
    try {
        benzRobot_.gold_min = intoGold_arr[0];
        benzRobot_.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await benzRobot_.enterHall(player, GameNidEnum.BenzBmw);
        } else {
            benzRobot_.enterHallMode(player, nid);
        }
        // 调整金币
        benzRobot_.setRobotGoldBeforeEnter(GameNidEnum.BenzBmw, sceneId, intoGold);
        // 进入游戏
        await benzRobot_.enterGameOrSelectionList(GameNidEnum.BenzBmw, sceneId, roomId);
        // 加载一次
        await benzRobot_.Loaded();
        benzRobot_.registerListener(); //监听所有通知
    } catch (error) {
        robotlogger.warn(`BenzBmw|SingleRobotEnter|${GameNidEnum.BenzBmw}|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        benzRobot_.destroy();
    }
}