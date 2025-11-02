import { Application, BackendSession, pinus } from "pinus";
import { sessionInfo, sessionSet } from '../../services/sessionService';
import { isNullOrUndefined } from '../../utils/lottery/commonUtil';
import * as utils from '../../utils';
import { getLogger } from 'pinus-logger';
import { BackendControlService } from "../../services/newControl/backendControlService";
/** Mysql */
import PlayerManagerDao from "../../common/dao/daoManager/Player.manager";
import { closeSession } from "./service/SessionService";
import { Player } from "../dao/mysql/entity/Player.entity";
import OnlinePlayerRedisDao from "../dao/redis/OnlinePlayer.redis.dao";
import { Robot } from "../dao/mysql/entity/Robot.entity";
import RobotManagerDao from "../dao/daoManager/Robot.manager";
import RobotLeaveTaskQueue from "../dao/redis/RobotLeaveTaskQueue.redis.dao";
import { PositionEnum } from "../constant/player/PositionEnum";
import GameManager from "../dao/daoManager/Game.manager";
import { SLOTS_GAME } from "../../consts/hallConst";
import PlayersInRoomDao from "../../common/dao/redis/PlayersInRoom.redis.dao";
import IPLHttpUtill from "../../servers/IPL/lib/utils/IPLHttp.utill";
import IPLRecordMysqlDao from "../dao/mysql/IPLRecord.mysql.dao";
import * as moment from "moment";
import { GameNidEnum } from "../constant/game/GameNidEnum";
import { GameRecordStatusEnum } from "../dao/mysql/enum/GameRecordStatus.enum";
import GameRecordDateTableMysqlDao from "../dao/mysql/GameRecordDateTable.mysql.dao";

const logger = getLogger('server_out', __filename);

/**
 * 事件: 玩家离开session
 * @param app
 * @param session
 */
export async function playerCloseSessionByMysql(app: Application, session: BackendSession) {

    if (!session || !session.uid) {
        logger.warn(`session 不存在 bug`)
        return;
    }

    const { uid, nid, roomId, sceneId, backendServerId } = sessionInfo(session);

    let kickself = false;
    let position = null;
    try {
        const player = await PlayerManagerDao.findOne({ uid }, false);

        if (!player) {
            logger.warn(`RPC 玩家离线 未查询到玩家`);
            return;
        }

        const { language, isRobot, kickself: k } = player as Player;

        kickself = k;

        if (!isNullOrUndefined(roomId) && nid !== '-1') {
            if (nid !== "86") {
                await closeSession(backendServerId, nid, sceneId, roomId, player);
            } else {
                /** 板球 */
                if (backendServerId !== undefined)
                    await PlayersInRoomDao.delete(backendServerId, roomId, uid, isRobot);
                const updateParams = {
                    position: PositionEnum.HALL,
                    kickself: false,
                    abnormalOffline: false,
                    lastLogoutTime: new Date(),
                }

                // 查询当前剩余金额
                let gold = 0;
                try {
                    const res = await IPLHttpUtill.userfunds(uid);
                    gold = res.data.result[0].balance;
                    if (gold > 0) {
                        const walletOrderId = `IPL${moment().format("YYYYMMDDHHmmssSSS")}${uid}`;
                        const recordRes = await IPLHttpUtill.userTransferApi(-gold, walletOrderId, uid);

                        updateParams["gold"] = player.gold + gold * 100;

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
                    }
                } catch (e) {
                    logger.error(`连接服务器 ${app.getServerId()} | 玩家离线 | uid:${player.uid} | 昵称:${player.nickname} | ip:${player.ip} | 离开时金额 ${utils.sum(player.gold, true)} | 身份:${player.isRobot} | 板球通信出错`);
                }

                await PlayerManagerDao.updateOne({ uid }, updateParams);
            }
        } else if (player.position === PositionEnum.BEFORE_ENTER_Game && !SLOTS_GAME.includes(nid) && nid !== '-1') {
            const { name } = await GameManager.findOne({ nid });
            await pinus.app.rpc[name].mainRemote.leaveGameAndBackToHall.toServer('*', {
                group_id: player.group_id, lineCode: player.lineCode, uid: player.uid
            });
        } else if (nid === '-1' || isNullOrUndefined(roomId)) {
            await PlayerManagerDao.updateOne({ uid }, { kickself: false });
        }


        if (kickself) {
            position = player.position;
        }

        await sessionSet(session, { roomId: null, backendServerId: null });

        logger.warn(`连接服务器 ${app.getServerId()} | 玩家离线 | uid:${player.uid} | 昵称:${player.nickname} | ip:${player.ip} | 离开时金额 ${utils.sum(player.gold, true)} | 身份:${player.isRobot} `);

        return;
    } catch (e) {
        logger.error(`连接服务器 ${app.getServerId()} | 玩家离线 异常 ==> uid: ${uid}, nid: ${nid}, sceneId: ${sceneId}, roomId: ${roomId}，错误：${e.stack || e.message || e}`);
        return;
    } finally {

        if (!kickself) {
            await OnlinePlayerRedisDao.deleteOne({ uid });

            // 是调控玩家删除集合
            await deleteOnlineTotalControl(uid);
        }
    }
}

export async function robotCloseSessionByMysql(app: Application, session: BackendSession) {
    if (!session || !session.uid) {
        logger.warn(`session 不存在 bug`)
        return;
    }

    const { uid, nid, roomId, sceneId, backendServerId } = sessionInfo(session);


    try {
        const robot = await RobotManagerDao.findOne({ uid }, false);

        if (!robot) {
            logger.warn(`RPC 机器人离线 未查询到玩家`);
            return;
        }

        if (!isNullOrUndefined(roomId)) {
            await closeSession(backendServerId, nid, sceneId, roomId, robot as any);
        }

        await RobotLeaveTaskQueue.increaseRobot(uid);

        /* await RobotManagerDao.updateOne({ uid }, {
            position: PositionEnum.HALL,
            robotOnLine: false
        }); */

        await sessionSet(session, { roomId: null, backendServerId: null });
        return;
    } catch (e) {
        logger.error(`连接服务器 ${app.getServerId()} | 机器人离线 异常 ==> uid: ${uid}, nid: ${nid}, sceneId: ${sceneId}, roomId: ${roomId}，错误：${e.stack || e.message || e}`);
        return;
    }
}

/**
 * 玩家离线时候调用
 * @param uid
 */
async function deleteOnlineTotalControl(uid: string) {
    // 如果是总控玩家添加到在线集合里面
    if (await BackendControlService.isTotalControlPlayer(uid)) {
        await BackendControlService.removeOnlineControlPlayer(uid);
    }
}