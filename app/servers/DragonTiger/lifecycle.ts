'use strict';
import {Application, ILifeCycle} from "pinus";
import DragonTigerManager from './lib/DragonTigerRoomMangerImpl';
import DragonTigerGameManager from "./lib/DragonTigerGameManager";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {GameControlService} from "../../services/newControl/gameControlService";

import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import baicaoMgr from "../baicao/lib/baicaoMgr";
import {pinus} from "pinus";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "龙虎斗服务器启动之前");
        await new DragonTigerGameManager(GameNidEnum.DragonTiger).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "龙虎斗服务器启动之后");

        await DragonTigerManager.init();

        // 初始化调控
        await GameControlService.getInstance().init({nid: GameNidEnum.DragonTiger, bankerGame: true});
        robotServerController.start_robot_server(GameNidEnum.DragonTiger);

        cb();
    };

    async afterStartAll(app: Application) {
        console.warn(app.getServerId(), "龙虎斗所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // DragonTigerManager.Instance().beforeShutdown();
        console.warn(app.getServerId(), "龙虎斗服务器关闭之前");
        shutDown();
    };
}