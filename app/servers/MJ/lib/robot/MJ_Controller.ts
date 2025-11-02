"use strict";

// 比牌牛牛进机器人
import events = require('events');
const EventEmitter = events.EventEmitter;
import MJRobot from "./MJRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import SceneManagerDao from '../../../../common/dao/daoManager/Scene.manager';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

import mjGameManger from '../mjGameManger';
const nid = '13';


// 机器人进入三张牌游戏
export function robotEnter(Mode_IO = false) {
    // 注册添加机器人事件
    const RoomMgr = mjGameManger;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }
    // 创建一个机器人对象
    const MJRobot_ = new MJRobot({Mode_IO,});
    try {
        // 登录到大厅
        if (Mode_IO) {
            await MJRobot_.enterHall(player, nid);
          } else {
            MJRobot_.enterHallMode(player, nid);
          }
        // 调整金币
        MJRobot_.setRobotGoldBeforeEnter(nid, sceneId);

        // const scene = await SceneManagerDao.findOne({ nid, sceneId });
        // if (!scene) {
        //     throw `biPaiSingleRobotEnter 未获取到场信息`;
        // }
        // 进入条件
        // MJRobot_.entryCond = scene.entryCond;

        await MJRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        // 注册监听器
        MJRobot_.registerListener();
        // 加载
        await MJRobot_.Loaded();
    } catch (error) {
        robotlogger.warn(`MJ SingleRobotEnter|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        MJRobot_.destroy();
    }
}