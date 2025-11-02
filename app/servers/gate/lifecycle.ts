import { ILifeCycle, Application, pinus } from "pinus";
import timerService = require('../../services/common/timerService');
import LogService = require('../../services/common/logService');

export default function () {
    return new Lifecycle();
}


class Lifecycle implements ILifeCycle {

    loggerPreStr: string = '网关服务器 | ';

    beforeStartup(app: Application, next: () => void): void {
        next();
    }

    afterStartup(app: Application, next: () => void): void {
        console.log(`${this.loggerPreStr}${app.getServerId()} | 启动完成`)
        next();
    }

    afterStartAll(app: Application): void {
        console.log(`${this.loggerPreStr} 全部启动完成`)
    }

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        console.log(`${this.loggerPreStr}${app.getServerId()} 正在关闭`)
        await timerService.delayServerClose();
        shutDown();
    }
}