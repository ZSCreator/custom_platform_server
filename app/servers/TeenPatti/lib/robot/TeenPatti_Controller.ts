"use strict";

// 比牌牛牛进机器人
import events = require('events');
const EventEmitter = events.EventEmitter;
import TeenPattiRobot from "./TeenPattiRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import SceneManagerDao from '../../../../common/dao/daoManager/Scene.manager';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import TeenPattiMgr from '../TeenPattiMgr';

const nid = '16';


// 机器人进入三张牌游戏
export function robotEnter(Mode_IO = false) {
    const RoomMgr = TeenPattiMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {//|| roomId != "001"
        return;
    }
    // 创建一个机器人对象
    const TeenPattiRobot_ = new TeenPattiRobot({Mode_IO,});
    try {
        // 登录到大厅
        if (Mode_IO) {
            await TeenPattiRobot_.enterHall(player, nid);
          } else {
            TeenPattiRobot_.enterHallMode(player, nid);
          }
        // 调整金币
        TeenPattiRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        // 记下初始金币
        TeenPattiRobot_.initGold = TeenPattiRobot_.playerGold;
        const scene = await SceneManagerDao.findOne({ nid, sceneId });
        if (!scene) {
            throw `biPaiSingleRobotEnter 未获取到场信息`;
        }
        // 进入条件
        TeenPattiRobot_.entryCond = scene.entryCond;
        // TeenPattiRobot_.multipleLimit = scene.multipleLimit;
        TeenPattiRobot_.lowBet = scene.lowBet;
        TeenPattiRobot_.betNum = scene.lowBet;

        await TeenPattiRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        // 加载
        await TeenPattiRobot_.Loaded();
        // 注册监听器
        TeenPattiRobot_.registerListener();
    } catch (error) {
        robotlogger.warn(`TeenPatti_Controller|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        TeenPattiRobot_.destroy();
    }
}