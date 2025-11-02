// 百人牛牛、彩票牛牛 机器人进游戏
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import BRNNRobot from "./BRNNRobot";
import { getLogger } from 'pinus-logger';
const bairenLogger = getLogger('robot_out', __filename);
import robotConst = require("../../../../consts/robotConst");
import * as commonUtil from '../../../../utils/lottery/commonUtil';
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
const EventEmitter = require('events').EventEmitter;

let nid = BairenNidEnum.bairen;

import BairenMgr from '../BairenRoomManager';

export function robotEnterBRNN(Mode_IO = false) {
    const RoomMgr = BairenMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

// 单个机器人进入
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    // 创建一个机器人对象
    const bullFightRobot = new BRNNRobot({ Mode_IO, });
    try {
        // 登录到大厅
        if (Mode_IO) {
            await bullFightRobot.enterHall(player, nid);
          } else {
            bullFightRobot.enterHallMode(player, nid);
          }
        // 调整金币
        bullFightRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);

        // 进入游戏
        await bullFightRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        bullFightRobot.gold_min = intoGold_arr[0];
        bullFightRobot.gold_max = intoGold_arr[1];
        // 加载
        await bullFightRobot.bullFightLoaded();
        //监听所有通知
        bullFightRobot.registerListener();
    } catch (err) {
        bairenLogger.warn(`BRNN|SingleRobotEnter|uid:${bullFightRobot.uid || player}|${JSON.stringify(err)}`);
        bullFightRobot.destroy();
    }
}
