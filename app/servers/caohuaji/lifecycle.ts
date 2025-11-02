'use strict';
import { ILifeCycle, Application, pinus } from "pinus";

import * as timerService from '../../services/common/timerService';
import * as caohuajiConst from './lib/caohuajiConst';
import * as caohuajiService from '../../services/caohuajiService';
import * as JsonMgr from '../../../config/data/JsonMgr';
import CHJRoomManagerImpl, * as CaohuajiMgr from './lib/CHJRoomManagerImpl';
// 机器人服务器生命周期
import * as robotServerController from '../robot/lib/robotServerController';
import { GameNidEnum } from "../../common/constant/game/GameNidEnum";
import { GameControlService } from "../../services/newControl/gameControlService";
import { CaoHuaJiGameManagerImpl } from "./lib/CaoHuaJiGameManagerImpl";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "草花机服务器启动之前");
        await new CaoHuaJiGameManagerImpl(GameNidEnum.caohuaji).init();
        cb();
    };
    async afterStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), "草花机服务器启动之后");
        // timerService.caohuajiTimer();



        await CHJRoomManagerImpl.init();

        //重置开奖记录
        caohuajiService.resetHistory();

        //开启奖池转移定时器
        timerService.caohuajiTimerJackpot(GameNidEnum.caohuaji);

        // 初始化调控
        await GameControlService.getInstance().init({ nid: GameNidEnum.caohuaji });

        // robotServerController.start_robot_server(GameNidEnum.caohuaji);
        cb();
    };

    afterStartAll(app: Application) {
        console.log(app.getServerId(), "草花机所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
        // CHJRoomManagerImpl.Instance().beforeShutdown();
        console.log(app.getServerId(), "草花机服务器关闭之前");
        shutDown();
    };
}