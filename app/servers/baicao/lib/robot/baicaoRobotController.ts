"use strict";

// 三公进机器人
import events = require('events');
import * as robotConst from "../../../../consts/robotConst";
import baicaoRobot from "./baicaoRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

import baicaoMgr from '../baicaoMgr';

const nid = '2';


export function robotEnterSanGong(Mode_IO = false) {
    const RoomMgr = baicaoMgr;
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
    const robot = new baicaoRobot({ Mode_IO, });
    try {
        // 登录到大厅
        if (Mode_IO) {
            await robot.enterHall(player, nid);
          } else {
            robot.enterHallMode(player, nid);
          }
        // 调整金币
        robot.setRobotGoldBeforeEnter(nid, sceneId);
        // 记下初始金币
        robot.initGold = robot.playerGold;
        // 进入游戏
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        // 加载
        await robot.sanGongLoaded();
        // 注册监听器
        robot.registerListener();

    } catch (err) {
        robotlogger.warn(`baicao|leRobotEnter|${sceneId}|${roomId}|${JSON.stringify(err)}`);
        robot.destroy();
    }
}