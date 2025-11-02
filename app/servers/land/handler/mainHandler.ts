'use strict';
import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';
import doudizhuMgr from '../lib/landMgr';
import gutils = require('../../../domain/games/util');
import utils = require('../../../utils');
// import gameUtil3 = require("../lib/Abandoned/gameUtil3");
import land_Logic = require("../lib/land_Logic");
import sessionService = require('../../../services/sessionService');
// import gameUtil = require("../lib/Abandoned/gameUtil");
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);
import JsonMgr = require('../../../../config/data/JsonMgr');
import { CardsType, land_mainHandler_loaded } from "../lib/land_interface"
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import * as RedisManager from "../../../common/dao/redis/lib/redisManager";
import langsrv = require('../../../services/common/langsrv');
import landMgr from '../lib/landMgr';



function check(sceneId: number, roomId: string, uid: string) {
    // const roomId = doudizhuMgr.Instance().uid_roomId_map.get(uid);
    const roomInfo = doudizhuMgr.searchRoom(sceneId, roomId);

    if (!roomInfo) {
        return { err: "斗地主房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "未在房间中找到玩家", uid: uid, players: roomInfo.players };
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
     * @route: land.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, sceneId, roomId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }

        if (playerInfo.status == "NONE") {
            playerInfo.status = "WAIT";
            // 通知其他玩家有人加入房间(不是掉线玩家进入游戏才调用)
            const opts = {
                roomId: roomInfo.roomId,
                player: playerInfo.strip(),
                status: roomInfo.status,
                waitTime: roomInfo.getWaitTime(),
                roomNum: roomInfo.players.filter(m => m != null).length
            }
            roomInfo.channelIsPlayer('land_onEntry', opts);
        }
        roomInfo.note_pls();
        roomInfo.wait(playerInfo);
        playerInfo.trusteeshipType = 1;
        const opts: land_mainHandler_loaded = {
            code: 200,
            room: roomInfo.strip(),
            waitTime: roomInfo.getWaitTime(),
            seat: playerInfo.seat,
            roundId: roomInfo.roundId,
            offLine: roomInfo.getOffLineData(playerInfo),
            bet: playerInfo.bet,//玩家总下注额度
        }
        // 返回给客户端
        return opts;
    };

    /**
     * 抢地主
     * @param: {points}，叫的分数
     * @return:{ code: 200 }
     * @route land.mainHandler.qiangCard
     */
    async qiangCard(msg: { points: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        //不该你操作
        if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
        }
        if (![0, 1, 2, 3].includes(msg.points) || (msg.points > 0 && msg.points < roomInfo.points)) {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
        }
        roomInfo.record_history.oper.push({ uid, oper_type: "qiangCard", update_time: utils.cDate(), msg: `${msg.points}` });
        playerInfo.handler_ShoutPoints(roomInfo, msg.points);
        return { code: 200 };
    }

    /**
     * 加倍
     * @route land.mainHandler.double
     */
    async double(msg: { double: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        //不该你操作
        if (playerInfo.state == "PS_NONE") {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
        }
        if (![1, 2].includes(msg.double)) {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
        }
        roomInfo.record_history.oper.push({ uid, oper_type: "double", update_time: utils.cDate(), msg: `${msg.double}` });
        playerInfo.handler_Double(roomInfo, msg.double);
        return { code: 200 };
    }

    /**
    * 出牌,过牌
    * @param: {cardlist,cardType} 出的牌0-52 牌的类型
    * @return:{ code: 200 }
    * @route land.mainHandler.postCard
    */
    async postCard(msg: { cards: number[], cardType: land_Logic.CardsType }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        if (!utils.isContain(playerInfo.cardList, msg.cards)) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
        //不该你操作
        if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
        }
        if (roomInfo.lastDealPlayer.seat == playerInfo.seat && msg.cards.length == 0) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
        /**验证牌型的合理性 */
        if (!land_Logic.has_valid(msg.cards)) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
        return playerInfo.handler_postCards(msg.cards, msg.cardType, roomInfo);
    };

    /**
    * 系统聊天
    * @param: {sayType} 聊天的类型
    * @return:{ code: 200 }
    * @route land.mainHandler.sayHua
    */
    async sayHua({ sayType }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, err: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }

        roomInfo.channelIsPlayer('ddz_sayHua', {
            sayType: sayType,
            seat: playerInfo.seat
        });
        return { code: 200 }
    }
    /**
    * 托管
    * @param: {trusteeshipType}
    * @return:{ code: 200 }
    * @route land.mainHandler.tuoguan
    */
    async tuoguan(msg: { trusteeshipType: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }

        if (roomInfo.curr_doing_seat == playerInfo.seat) {
            clearTimeout(roomInfo.tuoguanTime);
        }
        playerInfo.trusteeshipType = msg.trusteeshipType;
        roomInfo.channelIsPlayer('ddz_tuoguan', {
            seat: playerInfo.seat, trusteeshipType: msg.trusteeshipType
        });
        roomInfo.record_history.oper.push({ uid, oper_type: "tuoguan", update_time: utils.cDate(), msg: `${msg.trusteeshipType}` });
        return { code: 200 };
    }

    /**
     * 明牌
     * @param: {}
     * @return:{ code: 200 }
     * @route land.mainHandler.mingPai
     */
    async mingPai({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        if (playerInfo.isMing == true) {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) }
        }
        playerInfo.handler_openCards(roomInfo);
        roomInfo.record_history.oper.push({ uid, oper_type: "mingPai", update_time: utils.cDate(), msg: `` });
        return { code: 200 };
    }
}