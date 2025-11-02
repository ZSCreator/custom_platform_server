import { Application, FrontendSession, pinus } from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { isNullOrUndefined } from "../../../utils/lottery/commonUtil";
import { isHaveLine, SlotResult } from "../lib/util/lotteryUtil";
import *as utils from '../../../utils';
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import sessionService = require('../../../services/sessionService');
import roomManager, { TriplePandaRoomManager } from "../lib/roomManager";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import { default as config, baseBetList, prizeType } from "../lib/constant";



function check(sceneId: number, roomId: string, uid: string, language: string) {
    const roomInfo = roomManager.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: getlanguage(language, Net_Message.id_1004) };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: getlanguage(language, Net_Message.id_2017) };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
};

export default function (app: Application) {
    return new MainHandler(app);
}

export class MainHandler {
    logger: Logger;

    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);
    }

    /**
     * 加载获取参数
     * @param player 房间内部玩家
     * @param room 房间
     * @param session
     * @route TriplePanda.mainHandler.load
     */
    async load({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 501, msg: error }
        }
        return {
            code: 200,
            gold: playerInfo.gold,
            headurl: playerInfo.headurl,
            roundId: playerInfo.roundId,
        };
    }

    /**
     * 开始游戏
     * @param lineNum 选线条数
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route TriplePanda.mainHandler.start
     */
    async start({ bet }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 501, msg: error }
        }
        // 如果玩家正在游戏则不进行判断
        if (playerInfo.isGameState()) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_3103) }
        }
        let lineNum = config.winLines.length;
        // 如果游戏不开放
        if (!(await roomInfo.isGameOpen())) {
            // let offLineArr = [{ nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid }];
            await roomInfo.kickingPlayer(pinus.app.getServerId(), [playerInfo]);
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_1055) };
        }

        // 判断传入参数是否合理
        if (isNullOrUndefined(lineNum) || !baseBetList.includes(bet)) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_4000) };
        }

        // 判断选线是否合理
        if (!isHaveLine(lineNum)) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_4000) };
        }

        // 改变玩家状态
        playerInfo.changeGameState();

        try {
            // 如果押注不合理
            if (typeof lineNum !== 'number' || typeof bet !== 'number' || bet <= 0) {
                return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_4000) };
            }

            // 如果缺少金币
            if (playerInfo.isLackGold(bet, lineNum)) {
                return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_1015) };
            }

            // 初始化玩家
            playerInfo.init();

            // 押注
            playerInfo.bet(bet, lineNum);

            // 添加调控池以及盈利池
            roomInfo.addRunningPool(playerInfo.totalBet).addProfitPool(playerInfo.totalBet);

            // 开奖
            const result: SlotResult = await roomInfo.lottery(playerInfo);

            // 结算
            await roomInfo.settlement(playerInfo, result);

            // 给离线玩家发送邮件且删除玩家
            // roomInfo.sendMailAndRemoveOfflinePlayer(playerInfo);
            if (result.freeSpinResult.length > 0) {
                playerInfo.lastOperationTime = Date.now() + 5 * 60 * 1000;
            }
            // 返回参数
            return {
                code: 200,
                window: result.window,
                totalWin: playerInfo.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                jackpotWin: result.jackpotWin,
                isBigWin: playerInfo.isBigWin,
                gold: playerInfo.gold,
                roundId: playerInfo.roundId,
                freeSpin: result.freeSpin,
                freeSpinResult: result.freeSpinResult,
            };
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`玩家${playerInfo.uid}的游戏spin出错:TriplePanda-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);

            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            playerInfo.changeLeisureState();
            await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }

    /**
     * 申请奖池信息
     * @route: TriplePanda.mainHandler.jackpotFund
     */
    async jackpotFund({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 501, msg: error }
        }
        return {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
    }

    /**
     * 初始化，进入游戏获取玩家的金币
     * @route: TriplePanda.mainHandler.loadGold
     */
    async loadGold({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);

        return { code: 200, gold: playerInfo.gold }
    }
}
