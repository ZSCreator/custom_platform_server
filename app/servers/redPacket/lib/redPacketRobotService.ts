import RoomManagerDao from '../../../common/dao/daoManager/Room.manager';
import RobotManger, { enterPl } from "../../../services/robotService/overallController/robotCommonOp";
import { EventEmitter } from "events";
import { RedPacketRobotImpl } from "./RedPacketRobotImpl";
const robotConfigJsonPath = 'robot/bairen/redPacketConfig';
import * as commonUtil from '../../../utils/lottery/commonUtil';
import { RED_PACKET } from '../../../consts/robotConst';
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
/** Mysql */
import SceneManagerDao from "../../../common/dao/daoManager/Scene.manager";
const sceneList = require("../../../../config/data/scenes/redPacket.json")
// import { RedPacketDynamicRoomManager } from "./RedPacketDynamicRoomManager";
import roomManager from "./RedPacketTenantRoomManager";

export function robotEntry(Mode_IO = false) {
  // const roomMgr = RedPacketDynamicRoomManager.getInstance();
  const robotManger = new RobotManger();
  robotManger.registerAddRobotListener(GameNidEnum.redPacket, Mode_IO, singleRobotEnter, roomManager.getAllRooms.bind(roomManager));
  robotManger.start();
  return robotManger;
}

async function singleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {

  if (!player) return;


  // 创建机器人
  const robot = new RedPacketRobotImpl({Mode_IO,});

  try {
    // robot.gold_min = intoGold_arr[0];
    // robot.gold_max = intoGold_arr[1];
    // 登录大厅
    if (Mode_IO) {
      await robot.enterHall(player, nid);
    } else {
      robot.enterHallMode(player, nid);
    }
    // 调整金币
    const gold = robot.setRobotGoldBeforeEnter(nid, sceneId);
    robot.playerGold = gold;
    // 记录初始金币
    robot.initGold = robot.playerGold;
    // const scene = await SceneManagerDao.findOne({ nid, sceneId });
    // if (!scene) throw new Error(`游戏nid:${nid}|初始化机器人时，未获取到对应的场信息`);
    // const { scene } = await sceneController.getSceneAndLock(nid, sceneId, false);
    // 记录对应场基础信息
    const sceneInfo = sceneList.find(sI => sI.id === sceneId);
    robot.entryCond = sceneInfo.entryCond;
    robot.lowBet = sceneInfo.lowBet;
    robot.capBet = sceneInfo.capBet;
    robot.redParketNum = sceneInfo.redParketNum;
    robot.lossRation = sceneInfo.lossRation;
    // robot.guestid = guestid;

    await robot.enterGameOrSelectionList(nid, sceneId, roomId);

    // 初始化机器人对局开始所需信息
    await robot.agentMessage.loaded();
    // 机器人注册游戏所需事件
    robot.registerListener();

  } catch (error) {
    robot.destroy();
  }

}