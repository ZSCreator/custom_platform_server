'use strict';

import { Application, ChannelService, FrontendSession, BackendSession, RemoterClass, Remoter, pinus } from 'pinus';
import JsonConfig = require("../../../pojo/JsonConfig");
import JsonMgr = require('../../../../config/data/JsonMgr');
import * as robotServerController from "../lib/robotServerController"
import fs = require('fs');
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        robot: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<FrontendSession, mainRemote>;
        };
    }
}

export default function (app: Application) {
    return new mainRemote(app);
}
export class mainRemote {
    //那些游戏开始了模拟npc测试的
    nids: string[];
    constructor(private app: Application) {
        this.app = app;
        this.nids = [];
    }
    //开启模拟玩家测试流程
    public async NpcStart(nids: string[], twoStrategy: boolean) {
        console.warn(this.app.getServerId(), nids.toString(), twoStrategy);
        for (const nid of nids) {
            // if (!this.nids.find(c => c == nid)) {
            //xx逻辑
            if (twoStrategy) {
                robotServerController.start_robot_server(nid, true);
                if (!this.nids.find(c => c == nid)) {
                    this.nids.push(nid);
                }
            } else {
                robotServerController.stop_robot_server(nid);
                this.nids = this.nids.filter(c => c != nid);
            }
            // }
        }
        return { code: 200, nids: this.nids };
    };

    public async NpcStatus() {
        return { code: 200, nids: this.nids };
    };
}