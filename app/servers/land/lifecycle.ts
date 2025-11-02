'use strict';
import { ILifeCycle, Application } from "pinus";
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import landGameManager from "./lib/landGameManager";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import landMgr from './lib/landMgr';
import { GameControlService } from "../../services/newControl/gameControlService";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "斗地主 配服务器启动之前");
        await new landGameManager(GameNidEnum.land).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "斗地主 配服务器启动之后");
        await GameControlService.getInstance().init({ nid: GameNidEnum.land });
        await landMgr.init();
        robotServerController.start_robot_server(GameNidEnum.land);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "斗地主 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // landMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "斗地主 服务器关闭之前");
        shutDown();
    };
}