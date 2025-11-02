import { ILifeCycle, Application, Logger } from "pinus";
import { getLogger } from 'pinus-logger';
import { nestRun } from "./lib/main";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    logger: Logger;

    constructor() {
        this.logger = getLogger('c', __filename);
    }

    async afterStartup(app: Application, cb: () => void) {
        // nestRun();
        this.logger.info(`日志服务 | 启动完成`);
        cb();
        return;
    }
    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {

    }
}
