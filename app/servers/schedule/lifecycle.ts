
'use strict';
import { ILifeCycle, Application, pinus } from "pinus";
import { getLogger, ILogger } from 'pinus-logger';
import timerService = require('../../services/common/timerService');
import * as serverController from "../../services/common/serverController";
import * as HallSchedule from "../schedule/service/hall/hallSchedule";
const Logger = getLogger('server_out', __filename);

export default function () {
    return new Lifecycle();
}


/**
 *  定时服务器
 */
class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.log("定时任务调度器启动之前");
        cb();
    };
    async afterStartup(app: Application, cb: () => void) {
        Logger.info(`定时任务调度器开始启动`);
        /**
         * 启动大厅方面的相关功能定时器
         */
        await HallSchedule.setHallScheduleJob();
        /**
         * 启动管理后台相关功能定时器
         */
        Logger.info(`定时任务调度器完成启动`);
        cb();
    }
    afterStartAll(app: Application) {
        console.log("定时任务调度器所有服务器启动之后");
    };
    // 服务器关闭前
    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        console.log("定时任务调度器服务器关闭之前");
        await timerService.delayServerClose();
    };
}