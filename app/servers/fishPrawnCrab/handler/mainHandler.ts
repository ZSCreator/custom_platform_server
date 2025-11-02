'use strict';
import { Application, BackendSession, pinus } from 'pinus';
import sessionService = require('../../../services/sessionService');
import * as hallConst from '../../../consts/hallConst';
import * as FishPrawnCrabConst from '../lib/FishPrawnCrabConst';
import FishPrawnCrabRoomManager from '../lib/FishPrawnCrabRoomManager';
import * as langsrv from '../../../services/common/langsrv';
import { getLogger } from 'pinus-logger';
const fishPrawnCrabLaLogger = getLogger('server_out', __filename);

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = FishPrawnCrabRoomManager.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { code: 500 , err: "鱼虾蟹房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { roomInfo, err: "鱼虾蟹玩家不存在" };
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
     * @route fishPrawnCrab.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.loaded==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
            }
            // 通知其他玩家有人加入房间
            // roomInfo.channelIsPlayer('fishPrawnCrab_onEntry', {
            //     roomId: roomInfo.roomId,
            //     player: playerInfo.strip(),
            //     playerNum: roomInfo.players.length,
            // });
            // 检查之前是不是关闭了 如果人数1个以上就可以开始了
            if (roomInfo.status === 'NONE') {
                roomInfo.run();
            }
            let offline = playerInfo.onLine ? roomInfo.getOffLineData(playerInfo) : null;
            let result = null;
            if (offline) {
                result = {
                    countdown: roomInfo.countdown,
                    status: roomInfo.status,
                    result: roomInfo.result,
                    winArea: roomInfo.winArea,
                };
            }
            let opts = {
                code: 200,
                roomInfo: roomInfo.strip(),
                offLine: offline,
                sceneId: roomInfo.sceneId,
                roundId: roomInfo.roundId,
                pl: playerInfo.strip(),
                result,
            };
            return opts;
        } catch (error) {
            fishPrawnCrabLaLogger.warn('fishPrawnCrab.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
        }
    };




    /**
     * 下注
     * @route fishPrawnCrab.mainHandler.bet  { type 区域：围骰 ，组合骰宝 ，独立骰宝 ，area：'YU_XIA' , bet ：投注金币  }
     */
    async bet({ type, area, bet }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.bet==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            //检查是否是下注区域
            if (typeof bet != `number` || bet <= 0 || roomInfo.lowBet > bet) {
                fishPrawnCrabLaLogger.warn(`${pinus.app.getServerId()}|${JSON.stringify(bet)}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            // 金币是否够
            if (roomInfo.checkGold(playerInfo, bet)) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                }
            }
            const ALL_AREA = FishPrawnCrabConst.ALL_AREA;
            const AREA_TYPE = FishPrawnCrabConst.AREA_TYPE;
            //下注区域是否正确
            if (!AREA_TYPE.includes(type) && !ALL_AREA.includes(area)) {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.bet==>area:${area}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
            }
            //押注上限(查看押注区域是否超过上限)
            if (roomInfo.checkOverrunBet(type, bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) }
            }
            // console.warn(`当前状态：${roomInfo.status}`)
            // 是否下注时间
            if (roomInfo.status != 'BETTING') {
                fishPrawnCrabLaLogger.info(`fishPrawnCrab.mainHandler.bet==>room.status:${roomInfo.status}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
            }

            // 投注
            roomInfo.onBeting(playerInfo, type, area, bet);
            return { code: 200 };
        } catch (error) {
            fishPrawnCrabLaLogger.warn('fishPrawnCrab.mainHandler.bet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
        }
    };

    /**
     * 需押
     * @route fishPrawnCrab.mainHandler.goonBet
     */
    async goonBet({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.goonBet==>err:${err}|isRobot:${playerInfo.isRobot}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
            }
            // 是否下注时间
            if (roomInfo.status !== 'BETTING') {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.goonBet==>room.status:${roomInfo.status}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) }
            }

            // 金币是否够
            const betNum = playerInfo.lastSumBetNum();
            if (betNum > playerInfo.gold) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                }
            }
            // 需押
            roomInfo.fishPrawnCrabOnGoonBet(playerInfo);
            return { code: 200 }
        } catch (error) {
            fishPrawnCrabLaLogger.warn('fishPrawnCrab.mainHandler.goonBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
        }
    };

}