"use strict";

// 德州机器人进入
import { EventEmitter } from 'events';
import robotConst = require("../../../../consts/robotConst");
import FCS_Robot from "./FCS_Robot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from '../../../../common/constant/game/GameNidEnum';
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import utils = require("../../../../utils");
const robotlogger = getLogger('robot_out', __filename);
const nid = GameNidEnum.FiveCardStud;

import FCSRoomMgr, { IsceneMgr } from '../FCSRoomMgr';



export function robotEnterDZ(Mode_IO = false) {
  const RoomMgr = FCSRoomMgr;
  const robotManger = new RobotManger();
  robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
  robotManger.start();
  return robotManger;
};

// 单个德州机器人进入
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
  if (!player) {
    return;
  }
  const FCS_Robot_ = new FCS_Robot({ Mode_IO, }); //创建一个机器人对象
  try {
    // 登录到大厅
    if (Mode_IO) {
      await FCS_Robot_.enterHall(player, nid);
    } else {
      FCS_Robot_.enterHallMode(player, nid);
    }
    // 调整金币
    FCS_Robot_.setRobotGoldBeforeEnter(nid, sceneId);
    let param = { currGold: 0 };
    const sceneInfo: IsceneMgr = getConfiguration('scenes/FiveCardStud').datas.find(scene => scene.id === sceneId);
    let _arr = [
      { group: 0, weight: 1, min: 1, max: 1 },
      { group: 1, weight: 10, min: 1, max: 5 },
      { group: 2, weight: 10, min: 5, max: 10 },
      { group: 3, weight: 20, min: 10, max: 10 },
      { group: 4, weight: 30, min: 10, max: 15 },
      { group: 5, weight: 20, min: 15, max: 20 },
      { group: 6, weight: 9, min: 20, max: 20 },
    ]
    let group = utils.sortProbability_(_arr);
    const G = sceneInfo.lowBet * 10;
    let min = _arr[group].min * G;
    let max = _arr[group].max * G;
    param.currGold = utils.random(min, max);
    // 调整金币
    FCS_Robot_.setRobotGoldBeforeEnter(nid, sceneId);
    await FCS_Robot_.enterGameOrSelectionList(nid, sceneId, roomId, param);
    await FCS_Robot_.loaded();
    FCS_Robot_.registerListener(); //监听所有通知
  } catch (error) {
    robotlogger.warn(`FCS.robot ==> |${FCS_Robot_.playerGold}|${JSON.stringify(error)}`);
    FCS_Robot_.destroy();
  }
}
