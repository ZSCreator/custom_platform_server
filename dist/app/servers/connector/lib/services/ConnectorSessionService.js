"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorSessionService = void 0;
const pinus_1 = require("pinus");
const RoleEnum_1 = require("../../../../common/constant/player/RoleEnum");
const sessionService_1 = require("../../../../services/sessionService");
const sessionEvent_1 = require("../../../../common/event/sessionEvent");
const Player_manager_1 = require("../../../../common/dao/daoManager/Player.manager");
class ConnectorSessionService {
    constructor(handler) {
        this.entryHandler = handler;
    }
    async bindSessionWithRealPlayer(uid, language, session) {
        let kickself = false;
        try {
            const sessionList = pinus_1.pinus.app
                .get("sessionService")
                .getByUid(uid);
            if (sessionList && sessionList.length > 0) {
                await Player_manager_1.default.updateOne({ uid }, { kickself: true });
                await pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer('*', uid);
                kickself = true;
            }
            return new Promise(resolve => {
                session.bind(uid, async (err) => {
                    if (err) {
                        this.entryHandler.logger.warn(`${this.entryHandler.loggerPreStr}session管理 | 玩家：${uid} | 身份:真实玩家 | 绑定session出错  :${err.stack}`);
                        return resolve({ isSuccess: false, kickself });
                    }
                    session.on('closed', sessionEvent_1.playerCloseSessionByMysql.bind(null, pinus_1.pinus.app));
                    await (0, sessionService_1.sessionSet)(session, { frontendServerId: pinus_1.pinus.app.getServerId(), isRobot: RoleEnum_1.RoleEnum.REAL_PLAYER, language });
                    return resolve({ isSuccess: true, kickself });
                });
            });
        }
        catch (e) {
            this.entryHandler.logger.error(`${this.entryHandler.loggerPreStr}session管理 | 绑定 session 出错 :${e.stack}`);
            return { isSuccess: false, kickself };
        }
    }
    async bindSessionWithRobot(uid, language, session, nid) {
        try {
            const playerSessionList = pinus_1.pinus.app.get('sessionService').getByUid(uid);
            if (playerSessionList && playerSessionList.length > 0) {
                return false;
            }
            return new Promise(resolve => {
                session.bind(uid, async (err) => {
                    if (err) {
                        this.entryHandler.logger.warn(`${this.entryHandler.loggerPreStr} session管理 | 玩家：${uid} | 身份: 机器人 | 绑定session出错  : ${err.stack} `);
                        return resolve(false);
                    }
                    session.on('closed', sessionEvent_1.robotCloseSessionByMysql.bind(null, pinus_1.pinus.app));
                    await (0, sessionService_1.sessionSet)(session, { frontendServerId: pinus_1.pinus.app.getServerId(), isRobot: RoleEnum_1.RoleEnum.ROBOT, language });
                    return resolve(true);
                });
            });
        }
        catch (e) {
            this.entryHandler.logger.error(`${this.entryHandler.loggerPreStr} session管理 | 绑定 session 出错: ${e.stack} `);
            return false;
        }
    }
}
exports.ConnectorSessionService = ConnectorSessionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdG9yU2Vzc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jb25uZWN0b3IvbGliL3NlcnZpY2VzL0Nvbm5lY3RvclNlc3Npb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGlDQUErQztBQUMvQywwRUFBdUU7QUFDdkUsd0VBQThFO0FBQzlFLHdFQUE0RztBQUU1RyxxRkFBNkU7QUFDN0UsTUFBYSx1QkFBdUI7SUFJaEMsWUFBWSxPQUFxQjtRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztJQUNoQyxDQUFDO0lBV00sS0FBSyxDQUFDLHlCQUF5QixDQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFFLE9BQXdCO1FBQzFGLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJO1lBS0EsTUFBTSxXQUFXLEdBQUcsYUFBSyxDQUFDLEdBQUc7aUJBQ3hCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDckIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRW5CLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLHdCQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMzRSxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ25CO1lBRUQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxF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