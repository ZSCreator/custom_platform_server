'use strict';
import { Application, ILifeCycle } from "pinus";
import * as timerService from '../../services/common/timerService';
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import roomManager from "./lib/RummyRoomManager";
import RummyGameManager from "./lib/RummyGameManager";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import {GameControlService} from "../../services/newControl/gameControlService";


export default function () {
    return new Lifecycle();
}
class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "Rummy|beforeStartup");

        //创建场，房间
        await new RummyGameManager(GameNidEnum.Rummy).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        /**
         * 初始化该游戏的游戏system_games ，场列表 ， 房间列表
         */
        console.warn(app.getServerId(), "Rummy|afterStartup");

        // 初始化房间且预先运行
        await roomManager.init();
        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.Rummy });
        //开启机器人服务器
        robotServerController.start_robot_server(GameNidEnum.Rummy);
        console.warn(app.getServerId(), "Rummy|afterStartup");
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "Rummy|afterStartAll");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();


        console.warn(app.getServerId(), "Rummy|beforeShutdown");
        shutDown();
    };
}