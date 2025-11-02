import {ILifeCycle, Application} from "pinus";
import PharaohGameManager from "./lib/CandyMoneyGameManager";
import {GameControlService} from "../../services/newControl/gameControlService";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {LimitConfigManager} from "./lib/limitConfigManager";
import roomManager from "./lib/roomManager";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        await PharaohGameManager.getInstance().init();
        return cb();
    }

    async afterStartup(app: Application, cb: () => void) {
        // 初始化调控
        await GameControlService.getInstance().init({nid: GameNidEnum.CandyMoney});
        await LimitConfigManager.init();

        // 房间初始化
        await roomManager.init();
        cb();
    }

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await roomManager.saveAllRoomsPool();
        shutDown();
    }

}
