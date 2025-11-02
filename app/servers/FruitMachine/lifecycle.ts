import {Application, ILifeCycle} from "pinus";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import BaiRenGameManager from "./lib/BaiRenGameManager";
import {LimitConfigManager} from "./lib/limitConfigManager";
import {GameControlService} from "../../services/newControl/gameControlService";
import timerService = require('../../services/common/timerService');
import roomManager from "./lib/roomManager";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "水果机服务器启动之前");

        await new BaiRenGameManager(GameNidEnum.FruitMachine).init();
        cb();
    }

    async afterStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "水果机服务器启动之后");
        await GameControlService.getInstance().init({nid: GameNidEnum.FruitMachine});
        await LimitConfigManager.init();

        // 房间初始化
        await roomManager.init();
        cb();
    }

    afterStartAll(app: Application) {
        console.log(app.getServerId(), "水果机所有服务器启动之后");
    }

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {

        await timerService.delayServerClose();
        // fisheryRoomManager.Instance().beforeShutdown();
        console.log(app.getServerId(), "水果机服务器关闭之前");
        shutDown();
    }

}