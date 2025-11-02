"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterRemote = void 0;
const pinus_1 = require("pinus");
const sessionServiceg = require("../../../services/sessionService");
const serverControlConst = require("../lib/constant/serverControlConst");
function default_1(app) {
    return new enterRemote(app);
}
exports.default = default_1;
class enterRemote {
    constructor(app) {
        this.app = app;
        this.app = app;
    }
    async kickOnePlayer(uid) {
        const sessionService = this.app.get('sessionService');
        if (!sessionService) {
            return;
        }
        const sessions = sessionService.getByUid(uid);
        if (!sessions || !sessions.length) {
            return;
        }
        const existSession = sessions[0];
        pinus_1.pinus.app.get('channelService').pushMessageByUids(serverControlConst.KICK_PLAYER_NOTICE_ROUTE_CLOSEWEB, { type: 1 }, [{ uid, sid: existSession.frontendId }]);
        sessionService.kick(uid);
        return;
    }
    checkPlayersSession(uidList) {
        let sessionService = this.app.get('sessionService');
        if (!sessionService.getSessionsCount()) {
            return false;
        }
        return uidList.filter(uid => !!sessionService.getByUid(uid)).length > 0;
    }
    checkPlayerSession(uid) {
        let sessionService = this.app.get('sessionService');
        if (!sessionService.getSessionsCount()) {
            return false;
        }
        return !!sessionService.getByUid(uid);
    }
    async kickAllOffline() {
        let sessionService = this.app.get('sessionService');
        if (!sessionService.getSessionsCount()) {
            return;
        }
        sessionService.forEachSession(sessionPlayer => {
            const sessions = sessionService.getByUid(sessionPlayer.uid);
            const existSession = sessions[0];
            pinus_1.pinus.app.get('channelService').pushMessageByUids(serverControlConst.KICK_PLAYER_NOTICE_ROUTE_CLOSEWEB, { type: 1 }, [{ uid: sessionPlayer.uid, sid: existSession.frontendId }]);
            sessionService.kick(sessionPlayer.uid);
        });
        return;
    }
    ;
    async getPlayerSession(uid) {
        let sessionService = this.app.get('sessionService');
        let sessionTemp;
        sessionService.forEachSession(sessionPlayer => {
            if (sessionPlayer.uid === uid)
                sessionTemp = sessionPlayer;
        });
        if (sessionTemp) {
            const { nid } = sessionServiceg.sessionInfo(sessionTemp);
            return nid;
        }
        return null;
    }
    ;
    async isOnlinePlayer(uid) {
        console.log('判断玩家是否在线');
        let sessionService = this.app.get('sessionService');
        let temp = false;
        sessionService.forEachSession(sessionPlayer => {
            (uid === sessionPlayer.uid) && (temp = true);
        });
        return temp;
    }
    ;
    async getSidToconnector(uid) {
        console.log('获取玩家sid');
        let sessionService = this.app.get('sessionService');
        let tempSesion = '';
        sessionService.forEachSession(sessionPlayer => {
            (uid === sessionPlayer.uid) && (tempSesion = sessionPlayer);
        });
        return tempSesion && tempSesion.frontendId;
    }
    async getSessionsCount() {
        let sessionService = this.app.get('sessionService');
        return sessionService.getSessionsCount();
    }
}
exports.enterRemote = enterRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50ZXJSZW1vdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jb25uZWN0b3IvcmVtb3RlL2VudGVyUmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUEwRjtBQUMxRixvRUFBcUU7QUFDckUseUVBQTBFO0FBZTFFLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUVwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBRW5CLENBQUM7SUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQVc7UUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ2pCLE9BQU87U0FDVjtRQUNELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDL0IsT0FBTztTQUNWO1FBQ0QsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpDLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUc5SixjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcs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