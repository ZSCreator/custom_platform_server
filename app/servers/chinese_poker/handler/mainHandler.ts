'use strict';
import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';

import zhangMgr from '../lib/chinese_pokerMgr';
import * as utils from '../../../utils';
import sessionService = require('../../../services/sessionService');
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);
import langsrv = require('../../../services/common/langsrv');

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = zhangMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "13水房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "该局已结束" };
    }
    playerInfo.update_time();
    return { roomInfo: roomInfo, playerInfo };
}

export default function (app: Application) {
    return new mainHandler(app);
};

export class mainHandler {
    constructor(private app: Application) {
    }
    /**
     * 加载完成
     * @route: chinese_poker.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        // 这里改为等待
        if (playerInfo.status == 'NONE') {
            playerInfo.status = 'WAIT';
            setTimeout(() => {
                // 通知其他玩家有人加入房间
                roomInfo.channelIsPlayer('poker_onEntry', {
                    player: playerInfo.strip(),
                    status: roomInfo.status,
                });
            }, 500);
        }
        if (roomInfo.status == `NONE` || roomInfo.status == `INWAIT`) {
            roomInfo.wait(playerInfo);
        }
        // 返回给客户端
        const opts = {
            code: 200,
            roomInfo: {
                nid: roomInfo.nid,
                sceneId: roomInfo.sceneId,
                roomId: roomInfo.roomId,
                roundId: roomInfo.roundId,
                status: roomInfo.status,
                lowBet: roomInfo.lowBet,
                entryCond: roomInfo.entryCond,
                otherPlayers: roomInfo.players.filter(pl => pl && pl.uid != playerInfo.uid).map(pl => pl && pl.strip()),
            },
            player: playerInfo.toGame(playerInfo.uid),
            waitTime: roomInfo.getWaitTime(),
        }
        if (roomInfo.status == "END") {
            opts["poker_onSettlement"] = roomInfo.run_Players.map(pl => pl.wrapSettlement())
        }
        return opts;
    };

    /**
     * 比牌
     */
    async BiPai(msg: { cards: number[] }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        // 正在游戏中  已经holdStatus：1的就不能重复配置牌了，防止 调用2次比牌结算
        if (roomInfo.status !== 'INGAME' || playerInfo.holdStatus == 1) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) }
        }
        //验证玩家提交数据合法性三部曲

        let Pcards = playerInfo.cards.slice();
        const card1 = msg.cards.slice(0, 3);
        const card2 = msg.cards.slice(3, 8);
        const card3 = msg.cards.slice(8, 13);

        //One
        utils.array_diff(Pcards, card1);
        //two
        utils.array_diff(Pcards, card2);
        //three
        utils.array_diff(Pcards, card3);
        //终
        if (Pcards.length !== 0) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214), data: { cards: msg.cards } }
        }

        playerInfo.BiPaicards = [card1, card2, card3];
        log_logger.info(`configuration|45|${roomId}|${playerInfo.uid}|${playerInfo.isRobot}|${msg.cards}`);

        roomInfo.configuration(playerInfo);
        return { code: 200 };
    };



}