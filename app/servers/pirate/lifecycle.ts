import { ILifeCycle, Application } from "pinus";
import BaiRenGameManager from "./lib/PirateGameManager";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
import { getLogger } from "pinus";
import {LimitConfigManager} from "./lib/limitConfigManager";
import roomManager from "./lib/roomManager";
const Logger = getLogger('server_out', __filename);

export default function () {
  return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

  async beforeStartup(app: Application, cb: () => void) {
    Logger.warn(app.getServerId(), "海盗服务器启动之前");

    await new BaiRenGameManager(GameNidEnum.pirate).init();
    cb();
  }

  async afterStartup(app: Application, cb: () => void) {
    await LimitConfigManager.init();

    // 初始化调控
    await GameControlService.getInstance().init({ nid: GameNidEnum.pirate});

    // 房间初始化
    await roomManager.init();

    Logger.warn(app.getServerId(), "海盗服务器启动之后");

    cb();
  }

  afterStartAll(app: Application) {
    Logger.warn(app.getServerId(), "海盗所有服务器启动之后");
  }

  async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
    Logger.warn(app.getServerId(), "海盗服务器关闭之前");

    // 房间初始化
    await roomManager.saveAllRoomsPool();

    shutDown();
  }

}
