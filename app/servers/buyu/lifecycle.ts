'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import * as buyuConst from './lib/buyuConst';
import * as JsonMgr from '../../../config/data/JsonMgr';
import fishRoomManger from './lib/BuYuRoomManagerImpl';
import FishGameManger from './lib/fishGameManager';
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameControlService } from "../../services/newControl/gameControlService";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { LimitConfigManager } from "./lib/limitConfigManager";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "捕鱼 服务器启动之前");
        await FishGameManger.getInstance().init();
        cb();
    };
    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "捕鱼 服务器启动之后");

        await LimitConfigManager.init();
        await GameControlService.getInstance().init({ nid: GameNidEnum.buyu });
        await fishRoomManger.init();
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "捕鱼 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // fishRoomManger.Instance().beforeShutdown();
        console.warn(app.getServerId(), "捕鱼 服务器关闭之前");
        shutDown();
    };
}