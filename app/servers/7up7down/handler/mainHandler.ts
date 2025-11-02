'use strict';
import { Application, BackendSession } from 'pinus';
import utils = require('../../../utils');
import gutils = require('../../../domain/games/util');
import sessionService = require('../../../services/sessionService');
import up7Const = require('../lib/up7Const');
import JsonMgr = require('../../../../config/data/JsonMgr');
import lotteryUtil = require('../lib/util/lotteryUtil');
import RoomMgr from '../lib/up7RoomMgr';
import RedisManager = require('../../../common/dao/redis/lib/redisManager');
import langsrv = require('../../../services/common/langsrv');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { getLogger } from 'pinus-logger';
import { BetAreas } from "../lib/up7Const";
const up7Logger = getLogger('server_out', __filename);
import roomManager, { upRoomManger } from '../lib/up7RoomMgr';



function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = RoomMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: `7up7down 房间不存在|${sceneId}|${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "7up7down 玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}

export default function (app: Application) {
    return new MainHandler(app);
}

export class MainHandler {
    constructor(private app: Application) {
    }


    /**7up7down
     * 请求押注区域赔率
     * @route 7up7down.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, err } = check(sceneId, roomId, uid);
        try {
            if (err) {
                up7Logger.warn(`7up7down.mainHandler.loaded==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            // let offline = roomInfo.getOffLineData(playerInfo);
            const opts: up7Const.up7down_mainHandler_loaded = {
                code: 200,
                room: {
                    sceneId: roomInfo.sceneId,
                    roomId,
                    roundId: roomInfo.roundId,
                    roomStatus: roomInfo.status,
                    tallBet: roomInfo.tallBet,
                    lowBet: roomInfo.lowBet,
                    countDown: roomInfo.countDown < 0 ? 0 : roomInfo.countDown,
                    rankingList: roomInfo.rankingLists().slice(0, 6),
                    situations: roomInfo.situations,
                    up7Historys: roomInfo.getRecird().slice(-20)
                },
                pl: {
                    gold: playerInfo.gold,
                    /**非0 可以续压 */
                    isRenew: playerInfo.isCanRenew()
                },
                offLine: roomInfo.resultStrip()
            };
            return opts;
        } catch (error) {
            up7Logger.error('7up7down.mainHandler.basicInfo==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }


    /**
     * created by CL
     * 请求房间玩家列表
     * @route 7up7down.mainHandler.upstarts
     */
    async upstarts({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, err } = check(sceneId, roomId, uid);
        try {
            if (err) {
                up7Logger.error(`7up7down.mainHandler.upstarts==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 50) };
        } catch (error) {
            up7Logger.error('7up7down.mainHandler.upstarts==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }

    /**
     * created by
     * 请求房间排行榜
     * @route 7up7down.mainHandler.rankingList
     */
    async rankingList({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, err } = check(sceneId, roomId, uid);
        try {
            if (err) {
                up7Logger.error(`7up7down.mainHandler.rankingList==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            return { code: 200, rankingList: roomInfo.rankingLists() };
        } catch (error) {
            up7Logger.error('7up7down.mainHandler.rankingList==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    };

    /**
     * 玩家下注
     * e.g. {area:'t1',bet:100}, {area:'p16',bet:500}, {area:'p17',bet:800}, {area:'dice3',bet:1000 }
     * @route 7up7down.mainHandler.userBet
     */
    async userBet(msg: { area: BetAreas, bet: number }, session: BackendSession) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, err } = check(sceneId, roomId, uid);
        try {
            if (err) {
                up7Logger.error(`7up7down.mainHandler.userBet==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            if (!up7Const.points.includes(msg.area) || typeof msg.bet !== 'number' || msg.bet <= 0) {
                up7Logger.error(`7up7down.mainHandler.userBet==>totalBet:${JSON.stringify(msg)}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status != 'BETTING') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }

            if (playerInfo.bet == 0 && playerInfo.gold < roomInfo.lowBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            //判断金币是否够
            if (playerInfo.gold < msg.bet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            if (
                (msg.area == up7Const.BetAreas.AA && playerInfo.betAreas.some(c => c.area == up7Const.BetAreas.CC)) ||
                (msg.area == up7Const.BetAreas.CC && playerInfo.betAreas.some(c => c.area == up7Const.BetAreas.AA))
            ) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            //下注不能超过个人限制
            const tallBet = (msg.area == up7Const.BetAreas.AA || msg.area == up7Const.BetAreas.CC) ? roomInfo.tallBet : roomInfo.tallBet / 2;
            const totalBet = playerInfo.bets[msg.area] ? playerInfo.bets[msg.area].bet + msg.bet : msg.bet;
            if (totalBet > tallBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1108) };
            }

            playerInfo.playerBet(roomInfo, msg);
            roomInfo.channelIsPlayer('7up7down.otherBets', {
                bet: [{ uid, area: msg.area, bet: msg.bet }],
                rankingList: roomInfo.rankingLists().slice(0, 6)
            });
            let opts = {
                code: 200,
                gold: playerInfo.gold
            };
            return opts;
        } catch (error) {
            up7Logger.error('7up7down.mainHandler.userBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**
     * 需押
     * @route 7up7down.mainHandler.goonBet
     */
    async goonBet({ }, session: BackendSession) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                up7Logger.warn(`7up7down.mainHandler.goonBet==>err:${err}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            // 是否下注时间
            if (roomInfo.status !== "BETTING") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }
            if (playerInfo.bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }

            // 需押总金币
            const tatalbet = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (tatalbet == 0) {
                return { code: 200 };
            }

            if (playerInfo.gold < roomInfo.lowBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            let opts: { uid: string, area: string, bet: number }[] = [];
            for (const lastBets of playerInfo.lastBets) {
                playerInfo.playerBet(roomInfo, lastBets);
                opts.push({ uid: playerInfo.uid, area: lastBets.area, bet: lastBets.bet });
            }
            roomInfo.channelIsPlayer('7up7down.otherBets', {
                bet: opts,
                rankingList: roomInfo.rankingLists().slice(0, 6)
            });
            let optss = {
                code: 200,
                gold: playerInfo.gold - playerInfo.bet
            };
            return optss;
        } catch (error) {
            up7Logger.warn("7up7down.mainHandler.goonBet==>", error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**
     * 请求游戏历史记录
     * @route 7up7down.mainHandler.historyRecord
     */
    async historyRecord({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, err } = check(sceneId, roomId, uid);
        try {
            if (err) {
                up7Logger.error(`7up7down.mainHandler.historyRecord==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            let result = roomInfo.getRecird();
            return { code: 200, result };
        } catch (error) {
            up7Logger.error('7up7down.mainHandler.historyRecord==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}