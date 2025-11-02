import { Application, BackendSession, getLogger, pinus } from "pinus";
import { IBackToHall, IEnterGameOrSelectionListOption, } from "../../../common/pojo/dto/IHall.mainHandler";
import { ApiResult } from "../../../common/pojo/ApiResult";
import { MainHandlerValidationRulesService } from "../service/MainHandlerValidationRulesService";
import { hallState, httpState } from "../../../common/systemState";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import * as sessionService from "../../../services/sessionService";
import { PositionEnum } from "../../../common/constant/player/PositionEnum";
import * as ServerCurrentNumbersPlayersDao from "../../../common/dao/redis/ServerCurrentNumbersPlayersDao";
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import SceneManagerDao from "../../../common/dao/daoManager/Scene.manager";
import { PlayerGameHistory } from "../../../common/dao/mysql/entity/PlayerGameHistory.entity";
import GameManager from "../../../common/dao/daoManager/Game.manager";
import { Player } from "../../../common/dao/mysql/entity/Player.entity";
import PlayersInRoomDao from "../../../common/dao/redis/PlayersInRoom.redis.dao";
import SystemGameTypeManager from "../../../common/dao/daoManager/SystemGameType.manager";
import OnlinePlayerRedisDao from "../../../common/dao/redis/OnlinePlayer.redis.dao";
import { PlayerGameHistoryStatus } from "../../../common/dao/mysql/entity/enum/PlayerGameHistoryStatus.enum";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";
import { SLOTS_GAME } from "../../../consts/hallConst";
import { get_games, getScenes } from "../../../pojo/JsonConfig";
import IPLHttpUtill from "../../IPL/lib/utils/IPLHttp.utill";
import * as moment from "moment";
import IPLRecordMysqlDao from "../../../common/dao/mysql/IPLRecord.mysql.dao";
import GameLoginStatistics = require("../../../services/hall/GameLoginStatistics");
import langsrv = require('../../../services/common/langsrv');
import hallConst = require('../../../consts/hallConst');
import { ScenePointValueMap } from "../../../../config/data/gamesScenePointValue";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { GameRecordStatusEnum } from "../../../common/dao/mysql/enum/GameRecordStatus.enum";
import GameRecordDateTableMysqlDao from "../../../common/dao/mysql/GameRecordDateTable.mysql.dao";
import PlatformNameAgentListRedisDao from "../../../common/dao/redis/PlatformNameAgentList.redis.dao";


const logger = getLogger("server_out", __filename);
const loggerPreStr = `大厅服务器 ${pinus.app.getServerId()} | `;

export default function (app: Application) {
    return new MainHandler(app);
}

export class MainHandler {
    loggerPreStr: string;

    validationRulesService: MainHandlerValidationRulesService;

    constructor(private app: Application) {
        this.validationRulesService = new MainHandlerValidationRulesService(this);
    }

    /**
     * 根据游戏类型来获取游戏nid List
     * @param typeId
     * @param session
     *  hall.mainHandler.getGameTypeListForTypeId { typeId }
     */
    async getGameTypeListForTypeId({ typeId }, session: BackendSession): Promise<any> {
        const uid = session.uid;
        try {
            if (!uid) {
                return new ApiResult(httpState.ERROR, [], `请求错误`);
            }
            const player = await PlayerManagerDao.findOne({uid},false);
            if(!player){
                return new ApiResult(httpState.ERROR, [], `请求错误`);
            }
            let nidList = [];
            if (typeId == 5) {
                //获取我的游戏内容
                let player = await PlayerManagerDao.findOne({ uid: uid }, false);
                if (player && player.myGames) {
                    let myGamesNidList = player.myGames.split(',')
                    for (let m of myGamesNidList) {
                        nidList.push({ nid: m })
                    }
                    nidList.reverse();
                }
            } else {
                if (!typeId.toString()) {
                    return new ApiResult(httpState.ERROR, [], null);
                }
                const game = await SystemGameTypeManager.findOne({ typeId })
                if (!game) {
                    return new ApiResult(httpState.SUCCESS, []);
                }
                nidList = game.nidList;
            }
            const games = await GameManager.findList({});
            const resultList = [];

            //根据玩家分代情况来过滤游戏
            let closeGameList = [];
            if(player && player.groupRemark) {
                //查找平台是否关闭了该游戏
                const platformName = await PlatformNameAgentListRedisDao.findPlatformNameForAgent({agent: player.groupRemark});
                if (platformName) {
                    closeGameList = await PlatformNameAgentListRedisDao.getPlatformCloseGame({platformName: platformName});
                }
            }

            for (const m of nidList) {

                if(closeGameList.length > 0){
                    if(closeGameList.includes(m.nid)){
                        continue;
                    }
                }

                const game = await games.find(x => x.nid == m.nid);

                if (game) {
                    resultList.push({
                        nid: m.nid,
                        sort: m.sort,
                        whetherToShowScene: game.whetherToShowScene,
                        whetherToShowRoom: game.whetherToShowRoom,
                        whetherToShowGamingInfo: game.whetherToShowGamingInfo,
                    });
                }
            }
            resultList.sort((a, b) => a.sort - b.sort);
            return new ApiResult(httpState.SUCCESS, resultList);
        } catch (e) {
            logger.error(`${loggerPreStr}进入游戏出错：${e.stack || e.message || e}`);
            return new ApiResult(httpState.ERROR, [], null);
        }
    }

    /**
     *
     * @route hall.mainHandler.enterGameOrSelectionList
     */
    async enterGameOrSelectionList(parameter: IEnterGameOrSelectionListOption, session: BackendSession) {
        let { nid, whetherToShowScene, whetherToShowGamingInfo, sceneId, roomId, param } = parameter;
        let language = null;
        const { uid } = session;

        try {
            const player: Player = (await PlayerManagerDao.findOne({ uid }) as Player);
            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult(hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }

            language = player.language;
            await this.validationRulesService._enterGameOrSelectionListValidate(language, parameter);

            /**
             * 盘路 or 选场
             * @description 分支:1.盘路 2.选场
             */
            if (whetherToShowGamingInfo || whetherToShowScene) {
                return await showGameOrSceneInfo(session, player, nid, roomId);
            }

            /**
             * 进入游戏
             */
            const { name } = get_games(nid);
            const serverId = await selectServerId(name);
            const sceneList = await SceneManagerDao.findList({ nid });

            /** Step 1: 若无场编号则获取场编号 */
            if (typeof sceneId !== 'number' && !sceneId) {
                sceneId = sceneList[0].sceneId;
            }

            // 金币不足
            if (player.gold < sceneList[sceneId].entryCond) {
                return new ApiResult(hallState.Gold_Not_Enough_To_Join_Game, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_2034, sceneList[sceneId].entryCond / 100));
            }

            if (!pinus.app.rpc[name]) {
                return new ApiResult(hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
            }

            // 调用进入房间接口
            const { code, msg, roomId: rId } = await pinus.app.rpc[name].mainRemote.entry.toServer(serverId, {
                nid,
                roomId,
                sceneId,
                player,
                param
            });

            if (code !== 200) {
                return new ApiResult(hallState.Can_Not_Get_useableRoom, [], msg);
            }

            roomId = rId;

            /** 对应后端服务器在线人数 +1 */
            await ServerCurrentNumbersPlayersDao.increaseByServerId(serverId);

            // 记录玩家游戏日志
            await recordPlayGameLog(player, nid, sceneId, roomId);
            // session
            await sessionService.sessionSet(session, { nid, sceneId, roomId, backendServerId: serverId });
            // 更新玩家在线信息
            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 3`);

            // 通知租户调控
            noticeTenantControl(player, nid, sceneId);

            await updateOnlinePlayer(player, serverId, nid, sceneId, roomId);
            await GameLoginStatistics.increase_to_db(nid, sceneId, uid);
            await PlayersInRoomDao.insertOne(serverId, roomId, uid, player.isRobot);
            return new ApiResult(httpState.SUCCESS, { roomId, playerInfo: { gold: player.gold } });
        } catch (e) {

            if (e instanceof ApiResult) {
                return e;
            }

            logger.error(`${loggerPreStr}进入游戏出错：${e.stack || e.message || e}`);
            return new ApiResult(httpState.ERROR, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226));
        }

    }


    async backToHall({ nid }: IBackToHall, session: BackendSession): Promise<ApiResult> {
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

            // 如果是做了租户隔离的游戏
            if (!SLOTS_GAME.includes(nid)) {
                const { name } = await GameManager.findOne({ nid });
                await pinus.app.rpc[name].mainRemote.leaveGameAndBackToHall.toServer('*', {
                    group_id: player.group_id, lineCode: player.lineCode, uid: player.uid, roomId: '-1'
                });
            }


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
            });
            return ApiResult.SUCCESS();
        } catch (e) {
            logger.error(`${loggerPreStr}uid:${uid} | 从 nid: ${uid} 游戏信息列表(盘路) | 返回大厅出错：${e.stack || e.message || e}`);

            return ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }

    async leaveRoomAndGame({ saveProfit = false, goToHall = false }, session: BackendSession) {
        let language = null;
        try {
            let { uid, nid, roomId, sceneId, backendServerId } = sessionService.sessionInfo(session);
            // 判断在线online是否存在，不存在就不走下面的逻辑
            // if (uid) {
            //     const onlinePlayer = await OnlinePlayerRedisDao.findOne({ uid });
            //     if (!onlinePlayer) {
            //         return ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
            //     }
            // }
            /// @ts-ignore
            let player: Player = await PlayerManagerDao.findOne({ uid }, false);

            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult(hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }


            if (!nid || !roomId || typeof sceneId !== "number" || !backendServerId) {
                logger.info(`${loggerPreStr}uid:${uid} | 用户已经返回大厅`);
                return new ApiResult(hallState.Player_Had_Leave, { gold: player.gold }, null);
            }

            /** Step 1: RPC 离开房间 */
            const exitParameters = { nid, sceneId, roomId, player };

            const game = await GameManager.findOne({ nid });

            if (!game) {
                return new ApiResult(hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
            }

            const { name } = game;

            if (!pinus.app.rpc[name]) {
                return new ApiResult(hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
            }

            const result = await pinus.app.rpc[name].mainRemote.exit.toServer(backendServerId, exitParameters);

            if (result.code === 500) return ApiResult.ERROR([], result.msg);

            if (result.code !== 200) return new ApiResult(result.code, [], result.msg);

            let position = PositionEnum.BEFORE_ENTER_Game;
            // 如果是做了租户隔离的游戏
            if (goToHall) {
                if (!SLOTS_GAME.includes(nid)) {
                    await pinus.app.rpc[name].mainRemote.leaveGameAndBackToHall.toServer('*', {
                        group_id: player.group_id, lineCode: player.lineCode, uid: player.uid, roomId: '-1'
                    });
                }


                position = PositionEnum.HALL;
            }

            /** Step 2: 删除房间玩家 */
            await PlayersInRoomDao.delete(backendServerId, roomId, uid, player.isRobot);

            await PlayerManagerDao.updateOne({ uid }, {
                abnormalOffline: false,
                position: position
            });

            // session
            await sessionService.sessionSet(session, { roomId: null, sceneId: null, nid: goToHall ? '-1' : nid });

            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 4`);
            await OnlinePlayerRedisDao.updateOne({ uid }, {
                uid,
                nid: nid,
                sceneId: -1,
                isRobot: player.isRobot,
                entryHallTime: new Date(),
                roomId: '-1',
                hallServerId: player.sid
            });

            // 更新对应的服务器在线人数
            await ServerCurrentNumbersPlayersDao.decreaseByServerId(backendServerId);
            if (player.isRobot === RoleEnum.ROBOT) {
                return ApiResult.SUCCESS();
            }

            logger.info(`${loggerPreStr}离开游戏 | 玩家:${uid} |nid: ${nid} | sceneId: ${sceneId} | roomId: ${roomId}`);
            /// @ts-ignore
            player = await PlayerManagerDao.findOne({ uid }, false);
            return ApiResult.SUCCESS({
                gold: player.gold,
                lastRoom: roomId,
                lastGame: nid,
                mailLength: 0
            }, "操作成功");
        } catch (e) {
            logger.error(`${loggerPreStr}离开游戏出错：${e.stack || e.message || e}`);
            return ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }

    /**
     * 对战游戏重选 只针对那种需要退出房间重新进的游戏
     * @route hall.mainHandler.reelectRoom
     */
    async reelectRoom({ param }, session: BackendSession) {
        let language = null;
        try {
            let { uid, nid, roomId, sceneId, backendServerId } = sessionService.sessionInfo(session); 
            await this.leaveRoomAndGame({}, session);
            let parameter: IEnterGameOrSelectionListOption = {
                nid: nid as any,
                whetherToShowScene: true,
                whetherToShowRoom: false,
                whetherToShowGamingInfo: false,
                sceneId,
                roomId: null,
                param
            };
            await this.enterGameOrSelectionList(parameter, session);
            parameter.whetherToShowScene = false;
            return await this.enterGameOrSelectionList(parameter, session);
        } catch (e) {
            logger.error(`${loggerPreStr}重选房间出错：${e.stack || e.message || e}`);
            return ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }

    async recoveryGold(_, session: BackendSession) {
        let language = null;
        const { uid, nid, roomId, sceneId, backendServerId } = sessionService.sessionInfo(session);
        try {
            let gold = 0;
            const player = await PlayerManagerDao.findOne({ uid });
            const res = await IPLHttpUtill.userfunds(uid);
            if (res.data.count !== 0) {
                gold = res.data.result[0].balance;
            }
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

                    // gold = (gold - new_balance) * 100;
                    let gameOrder = null;
                    if (group_id) {
                        gameOrder = `${group_id}-${uid}-${Date.now()}`;
                    } else {
                        gameOrder = `888-${uid}-${Date.now()}`;
                    }
                    const gameRecord = {
                        uid,
                        thirdUid: thirdUid,
                        group_id: group_id ? group_id : null,
                        nid: GameNidEnum.IPL,
                        gameName: "板球",
                        sceneId: -1,
                        roomId: "-1",
                        // gold: player.gold + (res.data.result[0].balance * 100),
                        gold: player.gold,
                        input: new_balance * 100,
                        validBet: new_balance * 100,
                        profit: (gold - new_balance) * 100,
                        status: GameRecordStatusEnum.Success,
                        createTimeDate: new Date(),
                        gameOrder
                    }

                    await GameRecordDateTableMysqlDao.insertOne(gameRecord);
                }

                await PlayerManagerDao.updateOne({ uid }, { gold: player.gold + (res.data.result[0].balance * 100) })

                return ApiResult.SUCCESS({
                    gold: player.gold + (res.data.result[0].balance * 100)
                })
            }

            return ApiResult.SUCCESS({ gold: player.gold });
        } catch (e) {
            logger.error(`${loggerPreStr}uid:${uid} | IPL回收金币 | 出错：${e.stack || e.message || e}`);
            return ApiResult.ERROR()
        }
    }

}



async function showGameOrSceneInfo(session: BackendSession, player: Player, nid: string, roomId: string) {
    let result: any = {};
    const { name } = await GameManager.findOne({ nid });
    const serverInfoList = pinus.app.getServersByType(name);
    let serverId = serverInfoList[0].id;
    const sceneList = await SceneManagerDao.findList({ nid });
    //场进行排序
    result.sceneList = sceneList.sort((a, b) => (a.sceneId - b.sceneId));
    const historyRecord = await ConnectionManager.getConnection(true)
        .createQueryBuilder(PlayerGameHistory, "history")
        .where("history.uid = :uid", { uid: player.uid })
        .orderBy("history.createDateTime", "DESC")
        .getOne();
    result.lastGame = null;
    result.lastRoom = null;

    /** 如果时间超过2分钟就不让重连了*/
    if (historyRecord) {
        let enterTime = new Date(historyRecord.createDateTime).getTime();
        let nowData = Date.now();
        if (nowData - enterTime < 2 * 60 * 1000) {
            result.lastGame = historyRecord.nid;
            result.lastRoom = historyRecord.roomId;
        }
    }
    result.roomHistoryList = [];


    await PlayerManagerDao.updateOne({ uid: player.uid }, { position: PositionEnum.BEFORE_ENTER_Game });

    // 绑定进入的游戏
    await sessionService.sessionSet(session, { 'nid': nid });

    //不是单机类就需要租户隔离，红包和百人21点走其他方法
    // if (!hallConst.SLOTS_GAME.includes(nid) && (!["17", "81"].includes(nid))) {
    if (!hallConst.SLOTS_GAME.includes(nid)) {
        const res = await pinus.app.rpc[name].mainRemote.entryScenes.toServer(serverId, { player });

        if (res.code !== 200) {
            return ApiResult.ERROR([], langsrv.getlanguage(player.language, langsrv.Net_Message.id_6));
        }

        if (res.data && res.data.length > 0) {
            result.roomHistoryList = res.data.sort((a, b) => a.sceneId - b.sceneId);

            if (nid === "81") {
                result.sceneList = result.sceneList.map(info => {
                    info.roomId = res.data.find(_info => _info.sceneId === info.sceneId).roomId;
                    return info;
                })
            }
        }
    }

    // 查看是否含有pointValue数据c
    if (ScenePointValueMap.hasOwnProperty(nid)) {
        result.sceneList.forEach(s => s.pointValue = ScenePointValueMap[nid].pointValue);
    }

    // 更新玩家在线信息
    logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${player.uid} | tag 2`);
    await OnlinePlayerRedisDao.updateOne({ uid: player.uid }, {
        nid: nid,
        uid: player.uid,
        sceneId: -1,
        isRobot: player.isRobot,
        entryGameTime: new Date(),
        roomId,
        hallServerId: pinus.app.getServerId(),
    });
    return new ApiResult(httpState.SUCCESS, result, "操作成功");
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

/**
 * 通知租户调控
 * @param player 玩家
 * @param nid 游戏id
 * @param sceneId 场id
 */
async function noticeTenantControl(player: Player, nid: GameNidEnum, sceneId: number) {
    if (!player.group_id) {
        return;
    }

    await pinus.app.rpc.control.mainRemote.addTenantGameScene.toServer('*', {
        platformId: player.group_id, tenantId: player.groupRemark, nid, sceneId,
    });
}