'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import * as BGConst from './lib/BGConst';
import * as JsonMgr from '../../../config/data/JsonMgr';
import roomManager from './lib/BGRoomManager';
import utils = require('../../utils/index');
import BGGameManager from './lib/BGGameManager';
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameControlService } from "../../services/newControl/gameControlService";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        await BGGameManager.getInstance().init();
        console.warn(app.getServerId(), "21点|服务器启动之前");
        cb();
    };
    async afterStartup(app: Application, cb: () => void) {


        await GameControlService.getInstance().init({ nid: GameNidEnum.BlackGame });
        await roomManager.init();
        robotServerController.start_robot_server(GameNidEnum.BlackGame);
        console.warn(app.getServerId(), "21点|服务器启动之后");

        setInterval(() => {
            const roomList = roomManager.getAllRooms();
            // for (const sceneInfo of sceneList) {
            let num = roomList.filter(c => c.status != "INWAIT");
            // console.warn("ddddddd", sceneInfo.id, num.length);
            for (const roomInfo of roomList) {
                if (roomInfo.status != "INWAIT" && Date.now() - roomInfo.lastWaitTime >= 60 * 1000 * 2) {
                    console.warn("BG", num.length, roomInfo.roomId, roomInfo.status, utils.cDate(roomInfo.lastWaitTime), utils.cDate());
                }

            }

            // }
        }, 10 * 1000)

        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "21点|所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // BGMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "21点|服务器关闭之前");
        shutDown();
    };
}