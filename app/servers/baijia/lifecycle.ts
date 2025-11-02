'use strict';
import { Application, ILifeCycle } from "pinus";
import * as baijiaService from './lib/util/roomUtil';
import * as timerService from '../../services/common/timerService';
import BaijiaMgr, { BaijiaRoomManager } from './lib/BaijiaRoomManagerImpl';
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import BaijiaGameManager from "./lib/BaijiaGameManager";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
    return new Lifecycle();
}
class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "欢乐百人|beforeStartup");

        /**
         * 初始化该游戏的游戏system_games ，场列表 ， 房间列表
         */
        await BaijiaGameManager.init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        console.warn(app.getServerId(), "欢乐百人|afterStartup");
        // BaijiaMgr.Instance();//初始化场
        BaijiaMgr.init();

        await GameControlService.getInstance().init({ nid: GameNidEnum.baijia, bankerGame: true });

        //重置历史开奖记录
        // baijiaService.resetHistory();
        robotServerController.start_robot_server(GameNidEnum.baijia);
        console.warn(app.getServerId(), "欢乐百人|afterStartup");
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "欢乐百人|afterStartAll");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // BaijiaMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "欢乐百人|beforeShutdown");
        shutDown();
    };
}