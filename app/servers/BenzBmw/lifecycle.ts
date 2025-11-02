'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import benzRoomMgr from './lib/benzRoomMgr';
import benzGameManager from "./lib/benzGameManager";
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "BenzBmw|服务器启动之前");
        await new benzGameManager(GameNidEnum.BenzBmw).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        await benzRoomMgr.init();
        await GameControlService.getInstance().init({ nid: GameNidEnum.BenzBmw });
        robotServerController.start_robot_server(GameNidEnum.BenzBmw);
        console.warn(app.getServerId(), "BenzBmw|服务器启动之后");
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "BenzBmw|所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // benzRoomMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "BenzBmw|服务器关闭之前");
        shutDown();
    };
}