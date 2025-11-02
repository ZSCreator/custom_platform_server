import { Application, ILifeCycle } from "pinus";
import fisheryRoomManager from './lib/FisheryRoomManagerImpl';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
import { init as fisheryGameInit } from "./lib/gameManager";
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "渔场大亨服务器启动之前");

        // 渔场游戏初始化
        await fisheryGameInit(GameNidEnum.fishery);

        cb();
    }

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "渔场大亨服务器启动之后");

        // 初始化房间并运行
        await fisheryRoomManager.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.fishery });

        robotServerController.start_robot_server(GameNidEnum.fishery);

        cb();
    }

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "渔场大亨所有服务器启动之后");
    }

    async beforeShutdown(app: Application, shutDown: () => void) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "渔场大亨服务器关闭之前");
        shutDown();
    }
}