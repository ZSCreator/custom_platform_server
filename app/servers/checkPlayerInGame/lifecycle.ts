'use strict';
import { ILifeCycle, Application } from "pinus";
// 机器人服务器生命周期
import robotServerController = require('../robot/lib/robotServerController');
import {RpcRun} from "./lib/main";



export default function () {
    return new Lifecycle();
}


class Lifecycle implements ILifeCycle {

    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), '!!beforeStartup');
        return cb();
    };

    async afterStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), '!!afterStartup');
        // 启动服务
        RpcRun();
        return cb();
    };

}
