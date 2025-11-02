"use strict";

// 21点进机器人
import { BlackJackRobotImpl } from "./BlackJackRobotImpl";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import robotConst = require("../../../../consts/robotConst");
import * as commonUtil from '../../../../utils/lottery/commonUtil';
const EventEmitter = require('events').EventEmitter;
import { BairenNidEnum } from "../../../../common/constant/game/BairenNidEnum";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
const nid = BairenNidEnum.BlackJack;
// import { BlackJackDynamicRoomManager } from "../BlackJackDynamicRoomManager";
import roomManager from "../BlackJackTenantRoomManager";
import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";


export function robotEnterDot(Mode_IO = false) {
    // const roomMgr = BlackJackDynamicRoomManager.getInstance();
    // 注册添加机器人事件
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(GameNidEnum.BlackJack, Mode_IO, singleRobotEnter, roomManager.getAllRooms.bind(roomManager));
    robotManger.start();
    return robotManger;
};

async function singleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    // return;
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);

    const blackJackRobot = new BlackJackRobotImpl({ Mode_IO, }); //创建一个机器人对象

    try {
        blackJackRobot.gold_min = intoGold_arr[0];
        blackJackRobot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await blackJackRobot.enterHall(player, nid);
          } else {
            blackJackRobot.enterHallMode(player, nid);
          }

        // 调整金币
        blackJackRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);

        // 进入游戏
        await blackJackRobot.enterGameOrSelectionList(nid, sceneId, roomId);

        const isSuccess = await blackJackRobot.loaded();

        if (isSuccess) {
            blackJackRobot.registerListener(); //监听所有通知
        }
    } catch (error) {
        robotlogger.warn(`blackjack robot ==> ${JSON.stringify(error)}`);
        blackJackRobot.destroy();
    }
}