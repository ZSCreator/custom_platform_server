'use strict';
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import SicBoRoomMgr from './lib/SicBoRoomMgr';
import RedBlackGameManager from './lib/SicBoGameManager';
import {Application, ILifeCycle} from "pinus";
import {GameNidEnum} from '../../common/constant/game/GameNidEnum';
import {GameControlService} from "../../services/newControl/gameControlService";

export default function () {
    return new LifeCycle();
}

class LifeCycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "骰宝服务器启动之前");

        await new RedBlackGameManager(GameNidEnum.SicBo).init();
        cb();
    }

    async afterStartup(app: Application, cb: () => void) {



        GameControlService.getInstance().init({nid: GameNidEnum.SicBo});
        console.log(app.getServerId(), "骰宝服务器启动之后");

        await SicBoRoomMgr.init();

        robotServerController.start_robot_server(GameNidEnum.SicBo);
        cb();
    }

    async afterStartAll(app: Application) {
        console.log(app.getServerId(), "骰宝所有服务器启动之后");
    }

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // SicBoRoomMgr.Instance().beforeShutdown();
        console.log(app.getServerId(), "骰宝服务器关闭之前");
        shutDown();
    }
}
