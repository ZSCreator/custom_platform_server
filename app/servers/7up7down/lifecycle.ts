'use strict';
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import up7RoomMgr from './lib/up7RoomMgr';
import RedBlackGameManager from './lib/up7GameManager';
import { Application, ILifeCycle } from "pinus";
import { GameNidEnum } from '../../common/constant/game/GameNidEnum';
import { GameControlService } from "../../services/newControl/gameControlService";

export default function () {
    return new LifeCycle();
}

class LifeCycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "7up7down 服务器启动之前");

        await new RedBlackGameManager(GameNidEnum.up7down).init();
        cb();
    }

    async afterStartup(app: Application, cb: () => void) {


        await GameControlService.getInstance().init({ nid: GameNidEnum.up7down });
        console.warn(app.getServerId(), "7up7down 服务器启动之后");

        await up7RoomMgr.init();

        robotServerController.start_robot_server(GameNidEnum.up7down);
        cb();
    }

    async afterStartAll(app: Application) {
        console.warn(app.getServerId(), "7up7down 所有服务器启动之后");
    }

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // up7RoomMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "7up7down 服务器关闭之前");
        shutDown();
    }
}
