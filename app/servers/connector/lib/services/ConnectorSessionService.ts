import { EntryHandler } from "../../handler/entryHandler";
import { FrontendSession, pinus } from "pinus";
import { RoleEnum } from "../../../../common/constant/player/RoleEnum";
import { sessionInfo, sessionSet } from '../../../../services/sessionService';
import { playerCloseSessionByMysql, robotCloseSessionByMysql } from "../../../../common/event/sessionEvent";
import PlayerRedisDao from "../../../../common/dao/redis/Player.redis.dao";
import PlayerManager from "../../../../common/dao/daoManager/Player.manager";
export class ConnectorSessionService {

    entryHandler: EntryHandler;

    constructor(handler: EntryHandler) {
        this.entryHandler = handler;
    }



    /**
     * 绑定session
     * @param uid        用户编号
     * @param language   玩家语言
     * @param session    前端session
     * @description 真实玩家
     */
    public async bindSessionWithRealPlayer(uid: string, language: string, session: FrontendSession): Promise<{ isSuccess: boolean, kickself: boolean }> {
        let kickself = false;
        try {
            /**
             * Step 1: 是否在线
             * @description 真实玩家则挤下线
             */
            const sessionList = pinus.app
                .get("sessionService")
                .getByUid(uid);

            if (sessionList && sessionList.length > 0) {
                await PlayerManager.updateOne({ uid }, { kickself: true });
                await pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer('*', uid);
                kickself = true;
            }

            return new Promise(resolve => {
                session.bind(uid, async (err) => {
                    if (err) {
                        this.entryHandler.logger.warn(`${this.entryHandler.loggerPreStr}session管理 | 玩家：${uid} | 身份:真实玩家 | 绑定session出错  :${err.stack}`);
                        return resolve({ isSuccess: false, kickself });
                    }

                    /** 添加监听事件: 离线 */
                    session.on('closed', playerCloseSessionByMysql.bind(null, pinus.app));

                    /** 绑定sid 和 isRobot */
                    await sessionSet(session, { frontendServerId: pinus.app.getServerId(), isRobot: RoleEnum.REAL_PLAYER, language });

                    return resolve({ isSuccess: true, kickself });
                })
            });
        } catch (e) {
            this.entryHandler.logger.error(`${this.entryHandler.loggerPreStr}session管理 | 绑定 session 出错 :${e.stack}`);
            return { isSuccess: false, kickself };
        }
    }

    /**
     * 绑定session
     * @param uid        用户编号
     * @param language   语言
     * @param session    前端session
     * @description 机器人
     */
    public async bindSessionWithRobot(uid: string, language: string, session: FrontendSession, nid) {
        try {

            const playerSessionList = pinus.app.get('sessionService').getByUid(uid);

            if (playerSessionList && playerSessionList.length > 0) {

                // this.entryHandler.logger.warn(`${this.entryHandler.loggerPreStr} session管理 | 机器人 ${uid} 已在线，不进行后续操作 | 游戏:${nid}`);
                return false;
            }

            return new Promise(resolve => {
                session.bind(uid, async (err) => {
                    if (err) {
                        this.entryHandler.logger.warn(`${this.entryHandler.loggerPreStr} session管理 | 玩家：${uid} | 身份: 机器人 | 绑定session出错  : ${err.stack} `);
                        return resolve(false);
                    }

                    /** 添加监听事件: 离线 */
                    session.on('closed', robotCloseSessionByMysql.bind(null, pinus.app));

                    /** 绑定sid 和 isRobot */
                    await sessionSet(session, { frontendServerId: pinus.app.getServerId(), isRobot: RoleEnum.ROBOT, language });
                    return resolve(true);
                })
            })
        } catch (e) {
            this.entryHandler.logger.error(`${this.entryHandler.loggerPreStr} session管理 | 绑定 session 出错: ${e.stack} `);
            return false;
        }
    }

}
