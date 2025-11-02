'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import DiceRoomMgr from './lib/DiceRoomMgr';
import utils = require('../../utils/index');
import BaiRenGameManager from "./lib/DiceGameManager";
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "Dice|服务器启动之前");

        await new BaiRenGameManager(GameNidEnum.DicePoker).init();
        DiceRoomMgr.init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        // await DiceRoomMgr.initAfterServerStart(app);
        await GameControlService.getInstance().init({ nid: GameNidEnum.DicePoker, bankerGame: false });
        robotServerController.start_robot_server(GameNidEnum.DicePoker);
        console.warn(app.getServerId(), "DicePoker|服务器启动之后");
        setInterval(() => {
            const roomList = DiceRoomMgr.getAllRooms();
            let num = roomList.filter(c => c.status == "INGAME");
            for (const roomInfo of roomList) {
                if (roomInfo.status != "INWAIT" && Date.now() - roomInfo.startGameTime >= 90 * 1000 * 14) {
                    console.warn(num.length, roomInfo.roomId, roomInfo.status, utils.cDate(roomInfo.startGameTime), utils.cDate());
                }

            }

            // }
        }, 1000)
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "Dice|所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // DiceRoomMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "|Dice 服务器关闭之前");
        shutDown();
    };
}