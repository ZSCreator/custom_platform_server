import {Application, ILifeCycle} from "pinus";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import roomManager from './lib/roomManager';
import {GameControlService} from "../../services/newControl/gameControlService";
import FanTanGameManager from "./lib/gameManager";
import robotServerController = require('../robot/lib/robotServerController');

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "番摊 配服务器启动之前");
        // 初始化游戏
        await FanTanGameManager.init(GameNidEnum.fanTan);
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "番摊 配服务器启动之后");
        // 初始化房间且预先运行
        await roomManager.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.fanTan});

        // 进机器人
        robotServerController.start_robot_server(GameNidEnum.fanTan);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "番摊 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // 关闭房间操作
        // await FanTanRoomManager.getInstance(app).beforeShutdown();
        console.warn(app.getServerId(), "番摊 服务器关闭之前");
        shutDown();
    };
}