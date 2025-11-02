'use strict';

import { Application, FrontendSession, RemoterClass, pinus } from 'pinus';
import GameManager from "../../../common/dao/daoManager/Game.manager";
// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        checkPlayerInGame: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<FrontendSession, mainRemote>;
        };
    }
}

export default function (app: Application) {
    return new mainRemote(app);
}
export class mainRemote {

    constructor(private app: Application) {
        this.app = app;
    }

    /**检查玩家是否可以下分 */
    async checkPlayerLower(paramsData) {
        try {

            let { nid , uid, sceneId  , roomId ,hallServerId } = paramsData;

            const { name  } = await GameManager.findOne({ nid });

            /** Step 1: 检测服务器状态 */
            if (!pinus.app.rpc[name]) {
                return {code: 200 , isCanLower : true};
            }
            if(!hallServerId){
                hallServerId =  `${name}-server-1`;
            }
            let result = await pinus.app.rpc[name].mainRemote.rpcLowerPlayer.toServer(hallServerId,{uid ,sceneId,roomId});

            if(result && result.code == 200){
                return {code: 200 , isCanLower : true};

            }
            return {code: 500 , isCanLower : false};
        } catch (e) {
            console.error(`检查玩家是否可以下分:${e}`);
            return {code: 200 , isCanLower : true};
        }
    };
}