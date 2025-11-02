'use strict';

// 大厅生命周期控制
import timerService = require('../../services/common/timerService');
import * as serverController from '../../services/common/serverController';
import { getLogger } from 'pinus-logger';

const Logger = getLogger('server_out', __filename);
import { ILifeCycle, Application } from "pinus";

export default function () {
    return new Lifecycle();
}


class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        try {
            /**
             *  多个大厅服务器，会产生多个定时任务，这个是错误的
             */
            // serverController.initBeforeStart();
        } catch (error) {
            Logger.error('hallLifecycle.beforeStartup==>', error);
        }
        console.log(app.getServerId(), '!!beforeStartup');
        return cb();
    };
    // 大厅服务器启动之后
    async afterStartup(app: Application, cb: () => void): Promise<void> {
        console.log(app.getServerId(), '!!afterStartup');
        await serverController.initAfterStartAll(app);
        return cb();
    };
    // 所有服务器启动之后
    async afterStartAll(app: Application) {
        console.log(app.getServerId(), '!!afterStartAll');
    };
    // 服务器关闭前
    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        await timerService.delayServerClose();
    };
}
