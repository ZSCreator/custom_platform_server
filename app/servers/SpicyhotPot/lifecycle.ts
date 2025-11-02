import { ILifeCycle, Application } from "pinus";
import { GameNidEnum } from '../../common/constant/game/GameNidEnum';
import SpicyhotPotGameManager from "./lib/SpicyhotPotGameManager";
import roomManager from "./lib/RoomMgr";
import {GameControlService} from "../../services/newControl/gameControlService";
import {LimitConfigManager} from "./lib/limitConfigManager";

export default function () {
    return new LifeCycle();
}

class LifeCycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "麻辣火锅服务器启动之前");
        await new SpicyhotPotGameManager(GameNidEnum.SpicyhotPot).init();
        cb();
    }

    async afterStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "麻辣火锅服务器启动之后");


        // 初始化调控
        await GameControlService.getInstance().init({nid: GameNidEnum.SpicyhotPot});
        await LimitConfigManager.init();
        await roomManager.init();
    }

    async afterStartAll(app: Application) {
        console.log(app.getServerId(), "麻辣火锅所有服务器启动之后");
    }

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        console.log(app.getServerId(), "麻辣火锅服务器关闭之前");
        shutDown();
    }
}
