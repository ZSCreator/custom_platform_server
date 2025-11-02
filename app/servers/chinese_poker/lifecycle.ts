'use strict';
import { ILifeCycle, Application, pinus } from "pinus";

import zhangMgr13 from './lib/chinese_pokerMgr';
import * as JsonMgr from '../../../config/data/JsonMgr';
import * as ChineseConst from './lib/cpConst';
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import BaijiaGameManager from "./lib/BaijiaGameManager";
import { GameControlService } from "../../services/newControl/gameControlService";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "13张服务器启动之前");
        await new BaijiaGameManager(GameNidEnum.ChinesePoker).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "13张服务器启动之后");

        zhangMgr13.init();
        robotServerController.start_robot_server(GameNidEnum.ChinesePoker);

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.ChinesePoker });
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "13张所有服务器启动之后");
    };

    beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // zhangMgr13.Instance().beforeShutdown();
        console.warn(app.getServerId(), "13张服务器关闭之前");
        shutDown();
    };
}