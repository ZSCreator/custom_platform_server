'use strict';
import { Application, BackendSession } from 'pinus';
import * as utils from '../../../utils';
import sessionService = require('../../../services/sessionService');
import * as caohuajiService from '../../../services/caohuajiService';
import * as langsrv from '../../../services/common/langsrv';
import CaohuajiMgr from '../lib/CHJRoomManagerImpl';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { betAstrict } from '../../../../config/data/gamesBetAstrict';
import { getLogger } from 'pinus-logger';
const caohuajiLogger = getLogger('server_out', __filename);

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = CaohuajiMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "草花机房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "草花机玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}


export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    constructor(private app: Application) {
    }
    /**
     * 加载完成
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.loaded==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3050) }
            }

            roomInfo.channelIsPlayer('onEntry', {
                players: roomInfo.rankingLists(),
                playerRankingList: roomInfo.rankingLists(),
                entryPlayer: playerInfo.basicsStrip()
            });
            return {
                code: 200,
                countdown: roomInfo.countdown,
                roundId: roomInfo.roundId,
                areaNum: roomInfo.areaNum,
                historys: roomInfo.historys,
                area: roomInfo.area,
                gold: utils.sum(playerInfo.gold),
                allCount: roomInfo.roundCount
            }
        } catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.loaded==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3050) }
        }
    }

    /**
     * 玩家下注
     */
    async bet({ index, bet }, session: BackendSession) {
        const { uid, nid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {

            //是否能下注
            if (err) {
                caohuajiLogger.warn(`caohuaji.mainHandler.bet==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_204) };
            }
            if (err || typeof bet !== 'number' || !roomInfo.area[index] || bet <= 0) {
                caohuajiLogger.warn(`caohuaji.mainHandler.bet==>err:${err}|bet:${bet}|index:${index}|room.status:${roomInfo.status}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_204) };
            }
            if (roomInfo.status !== 'BETTING') {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2011) };
            }
            //判断金币是否够
            if (bet > (utils.sum(playerInfo.gold))) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            //是否满足2000下注条件
            if (betAstrict.nid_9 && (betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, error: mes }
            }

            // 判断是否超过个人限红
            const areaBet = roomInfo.area[index].arr.find(betInfo => betInfo.uid === uid);
            const indexBetGold = areaBet ? areaBet.bet : 0;

            //是否超过限红
            if (bet + indexBetGold > roomInfo.maxBetNum) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1104) }
            }

            // 执行扣钱
            playerInfo.gold -= bet;
            // 添加奖池
            roomInfo.addJackpot(playerInfo, index, bet);

            playerInfo.bets(roomInfo, index, bet);

            // 添加日志
            // caohuajiService.isRobotLog(player.isRobot) && caohuajiLogger.info(`下注|${roomInfo.nid}|${roomInfo.roomId}|${player.uid}|${bet}|${index}|${player.isRobot}`);
            return {
                code: 200,
                area: roomInfo.area,
                gold: utils.sum(playerInfo.gold),
                areaIndex: index,
                uid,
                allBet: playerInfo.betArea[index],
            }
        } catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.bet==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_204) }
        }
    }

    /**
     * 获取玩家列表
     */
    async getPlayerList({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {

            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.getPlayerList==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3051) }
            }
            return { code: 200, upstarts: roomInfo.rankingLists() }
        } catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.getPlayerList==>', error);
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3051) }
        }
    }
    /**
     * 获取奖池数据
     */
    async getJackpot({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.getJackpot==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3052) }
            }
            return { code: 200, jackpot: roomInfo.jackpot };
        } catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.getJackpot==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3052) }
        }
    }

    //获取历史记录
    async getHistory({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.getHistory==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3053) }
            }
            return { code: 200, history: roomInfo.historys }
        } catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.getHistory==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3053) }
        }
    }
}