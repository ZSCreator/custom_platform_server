import { Application, BackendSession, FrontendSession, pinus, RemoterClass } from 'pinus';
import sessionServiceg = require('../../../services/sessionService');
import serverControlConst = require('../lib/constant/serverControlConst');
import { loadRemote } from './loadRemote';
// UserRpc的命名空间自动合并
import { AuthRemoter } from './authRemoter';
declare global {
    interface UserRpc {
        connector: {
            // 一次性定义一个类自动合并到UserRpc中
            enterRemote: RemoterClass<FrontendSession, enterRemote>;
            loadRemote: RemoterClass<FrontendSession, loadRemote>;
            AuthRemoter: RemoterClass<BackendSession, AuthRemoter>;
        };
    }
}

export default function (app: Application) {
    return new enterRemote(app);
}

export class enterRemote {

    constructor(private app: Application) {
        this.app = app;

    }
    // 把指定uid的玩家踢下线
    public async kickOnePlayer(uid: string) {
        const sessionService = this.app.get('sessionService');
        if (!sessionService) {
            return;
        }
        const sessions = sessionService.getByUid(uid);
        if (!sessions || !sessions.length) {
            return;
        }
        const existSession = sessions[0];
        // 发送被踢下线的通知 type 为1 为玩家被踢下线，提示网络异常
        pinus.app.get('channelService').pushMessageByUids(serverControlConst.KICK_PLAYER_NOTICE_ROUTE_CLOSEWEB, { type: 1 }, [{ uid, sid: existSession.frontendId }]);

        // sessionService.kickBySessionId(existSession.id);
        sessionService.kick(uid);

        return;
    }

    /**
     * 检查玩家session是否存在
     * @param uidList
     */
    checkPlayersSession(uidList: string[]) {
        let sessionService = this.app.get('sessionService');

        // 没有则不做检测
        if (!sessionService.getSessionsCount()) {
            return false;
        }

        // 如果uidList玩家里面有session存在则返回true
        return uidList.filter(uid => !!sessionService.getByUid(uid)).length > 0;
    }

    /**
     * 检查玩家session是否存在
     * @param uid
     */
    checkPlayerSession(uid: string) {
        let sessionService = this.app.get('sessionService');

        // 没有则不做检测
        if (!sessionService.getSessionsCount()) {
            return false;
        }

        return !!sessionService.getByUid(uid);
    }

    // 把当前connector的所有人踢下线
    public async kickAllOffline() {
        let sessionService = this.app.get('sessionService');
        if (!sessionService.getSessionsCount()) {
            return;
        }
        sessionService.forEachSession(sessionPlayer => {
            const sessions = sessionService.getByUid(sessionPlayer.uid);
            const existSession = sessions[0];
            // 发送被踢下线的通知 type 为1 为玩家被踢下线，提示网络异常
            pinus.app.get('channelService').pushMessageByUids(serverControlConst.KICK_PLAYER_NOTICE_ROUTE_CLOSEWEB, { type: 1 }, [{ uid : sessionPlayer.uid , sid: existSession.frontendId }]);
            sessionService.kick(sessionPlayer.uid);
        });
        return ;
    };

    //通过uid获取玩家sessions
    public async getPlayerSession(uid: string) {
        let sessionService = this.app.get('sessionService');
        let sessionTemp;
        sessionService.forEachSession(sessionPlayer => {
            if (sessionPlayer.uid === uid) sessionTemp = sessionPlayer;
        });
        if (sessionTemp) {
            const { nid } = sessionServiceg.sessionInfo(sessionTemp);
            return nid;
        }
        return null;
    };

    //判断玩家是否在线
    public async isOnlinePlayer(uid: string) {
        console.log('判断玩家是否在线');
        let sessionService = this.app.get('sessionService');
        let temp = false;
        sessionService.forEachSession(sessionPlayer => {
            (uid === sessionPlayer.uid) && (temp = true);
        });
        return temp
    };

    //获取玩家sid
    public async getSidToconnector(uid: string): Promise<string> {
        console.log('获取玩家sid');
        let sessionService = this.app.get('sessionService');
        let tempSesion: any = '';
        sessionService.forEachSession(sessionPlayer => {
            (uid === sessionPlayer.uid) && (tempSesion = sessionPlayer);
        });
        return tempSesion && tempSesion.frontendId
    }

    /**
     * 获取session数量
     */
    public async getSessionsCount() {
        let sessionService = this.app.get('sessionService');
        return sessionService.getSessionsCount();
    }
}