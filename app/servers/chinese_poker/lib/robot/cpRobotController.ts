"use strict";

// 13水 进机器人
import events = require('events');
const EventEmitter = events.EventEmitter;
import robotConst = require("../../../../consts/robotConst");
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import cpRobot from "./cpRobot";
import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);
import chinese_pokerMgr from '../chinese_pokerMgr';
const nid = '45';


/**初始进入机器人 */
export function robotEnterChinesePoke(Mode_IO = false) {
    // 只需要注册添加机器人事件
    const RoomMgr = chinese_pokerMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

/**单个机器人进入 */
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }
    // 创建一个机器人对象
    const robot = new cpRobot({Mode_IO,});
    try {
        // 登录到大厅
        if (Mode_IO) {
            await robot.enterHall(player, nid);
          } else {
            robot.enterHallMode(player, nid);
          }
        // 调整金币
        robot.setRobotGoldBeforeEnter(nid, sceneId);
        // 进入游戏
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        // 加载
        await robot.chinesePokerLoaded();
        // 注册监听器
        robot.registerListener();
    } catch (err) {
        logger.warn(`cpRobotEnter|${robot.uid}|${roomId}|${JSON.stringify(err)}`);
        robot.destroy();
    }
}