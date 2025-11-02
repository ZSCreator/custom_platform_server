import timerService = require('../../services/common/timerService');
import { getLogger } from 'pinus-logger';

const Logger = getLogger('server_out', __filename);
import { ILifeCycle, Application, pinus } from "pinus";
import IPLHttpUtill from './lib/utils/IPLHttp.utill';
import { initToken } from './lib/utils/Token.schedule';
import IPLGameManager from './lib/IPLGameManager';
import { GameNidEnum } from '../../common/constant/game/GameNidEnum';

export default function () {
    return new Lifecycle();
}


class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), '!!beforeStartup');
        new IPLGameManager(GameNidEnum.IPL).init();
        return cb();
    };
    // 大厅服务器启动之后
    async afterStartup(app: Application, cb: () => void): Promise<void> {
        await initToken();
        console.log(app.getServerId(), '!!afterStartup');
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
