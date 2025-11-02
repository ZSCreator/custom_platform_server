import { Application, FrontendSession, Logger, pinus } from 'pinus';
import { getLogger } from 'pinus-logger';
import { ConnectorSessionService } from '../lib/services/ConnectorSessionService';
import OnlinePlayerRedisDao from '../../../common/dao/redis/OnlinePlayer.redis.dao';
import DayLoginPlayerRedisDao from '../../../common/dao/redis/DayLoginPlayer.redis.dao';
import { ApiResult } from '../../../common/pojo/ApiResult';
import { httpState } from '../../../common/systemState';
import { connectorEnum } from '../../../common/systemState/connector.state';
import { auth } from '../../../services/hall/tokenService';
import langsrv = require('../../../services/common/langsrv');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import RobotManagerDao from "../../../common/dao/daoManager/Robot.manager";
import { Player } from '../../../common/dao/mysql/entity/Player.entity';
import GameManager from '../../../common/dao/daoManager/Game.manager';
import { PlayerGameHistory } from '../../../common/dao/mysql/entity/PlayerGameHistory.entity';
import { PositionEnum } from '../../../common/constant/player/PositionEnum';
import { OFF_LINE_CONNECT } from '../../../consts/hallConst';
import { reconnectBeforeEntryRoom } from '../../hall/service/GameRemoteCallService';
import { sessionSet } from '../../../services/sessionService';
import { filterGameType } from '../../../services/hall/loginHelperService';
import { convertGameForClient } from '../../../services/hall/gameController';
import RobotRedisDao from "../../../common/dao/redis/Robot.redis.dao";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";
import { RedisGoldMessageService } from "../lib/services/RedisGoldMessageService";

export default function (app: Application) {
    return new EntryHandler(app);
}

export class EntryHandler {

    loggerPreStr: string;

    logger: Logger;

    connectorSessionService: ConnectorSessionService;

    redisGoldMessageService: RedisGoldMessageService;

    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);
        this.connectorSessionService = new ConnectorSessionService(this);
        this.redisGoldMessageService = new RedisGoldMessageService(this);
        this.loggerPreStr = `连接服务器 ${this.app.getServerId()} | `;
    }



    /**
     * 
     * @param param0 
     * @param session 
     * @description Mysql 版
     * @route connector.entryHandler.entryHall
     */
    async entryHall({ uid, token }, session: FrontendSession) {
        try {
            /** Step 1: 验证token */
            if (!uid || !token) {
                return new ApiResult(connectorEnum.MISS_FIELD, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }

            const tokenAuthResult = auth(token);

            if (tokenAuthResult) {
                this.logger.warn(`${this.loggerPreStr}登录大厅异常: | uid:${uid} | auth ${tokenAuthResult} `);

                return new ApiResult(connectorEnum.AUTH_TOKEN_FAIL, [], tokenAuthResult);
            }

            ///@ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, false);

            if (!player) {
                this.logger.warn(`${this.loggerPreStr}登录大厅异常: | uid:${uid} | 未查询到玩家信息 `);

                return new ApiResult(connectorEnum.CAN_NOT_FIND_PLAYER, [], langsrv.getlanguage(null, langsrv.Net_Message.id_3));
            }

            /** Step 2: 绑定 session */
            const { isSuccess, kickself } = await this.connectorSessionService.bindSessionWithRealPlayer(uid, player.language, session);

            if (!isSuccess) {
                this.logger.warn(`${this.loggerPreStr}登录大厅异常: | 真实玩家 | uid:${uid} | 绑定session失败 `);

                return new ApiResult(connectorEnum.BIND_SESSION_FAIL, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }

            /**
             * 更新信息
             * 公共部分
             *   玩家
             *      登录时间
             *      登录次数
             *      前置连接器编号
             *      abnormalOffline
             *      position
             *   session
             *      nid
             *      isRobot
             *      entryHallTime
             *      sceneId
             *      roomId
             *      frontendServerId
             */

            /** Step 3: 检测此次登录是断线重连还是首登*/
            let gameOffLine: { nid?: string, sceneId?: number, roomId?: string };
            let lastGame = null;
            let lastRoom = null;
            /** Step 3: 检测此次登录是断线重连还是首登*/
            if (player.position == PositionEnum.GAME) {
                const playerLastHistory = await ConnectionManager.getConnection(true)
                    .createQueryBuilder(PlayerGameHistory, "history")
                    .where("history.uid = :uid", { uid })
                    .orderBy("history.createDateTime", "DESC")
                    .getOne();

                if (playerLastHistory) {
                    const { nid, sceneId, roomId } = playerLastHistory;
                    lastGame = nid;
                    lastRoom = roomId;
                    // 自踢则构建断线信息
                    if (player.position === PositionEnum.GAME &&
                        OFF_LINE_CONNECT.includes(nid) &&
                        player.abnormalOffline && !player.kickedOutRoom
                    ) {
                        gameOffLine = { nid, sceneId, roomId };
                    }

                    if (!player.abnormalOffline && roomId === undefined) {
                        player.position = PositionEnum.HALL;
                    }

                    let beSuccess: boolean = false;

                    if (gameOffLine && typeof nid === "string" && typeof sceneId === "number" && typeof roomId === "string") {
                        const result = await reconnectBeforeEntryRoom(nid, player.uid);

                        if (!(result instanceof ApiResult)) {
                            beSuccess = result;
                        }

                        if (!beSuccess) {
                            player.position = PositionEnum.HALL;
                            gameOffLine = null;
                        }
                    }

                    const game = await GameManager.findOne({ nid });

                    game && game.opened && (player.position !== PositionEnum.HALL) && await sessionSet(session, { nid });

                    gameOffLine && await sessionSet(session, { sceneId });
                }
            }


            const [gameList, { list, nidList }] = await Promise.all([
                GameManager.findList({}),
                filterGameType(player)
            ]);
            const games = await convertGameForClient(gameList, nidList,player);
            const result = {
                uid,
                nickname: player.nickname,
                headurl: player.headurl,
                gold: player.gold,
                walletGold: player.walletGold,
                level: player.level,
                addRmb: player.addRmb,              //玩家是否充值，没充值就是0，充值了大于0
                tixianBate : 0,  //玩家最低提现限制
                language: player.language,
                lastGame: lastGame,
                lastRoom: lastRoom,
                games,
                gameTypeList: list,
                offLine: gameOffLine || {}
            };
            /**
             * 玩家进入到大厅更新玩家在线
             */
            const asyncFunc = [];
            if (!kickself) {
                this.logger.warn(`${this.loggerPreStr}连接connector: | 真实玩家 | uid:${uid} | 设置在线玩家`);
                asyncFunc.push(OnlinePlayerRedisDao.insertOne({ uid: player.uid, nid: '-1', sceneId: -1, isRobot: player.isRobot, entryGameTime: new Date(), roomId: '-1', frontendServerId: pinus.app.getServerId() }));
            }
            asyncFunc.push(DayLoginPlayerRedisDao.insertOne({ uid: player.uid, loginTime: new Date(), loginNum: 1 }));

            asyncFunc.push(PlayerManagerDao.updateOne({ uid: player.uid }, {
                loginTime: player.loginTime,
                loginCount: player.loginCount + 1,
                sid: pinus.app.getServerId(),
                position: PositionEnum.HALL
            }));

            // 订阅金币更新服务
            await this.redisGoldMessageService.subMessageChannel();

            await Promise.all(asyncFunc);

            return ApiResult.SUCCESS(result, "操作成功");
        } catch (e) {
            this.logger.error(`${this.loggerPreStr}登录大厅出错:${e.stack} `);
            return new ApiResult(httpState.ERROR, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
        }
    }

    /**
     * 
     * @param param0 
     * @param session 
     * @description 机器人入口
     */
    async entryHallForRobot({ uid, token, nid }, session: FrontendSession) {
        try {
            /** Step 1: 验证token */
            if (!uid || !token) {
                return new ApiResult(connectorEnum.MISS_FIELD, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }

            const tokenAuthResult = auth(token);

            if (tokenAuthResult) {
                // this.logger.warn(`${this.loggerPreStr}登录大厅异常: | uid:${uid} | auth ${tokenAuthResult} `);

                return new ApiResult(connectorEnum.AUTH_TOKEN_FAIL, [], tokenAuthResult);
            }

            const robot = await RobotManagerDao.findOne({ uid }, false);

            if (!robot) {
                // this.logger.warn(`${this.loggerPreStr}登录大厅异常: | uid:${uid} | 未查询到玩家信息 `);

                return new ApiResult(connectorEnum.CAN_NOT_FIND_PLAYER, [], langsrv.getlanguage(null, langsrv.Net_Message.id_3));
            }

            /** Step 2: 绑定 session */
            const status = await this.connectorSessionService.bindSessionWithRobot(uid, robot.language, session, nid);

            if (!status) {

                // this.logger.warn(`${this.loggerPreStr}登录大厅异常: | 机器人 | uid:${uid} | 绑定session失败 `);

                return new ApiResult(connectorEnum.BIND_SESSION_FAIL, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }

            // if (status === 2) {
            //     return new ApiResult(connectorEnum.HAD_BIND_SESSION, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            // }

            /** Step 3: 更新信息 */


            robot.sid = pinus.app.getServerId();
            robot.position = PositionEnum.HALL;
            //
            // await getManager().transaction(async entityManager => {
            //     await entityManager.update(Robot, { uid }, {
            //         sid: robot.sid,
            //         position: robot.position,
            //         robotOnLine: true
            //     });
            // });
            // /**更新redis */
            // await RobotRedisDao.updateOne({ uid }, {
            //     sid: robot.sid,
            //     position: robot.position,
            //     robotOnLine: true
            // });

            await RobotRedisDao.updateOne({ uid }, {
                sid: robot.sid,
                position: robot.position,
                robotOnLine: true
            })
            return ApiResult.SUCCESS();
        } catch (e) {
            this.logger.error(`${this.loggerPreStr}登录大厅出错:${e.stack} `);
            return new ApiResult(httpState.ERROR, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
        }
    }

}

