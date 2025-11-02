'use strict';
import { Application, ILifeCycle } from "pinus";
import SangongMgr from './lib/SangongMgr';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import BaijiaGameManager from "./lib/BaijiaGameManager";
import { GameControlService } from "../../services/newControl/gameControlService";
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "三公服务器启动之前");

        await new BaijiaGameManager(GameNidEnum.sangong).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void): Promise<any> {
        console.warn(app.getServerId(), "三公服务器启动之后");

        await SangongMgr.init();

        //初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.sangong });

        robotServerController.start_robot_server(GameNidEnum.sangong);
        cb();
    };

    async afterStartAll(app: Application) {
        console.warn(app.getServerId(), "三公所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // SangongMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "三公服务器关闭之前");
        shutDown();
    };
}