import { ILifeCycle, Application, pinus } from "pinus";
import FCSRoomMgr from './lib/FCSRoomMgr';
import BaiRenGameManager from "./lib/BaiRenGameManager";
import JsonMgr = require('../../../config/data/JsonMgr');
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
export default function () {
  return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

  async beforeStartup(app: Application, cb: () => void) {
    console.warn(app.getServerId(), "梭哈|匹配服务器启动之前");
    await new BaiRenGameManager(GameNidEnum.FiveCardStud).init();
    cb();
  }

  async afterStartup(app: Application, cb: () => void) {

    console.warn(app.getServerId(), "梭哈|匹配服务器启动之后");

    // 初始化调控
    await GameControlService.getInstance().init({ nid: GameNidEnum.FiveCardStud, bankerGame: false });
    //初始化场
    await FCSRoomMgr.init();

    robotServerController.start_robot_server(GameNidEnum.FiveCardStud);
    cb();
  }

  afterStartAll(app: Application) {
    console.warn(app.getServerId(), "梭哈|匹配所有服务器启动之后");
  }

  async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
    await timerService.delayServerClose();
    // FCSRoomMgr.Instance().beforeShutdown();
    console.warn(app.getServerId(), "梭哈|匹配服务器关闭之前");
    shutDown();
  }
}
