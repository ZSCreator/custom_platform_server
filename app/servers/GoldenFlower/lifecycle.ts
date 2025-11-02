'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import gameManger from './lib/GoldenFlowerMgr';
import * as JsonMgr from '../../../config/data/JsonMgr';
import * as zjhConst from './lib/GoldenFlowerConst';
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
        console.warn(app.getServerId(), "炸金花 配服务器启动之前");
        await new BaiRenGameManager(GameNidEnum.GoldenFlower).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), '炸金花!!afterStartup');

        await gameManger.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.GoldenFlower });
        robotServerController.start_robot_server(GameNidEnum.GoldenFlower);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "炸金花 所有服务器启动之后");
    };

    beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // gameManger.Instance().beforeShutdown();
        console.warn(app.getServerId(), "炸金花 服务器关闭之前");
        shutDown();
    };

}
