import { Promise } from 'bluebird';
import { pinus, Application } from 'pinus';
import * as fs from 'fs';
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);
// 支持注解
import 'reflect-metadata';

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
export function preload(app: Application) {
    // 使用bluebird输出完整的promise调用链
    // global.Promise = Promise;
    // 开启长堆栈
    Promise.config({
        // Enable warnings
        warnings: false,
        // Enable long stack traces
        longStackTraces: false,
        // Enable cancellation
        cancellation: false,
        // Enable monitoring
        monitoring: false
    });

    // 自动解析ts的sourcemap
    require('source-map-support').install({
        handleUncaughtExceptions: false
    });

    // 捕获普通异常
    process.on('uncaughtException', function (err: any) {
        // console.error(app.getServerId(), 'Caught exception: ' + err.stack);
        Logger.error(app.getServerId(), 'Caught exception: ' + (err.stack || err.message || err));
    });

    // 捕获async异常
    process.on('unhandledRejection', (reason: any, p: any) => {
        // console.error(app.getServerId(), 'Caught Unhandled Rejection at:' + p + 'reason:' + reason.stack);
        Logger.error(app.getServerId(), 'Caught Unhandled Rejection at:' + JSON.stringify(p) + 'reason:' + (reason.stack || reason.message || JSON.stringify(reason)));
    });
}



/**wss 配置
 * 写2个配置在 配置目录，防止 程序 跑步起来
 */
export let sslOpts = {
    /**是否开启 wss */
    run: false,
    ssl: {
        type: 'wss',
        key: null,
        cert: null
    },
    //是否开启加密通信
    isdecode: false,
}
sslOpts.isdecode = false;
/**防止添加机器人报错 */
if (sslOpts.run) {
    sslOpts.ssl.key = fs.readFileSync('config/private/game-server.key');
    sslOpts.ssl.cert = fs.readFileSync('config/private/game-server.pem');
}