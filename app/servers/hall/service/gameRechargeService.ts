'use strict';
const games = require('../../../../config/data/games.json');
import { pinus } from 'pinus';



//玩家在游戏里面充值
export const noticeGameRecharge = async function (uid: string) {
    console.log("noticeGameRecharge", uid);
    return new Promise(async (resolve, reject) => {
        let nid = await pinus.app.rpc.connector.enterRemote.getPlayerSession.defaultRoute(uid);
        const currServer = games.find(m => m.nid == nid);
        const serverName = currServer && currServer.serverName;
        //游戏服务器存在并且有对应方法
        if (pinus.app.rpc[serverName] && pinus.app.rpc[serverName].mainRemote && typeof pinus.app.rpc[serverName].mainRemote.findPlayerToGame === 'function') {
            await pinus.app.rpc[serverName].mainRemote.findPlayerToGame.toServer("*", { uid, field: 'gold' });
        } else {
            console.error('没有游戏服务器', nid, serverName);
            return resolve({});
        }
    });
}

//通知黑名单玩家 即时生效
export const noteice_blacklist = function ({ uid }) {
    return new Promise(async (resolve, reject) => {
        console.log("noteice_blacklist", uid);
        let nid = await pinus.app.rpc.connector.enterRemote.getPlayerSession.defaultRoute(uid);
        console.log("noteice_blacklist nid", nid);
        if (nid != null) {
            const currServer = games.find(m => m.nid == nid);
            const serverName = currServer && currServer.serverName;
            //游戏服务器存在并且有对应方法
            if (pinus.app.rpc[serverName] && pinus.app.rpc[serverName].mainRemote && typeof pinus.app.rpc[serverName].mainRemote.findPlayerToGame === 'function') {
                await pinus.app.rpc[serverName].mainRemote.findPlayerToGame.toServer("*", { uid, field: 'blacklist' });
            } else {
                //console.error('没有游戏服务器', nid, serverName);
                return resolve({});
            }
        }
    });
}