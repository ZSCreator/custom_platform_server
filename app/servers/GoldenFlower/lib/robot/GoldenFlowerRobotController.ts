"use strict";

// 比牌牛牛进机器人
import events = require('events');
const EventEmitter = events.EventEmitter;
import * as robotConst from "../../../../consts/robotConst";
import ZhaJinHuaRobot from "./GoldenFlowerRobot";
import FFFGoldenFlowerRobot from "./FFFGoldenFlowerRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import SceneManagerDao from '../../../../common/dao/daoManager/Scene.manager';
import { getLogger } from 'pinus-logger';
import GoldenFlowerMgr from '../GoldenFlowerMgr';
import { GameNidEnum } from '../../../../common/constant/game/GameNidEnum';
const robotlogger = getLogger('robot_out', __filename);


// 机器人进入三张牌游戏
export function robotEnterZhaJinHua(Mode_IO = false) {
    // 注册添加机器人事件
    const RoomMgr = GoldenFlowerMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(GameNidEnum.GoldenFlower, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }
    // 创建一个机器人对象
    const zhaJinHuaRobot = new FFFGoldenFlowerRobot({ Mode_IO, });
    try {
        // 注册监听器
        zhaJinHuaRobot.registerListener();
        // 登录到大厅
        if (Mode_IO) {
            await zhaJinHuaRobot.enterHall(player, nid);
        } else {
            zhaJinHuaRobot.enterHallMode(player, nid);
        }
        // 调整金币
        zhaJinHuaRobot.setRobotGoldBeforeEnter(nid, sceneId);
        await zhaJinHuaRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        // 加载
        await zhaJinHuaRobot.zhaJinHuaLoaded();
    } catch (error) {
        robotlogger.warn(`JHSingleRobotEnter|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        zhaJinHuaRobot.destroy();
    }
}
