'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import TeenPattiMgr from './lib/TeenPattiMgr';
import * as JsonMgr from '../../../config/data/JsonMgr';
import * as TeenPattiConst from './lib/TeenPattiConst';
import BaiRenGameManager from "./lib/TeenPattiGameManager";
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";

export default function () {
    return new Lifecycle();
}
class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "TeenPatti 配服务器启动之前");
        await new BaiRenGameManager(GameNidEnum.TeenPatti).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), 'TeenPatti !!afterStartup');

        await TeenPattiMgr.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.TeenPatti });
        robotServerController.start_robot_server(GameNidEnum.TeenPatti);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "TeenPatti 所有服务器启动之后");
    };

    beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // TeenPattiMgr.Instance().beforeShutdown();
        console.warn(app.getServerId(), "TeenPatti 服务器关闭之前");
        shutDown();
    };
}
