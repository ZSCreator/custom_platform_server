import { ILifeCycle, Application } from "pinus";
import XiYouJiGameManager from "./lib/XiYouJiGameManager";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import {GameControlService} from "../../services/newControl/gameControlService";
import {LimitConfigManager} from "./lib/limitConfigManager";
import roomManager from './lib/roomManager';

export default function () {
    return new Lifecycle();
}
class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {

        /**
         * 初始化游戏以及房间和场
         */
        await new XiYouJiGameManager(GameNidEnum.xiyouji).init();
        return cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "猴王传奇 所有服务器启动");

        // 初始化调控
        await GameControlService.getInstance().init({nid: GameNidEnum.xiyouji});
        await LimitConfigManager.init();

        // 房间初始化
        await roomManager.init();
    };

    afterStartAll(app: Application) {
        console.log(app.getServerId(), "猴王传奇 所有服务器启动之后");
    };
    // 服务器关闭前
    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        // 服务器关闭前保存所有奖池
        await roomManager.saveAllRoomsPool();
        shutDown();
    };
}