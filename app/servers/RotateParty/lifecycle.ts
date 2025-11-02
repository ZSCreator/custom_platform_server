import {Application, ILifeCycle} from "pinus";
import RotatePartyGameManager from "./lib/RotatePartyGameManager";
import {GameControlService} from "../../services/newControl/gameControlService";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {LimitConfigManager} from "./lib/limitConfigManager";
import roomManager from "./lib/roomManager";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), 'RotateParty 配服务器启动之前');
        /**
         * 初始化游戏以及房间和场
         */
        await new RotatePartyGameManager(GameNidEnum.RotateParty).init();
        // }
        cb();
    }

    async afterStartup(app: Application, cb: () => void): Promise<any> {
        console.warn(app.getServerId(), 'RotateParty 配服务器启动之后');

        // 初始化调控
        await GameControlService.getInstance().init({nid: GameNidEnum.RotateParty});
        await LimitConfigManager.init();

        // 房间初始化
        await roomManager.init();

        cb();
    };

    async afterStartAll(app: Application) {
        console.log(app.getServerId(), "RotateParty 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        console.log(app.getServerId(), "RotateParty 服务器关闭之前");

        // 保存所有房间的奖池
        await roomManager.saveAllRoomsPool();

        shutDown();
    };
}
