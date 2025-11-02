import {ILifeCycle, Application} from "pinus";
import ScratchGameManager from "./lib/ScratchGameManager";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {GameControlService} from "../../services/newControl/gameControlService";
import roomManager from "./lib/roomManager";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    /**
     * 启动服务器之前
     * @param app
     * @param cb
     */
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "刮刮乐服务器启动之前");
        /**
         * 初始化游戏以及房间和场
         */
        await new ScratchGameManager(GameNidEnum.Scratch).init();
        cb();
    };

    /**
     * 启动服务器之后
     * @param app
     * @param cb
     */
    async afterStartup(app: Application, cb: () => void) {
        await GameControlService.getInstance().init({ nid: GameNidEnum.Scratch});

        // 房间初始化
        await roomManager.init();


        console.warn(app.getServerId(), "刮刮乐服务器启动之后");
        cb();
    }

    afterStartAll(app: Application): void {
        console.log(app.getServerId(), '!!after start all');
    }

    // 服务器关闭前
    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        console.log("刮刮乐服务器关闭之前");
        // SangongMgr.Instance().beforeShutdown();
        shutDown();
    };
}