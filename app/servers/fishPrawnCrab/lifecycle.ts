'use strict';
import { Application, ILifeCycle } from "pinus";
import * as timerService from '../../services/common/timerService';
import FishPrawnCrabGameManager from "./lib/FishPrawnCrabGameManager";
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
import roomManager from "./lib/FishPrawnCrabRoomManager";


export default function () {
    return new Lifecycle();
}
class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.warn(app.getServerId(), "鱼虾蟹|beforeStartup");

        /**
         * 初始化该游戏的游戏system_games ，场列表 ， 房间列表
         */
        await new FishPrawnCrabGameManager(GameNidEnum.fishPrawnCrab).init();
        cb();
    };

    async afterStartup(app: Application, cb: () => void) {

        // await FishPrawnCrabManagerImpl.Instance().initAfterServerStart(app);

        // 初始化房间且预先运行
        await roomManager.init();

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.fishPrawnCrab, bankerGame: false });

        console.warn(app.getServerId(), "鱼虾蟹|afterStartup");
        cb();
    };

    afterStartAll(app: Application) {
        console.warn(app.getServerId(), "鱼虾蟹|afterStartAll");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "鱼虾蟹|beforeShutdown");
        shutDown();
    };
}