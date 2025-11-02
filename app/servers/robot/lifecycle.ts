'use strict';
import { ILifeCycle, Application } from "pinus";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
// 机器人服务器生命周期
import robotServerController = require('./lib/robotServerController');



export default function () {
    return new Lifecycle();
}


class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), '!!beforeStartup');
        return cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), '!!afterStartup');
        await robotServerController.robot_Controller.stop();
        await robotServerController.afterRobotServerStarted();
        return cb();
    };

    async afterStartAll(app: Application) {
        // 启动机器人
        // robotServerController.start_robot_server(GameNidEnum.dzpipei, true, 1);
        console.warn(app.getServerId(), "==================机器人所有服务器启动之后==============");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await robotServerController.robot_Controller.stop();
        console.warn("机器人服务器关闭之前");
        // return shutDown();
    };
}
