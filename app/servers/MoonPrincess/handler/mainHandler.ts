import { Application, FrontendSession } from 'pinus';
import langsrv = require('../../../services/common/langsrv');
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { isHaveBet, PharaohLotteryResult } from "../lib/util/lotteryUtil";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import { getLogger, Logger } from "pinus-logger";
import roomManager from "../lib/roomManager";
import sessionService = require('../../../services/sessionService');

/**
 * 下注参数
 * @property betOdd 押注配数
 * @property betNum 基础押注
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    betOdd: number,
    betNum: number,
    room: RoomStandAlone,
    player: Player,
}

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
    return new mainHandler(app);
}

export class mainHandler {
    logger: Logger

    constructor(private app: Application) {
        this.app = app;
        this.logger = getLogger('log', __filename);

    }

    /**
     * 请求已获得的铲子数
     * @route: CandyParty.mainHandler.initGame
     */
    async initGame({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        let opts = {
            code: 200,
            shovelNum: playerInfo.detonatorCount,
            profit: playerInfo.profit,
            lv: playerInfo.gameLevel,
            gold: playerInfo.gold,
            roundId: playerInfo.roundId
        }
        return opts;
    }

    /**
     * 开始游戏
     * @route: CandyParty.mainHandler.start {betNum：基础下注, betOdd:基础赔率}
     */
    async start({ betNum, betOdd }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        // 如果玩家正在游戏则不进行判断
        if (playerInfo.isGameState()) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_3103) }
        }

        // 查看下注参数是否
        if (!isHaveBet(betNum, betOdd)) {
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_4000) };
        }

        // 是否是在下游戏中 小游戏中无法下注
        // if (playerInfo.isLittleGameState()) {
        //     return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_3100) };
        // }
        // 如果缺少金币
        if (playerInfo.isLackGold(betNum, betOdd)) {
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
        }

        playerInfo.changeGameState();

        try {
            // 初始化玩家
            playerInfo.init();

            // 下注
            playerInfo.bet(betNum, betOdd);

            // 累积房间内部调控池 盈利池 小游戏奖池
            roomInfo.addRunningPool(playerInfo.totalBet)
                .addProfitPool(playerInfo.totalBet);

            // 开奖
            const result: PharaohLotteryResult = await roomInfo.lottery(playerInfo);

            // 结算
            await roomInfo.settlement(playerInfo, result);
            let opts = {
                code: 200,
                curProfit: playerInfo.profit,
                result,
                pass: playerInfo.gameLevel,
                gold: playerInfo.gold,
                shovelNum: playerInfo.detonatorCount,
                // canOnlineAward: false,
                // onlineAward: 0,
                roundId: playerInfo.roundId,
            }
          //  console.warn(JSON.stringify(opts))
            return opts;
        } catch (error) {
            this.logger.error(`CandyParty.mainHandler.start: ${error.stack}`);
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
        } finally {
            playerInfo.changeLeisureState();
            await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }

    /**
     * 申请奖池信息
     * @route: CandyParty.mainHandler.jackpotFund
     */
    async jackpotFund({ }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        return {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
    }

    /**
     * 申请奖池信息
     * @route: CandyParty.mainHandler.jackpotShow
     */
    async jackpotShow({ }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        return {
            code: 200,
            jackpotShow: roomInfo.jackpotShow,
        };
    }
}
