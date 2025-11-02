'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import mjGameManger from './lib/mjGameManger';
// import * as JsonMgr from '../../../config/data/JsonMgr';
import * as mjConst from './lib/mjConst';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import landGameManager from "./lib/landGameManager";
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameControlService } from "../../services/newControl/gameControlService";

export default function () {
    return new Lifecycle();
}
class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "二人麻将 配服务器启动之前");
        await new landGameManager(GameNidEnum.mj).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), '二人麻将!!afterStartup');

        await mjGameManger.init();
        await GameControlService.getInstance().init({ nid: GameNidEnum.mj });
        robotServerController.start_robot_server(GameNidEnum.mj);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "二人麻将 所有服务器启动之后");
    };

    beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // mjGameManger.Instance().beforeShutdown();
        console.warn(app.getServerId(), "二人麻将 服务器关闭之前");
        shutDown();
    };

}
