import { ILifeCycle, Application, pinus } from "pinus";
import dzRoomMgr from './lib/dzRoomMgr';
import BaiRenGameManager from "./lib/BaiRenGameManager";
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
    console.warn(app.getServerId(), "德州匹配服务器启动之前");
    await new BaiRenGameManager(GameNidEnum.dzpipei).init();
    cb();
  }

  async afterStartup(app: Application, cb: () => void) {

    console.warn(app.getServerId(), "德州匹配服务器启动之后");

    // 初始化调控
    await GameControlService.getInstance().init({ nid: GameNidEnum.dzpipei, bankerGame: true });
    //初始化场
    dzRoomMgr.init();

    robotServerController.start_robot_server(GameNidEnum.dzpipei);
    cb();
  }

  afterStartAll(app: Application) {
    console.warn(app.getServerId(), "德州匹配所有服务器启动之后");
  }

  async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
    await timerService.delayServerClose();
    // dzRoomMgr.Instance().beforeShutdown();
    console.warn(app.getServerId(), "德州匹配服务器关闭之前");
    shutDown();
  }
}
