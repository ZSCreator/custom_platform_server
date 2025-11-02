import { ILifeCycle, Application } from "pinus";
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import AttGameManager from "./lib/AttGameManager";
import { GameControlService } from "../../services/newControl/gameControlService";
import { LimitConfigManager } from "./lib/limitConfigManager";
import roomManager from './lib/roomManager';

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "ATT服务器启动之前");

        await new AttGameManager(GameNidEnum.att).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "ATT服务器启动之后");
        await LimitConfigManager.init();

        await roomManager.init();
        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.att });
        robotServerController.start_robot_server(GameNidEnum.att);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "ATT所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "ATT服务器关闭之前");
    };
}