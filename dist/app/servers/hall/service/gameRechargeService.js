'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteice_blacklist = exports.noticeGameRecharge = void 0;
const games = require('../../../../config/data/games.json');
const pinus_1 = require("pinus");
const noticeGameRecharge = async function (uid) {
    console.log("noticeGameRecharge", uid);
    return new Promise(async (resolve, reject) => {
        let nid = await pinus_1.pinus.app.rpc.connector.enterRemote.getPlayerSession.defaultRoute(uid);
        const currServer = games.find(m => m.nid == nid);
        const serverName = currServer && currServer.serverName;
        if (pinus_1.pinus.app.rpc[serverName] && pinus_1.pinus.app.rpc[serverName].mainRemote && typeof pinus_1.pinus.app.rpc[serverName].mainRemote.findPlayerToGame === 'function') {
            await pinus_1.pinus.app.rpc[serverName].mainRemote.findPlayerToGame.toServer("*", { uid, field: 'gold' });
        }
        else {
            console.error('没有游戏服务器', nid, serverName);
            return resolve({});
        }
    });
};
exports.noticeGameRecharge = noticeGameRecharge;
const noteice_blacklist = function ({ uid }) {
    return new Promise(async (resolve, reject) => {
        console.log("noteice_blacklist", uid);
        let nid = await pinus_1.pinus.app.rpc.connector.enterRemote.getPlayerSession.defaultRoute(uid);
        console.log("noteice_blacklist nid", nid);
        if (nid != null) {
            const currServer = games.find(m => m.nid == nid);
            const serverName = currServer && currServer.serverName;
            if (pinus_1.pinus.app.rpc[serverName] && pinus_1.pinus.app.rpc[serverName].mainRemote && typeof pinus_1.pinus.app.rpc[serverName].mainRemote.findPlayerToGame === 'function') {
                await pinus_1.pinus.app.rpc[serverName].mainRemote.findPlayerToGame.toServer("*", { uid, field: 'blacklist' });
            }
            else {
                return resolve({});
            }
        }
    });
};
exports.noteice_blacklist = noteice_blacklist;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZVJlY2hhcmdlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2hhbGwvc2VydmljZS9nYW1lUmVjaGFyZ2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDNUQsaUNBQThCO0FBS3ZCLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxXQUFXLEdBQVc7SUFDekQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2QyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDekMsSUFBSSxHQUFHLEdBQUcsTUFBTSxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2RixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNqRCxNQUFNLFVBQVUsR0FBRyxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUV2RCxJQUFJLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxPQUFPLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsS0FBSyxVQUFVLEVBQUU7WUFDbEosTUFBTSxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUNyRzthQUFNO1lBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUE7QUFkWSxRQUFBLGtCQUFrQixzQkFjOUI7QUFHTSxNQUFNLGlCQUFpQixHQUFHLFVBQVUsRUFBRSxHQUFHLEVBQUU7SUFDOUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBSSxHQUFHLEdBQUcsTUFBTSxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2RixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtZQUNiLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sVUFBVSxHQUFHLFVBQVUsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDO1lBRXZELElBQUksYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsVUFBVSxJQUFJLE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixLQUFLLFVBQVUsRUFBRTtnQkFDbEosTUFBTSxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQzthQUMxRztpQkFBTTtnQkFFSCxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN0QjtTQUNKO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUE7QUFqQlksUUFBQSxpQkFBaUIscUJBaUI3QiJ9