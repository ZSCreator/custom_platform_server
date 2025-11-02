'use strict';
import { Application, ILifeCycle } from "pinus";
import WanrenMgr from './lib/WanrenMgr';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import BaiRenGameManager from "./lib/BaiRenGameManager";
import { GameControlService } from "../../services/newControl/gameControlService";
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "万人金花服务器启动之前");
        await new BaiRenGameManager(GameNidEnum.WanRenJH).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "万人金花服务器启动之后");



        await GameControlService.getInstance().init({ nid: GameNidEnum.WanRenJH, bankerGame: true });
        await WanrenMgr.init();

        robotServerController.start_robot_server(GameNidEnum.WanRenJH);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "万人金花所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // WanrenMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "万人金花服务器关闭之前");
        shutDown();
    };
}