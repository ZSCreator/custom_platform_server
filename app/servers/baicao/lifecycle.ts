'use strict';
import { Application, ILifeCycle } from "pinus";
import baicaoMgr, { GameManger } from './lib/baicaoMgr';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import BaijiaGameManager from "./lib/baicaoGameManager";
import { GameControlService } from "../../services/newControl/gameControlService";
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "baicao 服务器启动之前");

        await new BaijiaGameManager(GameNidEnum.baicao).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void): Promise<any> {
        console.warn(app.getServerId(), "baicao 服务器启动之后");

        await baicaoMgr.init();

        //初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.baicao });

        robotServerController.start_robot_server(GameNidEnum.baicao);
        cb();
    };

    async afterStartAll(app: Application) {
        console.warn(app.getServerId(), "baicao 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // baicaoMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "baicao 服务器关闭之前");
        shutDown();
    };
}