import { ILifeCycle, Application } from "pinus";
import timerService = require("../../services/common/timerService");
// 机器人服务器生命周期
import robotServerController = require("../robot/lib/robotServerController");
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
import { BlackJackDynamicRoomManager } from "./lib/BlackJackDynamicRoomManager";
import { getLogger } from 'pinus-logger';
import BlackJackTenantRoomManager from "./lib/BlackJackTenantRoomManager";

const logger = getLogger('server_out', __filename);


export default function () {
  return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
  async beforeStartup(app: Application, cb: () => void) {
    console.log(app.getServerId(), "21点服务器启动之前");

    // await new BlackJackGameManagerImpl(GameNidEnum.BlackJack).init();
    cb();
  }
  async afterStartup(app: Application, cb: () => void) {
    console.log(app.getServerId(), "21点服务器启动之后");

    // await BlackJackRoomManagerImpl.Instance().initAfterServerStart(app);
    await BlackJackDynamicRoomManager
      .getInstance()
      .init();
    /* 
  roomManager.changDesestroyTime(120e3); */
    await BlackJackTenantRoomManager.init();
    // 初始化调控
    await GameControlService.getInstance().init({ nid: GameNidEnum.BlackJack });

    robotServerController.start_robot_server(GameNidEnum.BlackJack);
    cb();
  }

  afterStartAll(app: Application) {
    console.log(app.getServerId(), "21点所有服务器启动之后");
  }

  async beforeShutdown(
    app: Application,
    shutDown: () => void,
    cancelShutDownTimer: () => void
  ) {
    await timerService.delayServerClose();
    console.log(app.getServerId(), "21点服务器关闭之前");
    shutDown();
  }
}
