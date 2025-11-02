import {ILifeCycle, Application} from "pinus";
import gameManager from "./lib/gameManager";
import {GameControlService} from "../../services/newControl/gameControlService";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {LimitConfigManager} from "./lib/limitConfigManager";
import roomManager from "./lib/roomManager";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.warn('冰球突破启动之前')
        await gameManager.getInstance().init();
        return cb();
    }

    async afterStartup(app: Application, cb: () => void) {
        console.warn('冰球突破启动之后');
        // 初始化调控
        await GameControlService.getInstance().init({nid: GameNidEnum.IceBall});
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
