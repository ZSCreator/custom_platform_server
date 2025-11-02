'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import timerService = require('../../services/common/timerService');
import RedBlackConst = require('./lib/RedBlackConst');
import RedBlackMgr from './lib/RedBlackMgr';
import RedBlackGameManager from './lib/RedBlackGameManager';
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');

import JsonMgr = require('../../../config/data/JsonMgr');
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "红黑大战服务器启动之前");

        /**
         * 初始化游戏以及房间和场
         */
        await new RedBlackGameManager(GameNidEnum.RedBlack).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "红黑大战服务器启动之后");

        RedBlackMgr.init();
        robotServerController.start_robot_server(GameNidEnum.RedBlack);

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.RedBlack });
        cb();
    }

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "红黑大战所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // RedBlackMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "红黑大战服务器关闭之前");
        shutDown();
    };
}