import {Application, ILifeCycle} from "pinus";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import AndarBaharRoomManager from './lib/roomManager';
import {GameControlService} from "../../services/newControl/gameControlService";
import AndarBaharGameManager from "./lib/gameManager";
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "猜AB 配服务器启动之前");

        // 初始化游戏
        await AndarBaharGameManager.init(GameNidEnum.andarBahar);
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "猜AB 配服务器启动之后");

        // 初始化房间且预先运行
        await AndarBaharRoomManager.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.andarBahar });

        // 进机器人
        robotServerController.start_robot_server(GameNidEnum.andarBahar);
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "猜AB 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // 关闭房间操作
        // await AndarBaharRoomManager.getInstance(app).beforeShutdown();
        console.warn(app.getServerId(), "猜AB 服务器关闭之前");
        shutDown();
    };
}