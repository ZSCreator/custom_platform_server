"use strict";

// 斗地主进机器人
import events = require('events');
import hallConst = require("../../../../consts/hallConst");
import robotConst = require("../../../../consts/robotConst");
import commonUtil = require("../../../../utils/lottery/commonUtil");
import robotGoldUtil = require('../../../../utils/robot/robotGoldUtil');
import ldRobot from "./ldRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import JsonConfig = require("../../../../pojo/JsonConfig");
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from '../../../../common/constant/game/GameNidEnum';
const robotlogger = getLogger('robot_out', __filename);
import ldMgr from '../ldMgr';
const nid = GameNidEnum.LuckyDice;


// 机器人开始进入斗地主，只需要注册添加机器人的事件监听器就行
// 注：只能被调用一次，否则会有多个监听器同时执行
export function handleDouDiZhuRobot(Mode_IO = false) {
    // 只需要注册添加机器人事件
    const RoomMgr = ldMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

/**单个机器人进入 */
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    // 创建一个机器人对象
    const ldRobot_ = new ldRobot({Mode_IO,});
    try {
        // 登录到大厅
        if (Mode_IO) {
            await ldRobot_.enterHall(player, nid);
          } else {
            ldRobot_.enterHallMode(player, nid);
          }
        // 调整金币
        ldRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        // 进入游戏
        await ldRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        // 加载
        await ldRobot_.ddzLoaded();
        // 注册监听器
        ldRobot_.registerListener();
    } catch (err) {
        robotlogger.warn(`ld_robot_enter|${sceneId}|${roomId}|${JSON.stringify(err)}`);
        ldRobot_.destroy();
    } finally {
    }
}