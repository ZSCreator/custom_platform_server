import { ILifeCycle, Application, pinus } from "pinus";
import qznnMgr from './lib/qznnMgr';
import qznnConst = require('./lib/qznnConst');
import timerService = require('../../services/common/timerService');
import JsonMgr = require('../../../config/data/JsonMgr');
import qznnGameManager from "./lib/qznnGameManager";
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
  return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

  async beforeStartup(app: Application, cb: () => void) {
    console.warn(app.getServerId(), "抢庄牛牛配服务器启动之前");
    await new qznnGameManager(GameNidEnum.qznn).init();
    cb();
  }

  async afterStartup(app: Application, cb: () => void) {
    console.warn(app.getServerId(), "抢庄牛牛配服务器启动之后");

    await qznnMgr.init();
    // 初始化调控
    await GameControlService.getInstance().init({ nid: GameNidEnum.qznn });
    robotServerController.start_robot_server(GameNidEnum.qznn);
    cb();
  }

  afterStartAll(app: Application) {
    console.warn(app.getServerId(), "抢庄牛牛所有服务器启动之后");
  }

  async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
    await timerService.delayServerClose();
    console.warn(app.getServerId(), "抢庄牛牛服务器关闭之前");
    shutDown();
  }
}
