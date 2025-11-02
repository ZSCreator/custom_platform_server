// 负载相关
import { Application, pinus } from 'pinus';


export default function (app: Application) {
    return new loadRemote(app);
}


export class loadRemote {
    start_server_login_statistics: boolean;

    constructor(private app: Application) {
        this.app = app;
        this.start_server_login_statistics = false;
    }

    // 更新登录统计 预备弃用
    // public async updateConnectorLoginCount() {
    //     if (this.start_server_login_statistics == true)
    //         return;
    //     this.start_server_login_statistics = true;

    //     let lock;
    //     try {
    //         const connectionService = pinus.app.components.__connection__;
    //         // 获取到了
    //         if (connectionService) {
    //             // 锁主Key容易产生争用
    //             lock = await redisManager.lock(`${serverControlConst.LOGIN_STATISTICS_KEY}:${this.app.getServerId()}`);
    //             // 存到缓存
    //             await redisManager.storeFieldIntoHashTable(serverControlConst.LOGIN_STATISTICS_KEY,
    //                 this.app.getServerId(), connectionService.getStatisticsInfo().loginedCount);
    //         }
    //         return;
    //     } catch (error) {
    //         Logger.debug(`${this.app.getServerId()}: ${error.stack || error}`)
    //         return;
    //     } finally {
    //         await redisManager.unlock(lock);
    //         this.start_server_login_statistics = false;
    //     }
    // };
    /**获取连接数量 */
    public async get_ConnectorLoginCount() {
        try {
            const connectionService = pinus.app.components.__connection__;
            if (connectionService) {
                const loginedCount = connectionService.getStatisticsInfo().loginedCount;
                return { ServerId: this.app.getServerId(), loginedCount };
            }
        } catch (error) {
            return { ServerId: this.app.getServerId(), loginedCount: 0 };
        }
    }
}