import { Application, ILifeCycle } from "pinus";
import { getLogger } from 'pinus-logger';
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
import { RedPacketDynamicRoomManager } from "./lib/RedPacketDynamicRoomManager";
import roomManager from "./lib/RedPacketTenantRoomManager";

const logger = getLogger('server_out', __filename);

export default function () {
  return new LifeCycle();
}

export class LifeCycle implements ILifeCycle {

  async beforeStartup(app: Application, cb: () => void) {

    logger.info(`红包扫雷服务器 ${app.getServerId()} | 启动之前`);
    cb();
  }

  async afterStartup(app: Application, cb: () => void) {
    const serverId = app.getServerId();
    try {

      // await new RedPacketGameManager(GameNidEnum.redPacket).init();
      // 随服务启动完成，初始化游戏"场"信息; 分离 initSceneList() 函数：用于“运行时”动态加载最新配置信息
      // const roomManager = RedPacketRoomManager.Instance();

      // await roomManager.initAfterServerStart(app);

      await RedPacketDynamicRoomManager
        .getInstance()
        .init();
      /*
           roomManager.changDesestroyTime(30e3);*/

      await roomManager.init();

      await GameControlService.getInstance().init({ nid: GameNidEnum.redPacket });

      logger.info(`红包扫雷服务器 ${serverId} | 启动完成`);
      // 机器人启动
      robotServerController.start_robot_server(GameNidEnum.redPacket);

    } catch (e) {
      console.error(`红包扫雷: ${serverId} | 启动加载配置信息出错:${e.stack}`)
    }
    cb();
  }

  async afterStartAll(app: Application) {

    logger.info(`红包扫雷服务器 ${app.getServerId()} | 所有服务器启动完成`);
  }

  async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
    logger.info(`红包扫雷服务器 ${app.getServerId()} | 开始关闭`);
    // const roomManager = RedPacketRoomManager.Instance();
    // roomManager.beforeShutdown();
    shutDown();

    logger.info(`红包扫雷服务器 ${app.getServerId()} | 关闭完成`);
  }

}