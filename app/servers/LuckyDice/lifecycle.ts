'use strict';
import { ILifeCycle, Application } from "pinus";
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import ldGameManager from "./lib/ldGameManager";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import ldMgr from './lib/ldMgr';
import { GameControlService } from "../../services/newControl/gameControlService";
export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "幸运骰子 配服务器启动之前");
        await new ldGameManager(GameNidEnum.LuckyDice).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "幸运骰子 配服务器启动之后");

        await ldMgr.init();
        await GameControlService.getInstance().init({ nid: GameNidEnum.LuckyDice });
        robotServerController.start_robot_server(GameNidEnum.LuckyDice);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "幸运骰子 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // ldMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "幸运骰子 服务器关闭之前");
        shutDown();
    };
}