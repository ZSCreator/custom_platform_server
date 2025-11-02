'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import ttzRoomMgr from './lib/ttzRoomMgr';
import BaiRenGameManager from "./lib/BaiRenGameManager";
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "ttz_zhuang服务器启动之前");

        await new BaiRenGameManager(GameNidEnum.bairenTTZ).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        await ttzRoomMgr.init();
        await GameControlService.getInstance().init({ nid: GameNidEnum.bairenTTZ, bankerGame: true });
        robotServerController.start_robot_server(GameNidEnum.bairenTTZ);
        console.warn(app.getServerId(), "ttz_zhuang服务器启动之后");
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "ttz_zhuang所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // ttzRoomMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "ttz_zhuang服务器关闭之前");
        shutDown();
    };
}