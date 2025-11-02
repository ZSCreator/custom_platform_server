import { Application, ILifeCycle } from "pinus";
import BairenMgr from './lib/BairenRoomManager';
import BaiRenGameManager from "./lib/BaiRenGameManager";
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
import timerService = require('../../services/common/timerService');
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');

const bairenLogger = getLogger('server_out', __filename);

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        bairenLogger.warn(app.getServerId(), "百人牛牛服务器启动之前");

        /**
         * 初始化该游戏的游戏system_games ，场列表 ， 房间列表
         */
        await new BaiRenGameManager(GameNidEnum.bairen).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        bairenLogger.warn(app.getServerId(), "百人牛牛服务器启动之后");

        // BairenMgr.Instance();
        BairenMgr.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.bairen, bankerGame: true });
        robotServerController.start_robot_server(GameNidEnum.bairen);
        cb();
    };

    afterStartAll(app: Application) {
        bairenLogger.warn(app.getServerId(), "百人牛牛所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // BairenMgr.Instance().beforeShutdown();
        bairenLogger.warn(app.getServerId(), "百人牛牛服务器关闭之前");
        shutDown();
    };
}
