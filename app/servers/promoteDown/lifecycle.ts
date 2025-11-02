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
        // this.logger.info(`http服务 | 启动完成`);
        cb();
        return;
    }
    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        //
        // try {
        //     shutDown();
        // } catch (e) {
        //     this.logger.error(`http服务 | 关闭服务器 | 出错 : ${e.stack}`);
        // }
        return;
    }

}
