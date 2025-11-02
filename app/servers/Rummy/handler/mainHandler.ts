'use strict';
import { Application, BackendSession, pinus } from 'pinus';
import sessionService = require('../../../services/sessionService');
import * as langsrv from '../../../services/common/langsrv';
import { getLogger } from 'pinus-logger';
import RummyRoomManager from "../lib/RummyRoomManager";
const RummyLaLogger = getLogger('server_out', __filename);

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = RummyRoomManager.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "Rummy房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { roomInfo, err: "Rummy玩家不存在" };
    }
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
     * @route Rummy.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.loaded==>err:${err}|${sceneId}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo && playerInfo.language, langsrv.Net_Message.id_1201) };
            }
            if (roomInfo.isFull() == true) {
                // 通知其他玩家有人加入房间
                roomInfo.channelIsPlayer('Rummy_onEntry', {
                    roomId: roomInfo.roomId,
                    player: playerInfo.result(),
                    playerNum: roomInfo.players.length,
                });
            }
            if (roomInfo.status === 'INWAIT' && roomInfo.isFull() == true) {
                roomInfo.run();
            }
            let opts = {
                code: 200,
                roomInfo: roomInfo.strip(),
                offLine: false,
                sceneId: roomInfo.sceneId,
                nid: roomInfo.nid,
                roomId: roomInfo.roomId,
                roundId: roomInfo.roundId,
                pl: playerInfo.result(),
                entryCond: roomInfo.entryCond,
            };
            return opts;
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
        }
    };


    /**
     * 丢牌  丢牌的通知把丢的牌以及组合好的牌组发给服务器
     * @route Rummy.mainHandler.lostCard  {card : 1 , cardsList :   }
     */
    async lostCard({ card, cardsList, point }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.bet==>err:${err}|:${sceneId}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }

            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.lostCard:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }

            if (playerInfo.cards.length == 13) {
                RummyLaLogger.warn(`Rummy.mainHandler.lostCard:${playerInfo.uid}你还没有要牌不能出牌cards:${playerInfo.cards}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8403) };
            }
            //丢弃牌
            const lostCards = await roomInfo.lostCard(playerInfo, card, cardsList, point, false);
            return { code: 200, lostCards };
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.lostCard ==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    };



    /**
     * 点击要牌  //从废牌里面获取
     * @route Rummy.mainHandler.playerGetlostCard  {}
     */
    async playerGetlostCard({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerGetlostCard==>err:${err}|:${uid}|${sceneId}|${roomId}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }

            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerGetlostCard${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }

            if (playerInfo.cards.length > 13 || playerInfo.getCard != null) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerGetlostCard:${playerInfo.uid}你已经要过牌cards:${playerInfo.cards},你要的牌card:${playerInfo.getCard}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8402) };
            }
            //获取弃牌堆里的牌
            let card = await roomInfo.playerGetlostCard(playerInfo);
            return { code: 200, card };
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.playerGetlostCard==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    };

    /**
     * 点击要牌  //从新的牌组里面获取
     * @route Rummy.mainHandler.getPokerListCard  {}
     */
    async getPokerListCard({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.getPokerListCard==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.getPokerListCard:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }

            if (playerInfo.cards.length > 13 || playerInfo.getCard != null) {
                RummyLaLogger.warn(`Rummy.mainHandler.getPokerListCard:${playerInfo.uid}你已经要过牌cards:${playerInfo.cards}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8402) };
            }
            //丢弃牌
            let card = await roomInfo.getPokerListCard(playerInfo);
            return { code: 200, card };
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.getPokerListCard==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    };


    /**
     * 弃牌
     * @route Rummy.mainHandler.grop  {}
     */
    async grop({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.grop==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.grop:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            if (playerInfo.isLose) {
                RummyLaLogger.warn(`Rummy.mainHandler.grop:${playerInfo.uid}玩家已经弃牌了`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            //丢弃牌
            await roomInfo.grop(playerInfo);
            return { code: 200 };
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.grop==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    };




    /**
     * 胡牌
     * @route Rummy.mainHandler.shaw  {}
     */
    async shaw({ cardsList, card }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.shaw==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.shaw:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            //胡牌
            await roomInfo.shaw(playerInfo, cardsList, card);
            return { code: 200 };
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.shaw==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    };



    /**
     * 另外一个玩家点击确定整理完毕
     * @route Rummy.mainHandler.playerOtherPostCardsList  {cardsList}
     */
    async playerOtherPostCardsList({ cardsList }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerOtherPostCardsList==>err:${err}|isRobot:${uid}|${sceneId}|${roomId}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            //胡牌
            await roomInfo.playerOtherPostCardsListForRoom(playerInfo, cardsList);
            return { code: 200 };
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.playerOtherPostCardsList==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    };


    /**
     * 游戏开始
     * @route Rummy.mainHandler.start  {}
     */
    async start({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerOtherPostCardsList==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1201) };
            }
            //游戏开始
            // await roomInfo.start(playerInfo);
            return { code: 200 };
        } catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.playerOtherPostCardsList==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    };


}