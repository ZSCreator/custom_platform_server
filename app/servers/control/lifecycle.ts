import { ILifeCycle, Application, Logger } from "pinus";
import { getLogger } from "pinus-logger";
import {runScheduleJob} from "../../services/bonusPools/schedule";
import {BackendControlService} from "../../services/newControl/backendControlService";
import PlatformControlManager from "../../services/newControl/lib/platformControlManager";


export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    logger: Logger;

    constructor() {
        this.logger = getLogger('server_out', __filename);
    }

    beforeStartup(app: Application, cb: () => void): void {
        console.warn("调控服务器启动之前");
        cb();
    };

    async afterStartup(app: Application, cb: () => void): Promise<void> {
        console.warn("调控服务器启动之后");

        // 清理在线调控玩家
        await BackendControlService.clearOnlineTotalControlPlayer();

        // 初始化
        await PlatformControlManager.init();

        cb();
    };

    afterStartAll(app: Application) {
        // 运行定时清空奖池任务
        runScheduleJob();
        console.warn("调控所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        console.warn("调控服务器关闭之前");
        await PlatformControlManager.saveAll();
        shutDown();
    };
}