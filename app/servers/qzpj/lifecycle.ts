import { ILifeCycle, Application, pinus } from "pinus";
import qzpjMgr from './lib/qzpjMgr';
// import qzpjConst = require('./lib/qzpjConst');
// import timerService = require('../../services/common/timerService');
// import JsonMgr = require('../../../config/data/JsonMgr');
import qzpjGameManager from "./lib/qzpjGameManager";
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";


export default function () {
  return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

  async beforeStartup(app: Application, cb: () => void) {
    console.warn(app.getServerId(), "抢庄牌九配服务器启动之前");
    await new qzpjGameManager(GameNidEnum.qzpj).init();
    cb();
  }

  async afterStartup(app: Application, cb: () => void) {
    console.warn(app.getServerId(), "抢庄牌九配服务器启动之后");

    await qzpjMgr.init();
    // 初始化调控
    await GameControlService.getInstance().init({ nid: GameNidEnum.qzpj });
    robotServerController.start_robot_server(GameNidEnum.qzpj);
    cb();
  }

  afterStartAll(app: Application) {
    console.warn(app.getServerId(), "抢庄牌九所有服务器启动之后");
  }

  async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
    // await timerService.delayServerClose();
    console.warn(app.getServerId(), "抢庄牌九服务器关闭之前");
    shutDown();
  }
}
