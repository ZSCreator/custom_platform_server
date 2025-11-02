'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import ErbaMgr from './lib/ErbaRoomMgr';
import utils = require('../../utils/index');
import BaiRenGameManager from "./lib/ErbaGameManager";
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "Erba|服务器启动之前");

        await new BaiRenGameManager(GameNidEnum.Erba).init();
        ErbaMgr.init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        // await ErbaMgr.initAfterServerStart(app);
        await GameControlService.getInstance().init({ nid: GameNidEnum.Erba, bankerGame: false });
        robotServerController.start_robot_server(GameNidEnum.Erba);
        console.warn(app.getServerId(), "Erba|服务器启动之后");
        setInterval(() => {
            const roomList = ErbaMgr.getAllRooms();
            let num = roomList.filter(c => c.status == "INWAIT");
            for (const roomInfo of roomList) {
                if (roomInfo.status != "INWAIT" && Date.now() - roomInfo.startGameTime >= 60 * 1000 * 2) {
                    console.warn(num.length, roomInfo.roomId, roomInfo.status, utils.cDate(roomInfo.startGameTime), utils.cDate());
                }

            }

            // }
        }, 1000)
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "Erba|所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // ErbaMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "|Erba服务器关闭之前");
        shutDown();
    };
}