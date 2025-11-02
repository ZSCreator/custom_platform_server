import { ILifeCycle, Application, Logger } from "pinus";
import { getLogger } from 'pinus-logger';

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    logger: Logger;

    constructor() {
        this.logger = getLogger('server_out', __filename);
    }

    async afterStartup(app: Application, cb: () => void) {
        this.logger.info(`支付服务 | 启动完成`)
        cb();
    }
    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {

        try {
            shutDown();
        } catch (e) {
            this.logger.error(`支付服务 | 关闭服务器 | 出错 : ${e.stack}`);
        }
    }

}
