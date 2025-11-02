import {Application, ILifeCycle} from "pinus";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import roomManager from './lib/roomManager';
import {GameControlService} from "../../services/newControl/gameControlService";
import ColorPlateGameManager from "./lib/gameManager";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "Crash 配服务器启动之前");

        // 初始化游戏
        await ColorPlateGameManager.init(GameNidEnum.Crash);
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "Crash 配服务器启动之后");


        // 初始化房间且预先运行
        await roomManager.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.Crash, bankerGame: true });

        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "Crash 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // 关闭房间操作
        // await ColorPlateRoomManager.getInstance(app).beforeShutdown();
        console.warn(app.getServerId(), "Crash 服务器关闭之前");
        shutDown();
    };
}