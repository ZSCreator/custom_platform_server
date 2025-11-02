"use strict";

// 德州机器人进入
import FFF_DzRobot from "./FFF_DzRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import robotGoldUtil = require('../../../../utils/robot/robotGoldUtil');
const nid = '40';

import dzRoomMgr from '../dzRoomMgr';



export function robotEnterDZ(Mode_IO = false) {
  const RoomMgr = dzRoomMgr;
  const robotManger = new RobotManger();
  robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
  robotManger.start();
  return robotManger;
}
// 单个德州机器人进入
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
  if (!player) {
    return;
  }
  const Dz_robot_obj = new FFF_DzRobot({ Mode_IO, }); //创建一个机器人对象
  try {
    Dz_robot_obj.registerListener(); //监听所有通知
    // 登录到大厅
    if (Mode_IO) {
      await Dz_robot_obj.enterHall(player, nid);
    } else {
      Dz_robot_obj.enterHallMode(player, nid);
    }
    // 调整金币
    Dz_robot_obj.setRobotGoldBeforeEnter(nid, sceneId);
    const currGold = robotGoldUtil.getRanomByWeight(nid, sceneId);

    await Dz_robot_obj.enterGameOrSelectionList(nid, sceneId, roomId, { currGold: currGold });
    await Dz_robot_obj.loaded();
  } catch (error) {
    robotlogger.warn(`dz.robot ==> ${player.uid}|${JSON.stringify(error)}`);
    Dz_robot_obj.destroy();
  }
}
