import { Application, BackendSession, getLogger, pinus } from "pinus";
const logger = getLogger("server_out", __filename);
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { Player } from "../../../common/dao/mysql/entity/Player.entity";
import { ApiResult } from "../../../common/pojo/ApiResult";
import { hallState } from "../../../common/systemState";
import { get_games } from "../../../pojo/JsonConfig";
import langsrv = require('../../../services/common/langsrv');
import * as ServerCurrentNumbersPlayersDao from "../../../common/dao/redis/ServerCurrentNumbersPlayersDao";
import { PositionEnum } from "../../../common/constant/player/PositionEnum";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";
import { PlayerGameHistory } from "../../../common/dao/mysql/entity/PlayerGameHistory.entity";
import { PlayerGameHistoryStatus } from "../../../common/dao/mysql/entity/enum/PlayerGameHistoryStatus.enum";
import * as sessionService from "../../../services/sessionService";
import OnlinePlayerRedisDao from "../../../common/dao/redis/OnlinePlayer.redis.dao";
import GameLoginStatistics = require("../../../services/hall/GameLoginStatistics");
import PlayersInRoomDao from "../../../common/dao/redis/PlayersInRoom.redis.dao";
import IPLHttpUtill from "../lib/utils/IPLHttp.utill";
import IPLRecordMysqlDao from "../../../common/dao/mysql/IPLRecord.mysql.dao";
import * as moment from "moment";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { GameRecordStatusEnum } from "../../../common/dao/mysql/enum/GameRecordStatus.enum";
import GameRecordDateTableMysqlDao from "../../../common/dao/mysql/GameRecordDateTable.mysql.dao";

const loggerPreStr: string = `板球服务器服务器 ${pinus.app.getServerId()} | `;

export default function (app: Application) {
    return new MainHandler(app);
}

export class MainHandler {


    constructor(private app: Application) {
    }

    async enterGame({ nid }, session: BackendSession) {
        let language = null;
        const { uid } = session;
        try {
            const sceneId = 0;
            const roomId = "1";

            const player: Player = (await PlayerManagerDao.findOne({ uid }) as Player);

            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult(hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }

            let {
                userId
            } = player;

            language = "en";

            /** 无账号则注册 */
            if (userId === null) {
                const res = await IPLHttpUtill.accountMember(uid);
                // 板球平台用户名
                userId = res.data.User.user_id;

                await PlayerManagerDao.updateOne({
                    uid
                }, {
                    userId
                });
            }

            let _updateGold = null;

            if (player.gold >= 10000) {
                const updateGold = Math.floor(player.gold / 100);

                const walletOrderId = `IPL${moment().format("YYYYMMDDHHmmssSSS")}${uid}`;

                const recordRes = await IPLHttpUtill.userTransferApi(updateGold, walletOrderId, uid);

                const {
                    create_at: createTime,
                    code,
                    user_id: userId,
                    ...rest
                } = recordRes.data

                const insertParams = {
                    uid: uid,
                    userId,
                    createTime,
                    ...rest
                }

                await IPLRecordMysqlDao.insertOne(insertParams);

                const afterUpdateGold = player.gold - (updateGold * 100);

                await PlayerManagerDao.updateOne({
                    uid
                }, {
                    gold: afterUpdateGold
                });
                _updateGold = afterUpdateGold;
            }

            const { data } = await IPLHttpUtill.userLogin(language, uid);

            const loginUrl = data.login_url;

            /**
             * 进入游戏
             */
            const { name } = get_games(nid);

            const serverId = await selectServerId(name);

            /** 对应后端服务器在线人数 +1 */
            await ServerCurrentNumbersPlayersDao.increaseByServerId(serverId);
            // 记录玩家游戏日志
            await recordPlayGameLog(player, nid, sceneId, roomId);
            // session
            await sessionService.sessionSet(session, { nid, sceneId, roomId, backendServerId: serverId });
            // 更新玩家在线信息
            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 3`);

            await updateOnlinePlayer(player, serverId, nid, sceneId, roomId);
            await GameLoginStatistics.increase_to_db(nid, sceneId, uid);
            await PlayersInRoomDao.insertOne(serverId, roomId, uid, player.isRobot);
            return new ApiResult(200, { loginUrl, gold: typeof _updateGold === "number" ? _updateGold : player.gold });
        } catch (e) {
            if (e instanceof ApiResult) {
                return e;
            }

            logger.error(`${loggerPreStr}进入游戏出错：${e.stack || e.message || e}`);
            return new ApiResult(500, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226));
        }

    }

    async recoveryGold({ }, session: BackendSession) {
        const { uid } = session;
        let language = null;
        try {
            // 判断在线online是否存在，不存在就不走下面的逻辑
            // if (uid) {
            //     const onlinePlayer = await OnlinePlayerRedisDao.findOne({ uid });
            //     if (!onlinePlayer) {
            //         return ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
            //     }
            // }

            /// @ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, false);

            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);

                return new ApiResult(hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }
            let gold = 0;
            if (player.gold < 10000) {
                const res = await IPLHttpUtill.userfunds(uid);
                gold = res.data.result[0].balance;

                if (gold > 0) {
                    const walletOrderId = `IPL${moment().format("YYYYMMDDHHmmssSSS")}${uid}`;

                    const recordRes = await IPLHttpUtill.userTransferApi(-gold, walletOrderId, uid);

                    const {
                        create_at: createTime,
                        code,
                        user_id: userId,
                        ...rest
                    } = recordRes.data

                    const insertParams = {
                        uid: uid,
                        userId,
                        createTime,
                        ...rest
                    }

                    await IPLRecordMysqlDao.insertOne(insertParams);

                    const record = await IPLRecordMysqlDao.findLastOneByUid(player.uid);

                    if (!!record) {
                        const {
                            uid,
                            thirdUid,
                            group_id
                        } = player;

                        // 最近的上分
                        const { new_balance } = record;

                        gold = (gold - new_balance) * 100;

                        const gameRecord = {
                            uid,
                            thirdUid: thirdUid,
                            group_id: group_id ? group_id : null,
                            nid: GameNidEnum.IPL,
                            gameName: "板球",
                            sceneId: -1,
                            roomId: "-1",
                            gold: player.gold,
                            input: new_balance * 100,
                            validBet: new_balance * 100,
                            profit: gold,
                            status: GameRecordStatusEnum.Success,
                            createTimeDate: new Date()
                        }

                        await GameRecordDateTableMysqlDao.insertOne(gameRecord);
                    }



                    await PlayerManagerDao.updateOne({ uid }, { gold: player.gold + (res.data.result[0].balance * 100) });
                }

            }

            /* 

            await PlayerManagerDao.updateOne({ uid }, { position: PositionEnum.HALL });

            await sessionService.sessionSet(session, { nid: "-1", sceneId: -1, roomId: "-1", });

            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 1`);
            await OnlinePlayerRedisDao.updateOne({ uid }, {
                uid,
                nid: "-1",
                isRobot: player.isRobot,
                sceneId: -1,
                entryHallTime: new Date(),
                roomId: '-1',
                hallServerId: player.sid
            }); */
            return ApiResult.SUCCESS();
        } catch (e) {
            logger.error(`${loggerPreStr}uid:${uid} | 从 nid: ${uid} 游戏信息列表(盘路) | 返回大厅出错：${e.stack || e.message || e}`);

            return ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }

}

/**
 * 选择服务器id
 */
async function selectServerId(name: string) {
    const serverInfoList = pinus.app.getServersByType(name);
    let serverId = serverInfoList[0].id;

    if (serverInfoList.length !== 1) {
        const serverListAfterSort = await Promise.all(serverInfoList.map(async ({ id }) => {
            return { sId: id, num: parseInt(await ServerCurrentNumbersPlayersDao.findByServerId(id)) };
        }));

        serverListAfterSort.sort((a, b) => a.num - b.num);

        const { sId } = serverListAfterSort[0];

        serverId = sId;
    }

    return serverId;
}

/**
 * 记录玩家游戏日志
 * @param player
 * @param nid
 * @param sceneId
 * @param roomId
 */
async function recordPlayGameLog(player: Player, nid: string, sceneId: number, roomId: string) {
    let myGames;
    /** 记录玩家最近进入的10个游戏 */
    if (player.myGames) {
        const myGamesNidList = player.myGames.split(',');
        if (!myGamesNidList.includes(nid)) {
            if (myGamesNidList.length == 10) {
                myGamesNidList.splice(0, 1);
            }
            myGamesNidList.push(nid);
            myGames = myGamesNidList.toString();
        } else {
            myGames = player.myGames
        }
    } else {
        let myGamesNidList = [];
        myGamesNidList.push(nid);
        myGames = myGamesNidList.toString();
    }

    /** 玩家历史记录 */
    await PlayerManagerDao.updateOne({ uid: player.uid }, {
        position: PositionEnum.GAME,
        kickedOutRoom: false,
        abnormalOffline: true,
        myGames: myGames
    });

    const historyRep = ConnectionManager.getRepository(PlayerGameHistory);

    const history = historyRep.create({
        uid: player.uid,
        nid,
        sceneId,
        roomId,
        gold: player.gold,
        status: PlayerGameHistoryStatus.EntryGold
    });

    await historyRep.save(history);
}

/**
 * 更新在线玩家信息
 * @param player
 * @param serverId
 * @param nid
 * @param sceneId
 * @param roomId
 */
async function updateOnlinePlayer(player: Player, serverId: string, nid: string, sceneId: number, roomId: string) {
    await OnlinePlayerRedisDao.updateOne({ uid: player.uid }, {
        uid: player.uid,
        nid: nid,
        sceneId,
        isRobot: player.isRobot,
        entryGameTime: new Date(),
        roomId,
        hallServerId: serverId
    });
}