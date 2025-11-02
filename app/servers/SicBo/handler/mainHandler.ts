'use strict';

import utils = require('../../../utils');
import gutils = require('../../../domain/games/util');
import sessionService = require('../../../services/sessionService');
import sicboConst = require('../lib/sicboConst');
import JsonMgr = require('../../../../config/data/JsonMgr');
import sicboService = require('../lib/util/lotteryUtil');
import RoomMgr from '../lib/SicBoRoomMgr';
import RedisManager = require('../../../common/dao/redis/lib/redisManager');
import langsrv = require('../../../services/common/langsrv');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";

import { getLogger } from 'pinus-logger';

const sicboLogger = getLogger('server_out', __filename);
// const sicboLogger = getLogger('server_out', __filename);
import { Application, BackendSession } from 'pinus';


function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = RoomMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "骰宝房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "骰宝玩家不存在" };
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


    /**骰宝
     * 请求押注区域赔率
     * @route SicBo.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.basicInfo==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            roomInfo.channelIsPlayer('SicBo.userChange', {
                playerNum: roomInfo.players.length,
                rankingList: roomInfo.rankingLists(),
                entryPlayer: playerInfo.basicsStrip()
            });
            let offline = roomInfo.getOffLineData(playerInfo);
            const res = {
                code: 200,
                room: {
                    sceneId: roomInfo.sceneId,
                    roomId,
                    roundId: roomInfo.roundId,
                    roomStatus: roomInfo.status,
                    lowBet: roomInfo.lowBet,
                    countDown: roomInfo.countDown < 0 ? 0 : roomInfo.countDown,
                    players: roomInfo.players.filter(pl => pl.bet > 0).map(pl => {
                        return { uid: pl.uid, gold: pl.gold };
                    }),
                    area_bet: roomInfo.area_bet,
                },
                pl: {
                    gold: playerInfo.gold - playerInfo.bet,
                    /**非0 可以续压 */
                    isRenew: playerInfo.isCanRenew()
                },
                offLine: offline,
            };
            return res;
        } catch (error) {
            sicboLogger.error('SicBo.mainHandler.basicInfo==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }


    /**
     * created by CL
     * 请求房间玩家列表
     * @route：SicBo.mainHandler.upstarts
     */
    async upstarts({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.upstarts==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 50) };
        } catch (error) {
            sicboLogger.error('SicBo.mainHandler.upstarts==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }

    /**
     * created by
     * 请求房间排行榜
     * @route SicBo.mainHandler.rankingList
     */
    async rankingList({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.rankingList==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            return { code: 200, rankingList: roomInfo.rankingLists() };
        } catch (error) {
            sicboLogger.error('SicBo.mainHandler.rankingList==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    };

    /**
     * 玩家下注
     * e.g. {area:'t1',bet:100}, {area:'p16',bet:500}, {area:'p17',bet:800}, {area:'dice3',bet:1000 }
     * @route SicBo.mainHandler.userBet
     */
    async userBet(msg: { area: string, bet: number }, session: BackendSession) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            const totalBet = msg.bet;
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.userBet==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            if (typeof totalBet !== 'number' || totalBet <= 0) {
                sicboLogger.error(`SicBo.mainHandler.userBet==>totalBet:${JSON.stringify(msg)}|`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status != 'BETTING') {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }

            //验证下注区域是否正确
            const isBetTrue = msg && roomInfo.betTrue(msg);
            if (!isBetTrue) {
                sicboLogger.error(`SicBo.mainHandler.userBet==>bets:${JSON.stringify(msg)}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.bet == 0 && (playerInfo.gold - playerInfo.bet) < roomInfo.lowBet) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            //判断金币是否够
            if (playerInfo.gold < totalBet + playerInfo.bet) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
            }

            //下注不能超过个人限制
            for (const area in playerInfo.bets) {
                if (playerInfo.bets[area].bet + msg.bet > roomInfo.tallBet) {
                    return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1108) };
                }
            }

            // 对压检测
            if (playerInfo.betCheck(msg, roomInfo)) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1013) };
            }

            playerInfo.playerBet(roomInfo, msg);
            roomInfo.channelIsPlayer('SicBo.otherBets', {
                bet: [{ uid, area: msg.area, bet: msg.bet }],
                rankingList: roomInfo.rankingLists()
            });
            let opts = {
                code: 200,
                // betAreas: roomInfo.userBetAreas(playerInfo),
                gold: playerInfo.gold - playerInfo.bet
            };
            return opts;
        } catch (error) {
            sicboLogger.error('SicBo.mainHandler.userBet==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**
     * 需押
     * @route SicBo.mainHandler.goonBet
     */
    async goonBet({ }, session: BackendSession) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.warn(`WanRenZJH.mainHandler.goonBet==>err:${err}|`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            // 是否下注时间
            if (roomInfo.status !== "BETTING") {
                return {
                    code: 500,
                    error: langsrv.getlanguage(language, langsrv.Net_Message.id_1011)
                };
            }
            if (playerInfo.bet > 0) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }

            // 需押总金币
            const tatalbet = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (tatalbet == 0) {
                return { code: 200 };
            }

            if (playerInfo.gold < roomInfo.lowBet) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            let opts: { uid: string, area: string, bet: number }[] = [];
            for (const lastBets of playerInfo.lastBets) {
                playerInfo.playerBet(roomInfo, lastBets);
                opts.push({ uid: playerInfo.uid, area: lastBets.area, bet: lastBets.bet });
            }
            roomInfo.channelIsPlayer('SicBo.otherBets', {
                bet: opts,
                rankingList: roomInfo.rankingLists()
            });
            let optss = {
                code: 200,
                gold: playerInfo.gold - playerInfo.bet
            };
            return optss;
        } catch (error) {
            sicboLogger.warn("WanRenZJH.mainHandler.goonBet==>", error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**
     * 请求游戏历史记录
     * @route SicBo.mainHandler.historyRecord
     */
    async historyRecord({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.historyRecord==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            let result = roomInfo.getRecird();

            return { code: 200, result };
        } catch (error) {
            sicboLogger.error('SicBo.mainHandler.historyRecord==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}