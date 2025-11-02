import { Application, FrontendSession } from 'pinus';
import langsrv = require('../../../services/common/langsrv');
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { isHaveBet, PharaohLotteryResult } from "../lib/util/lotteryUtil";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import { getLogger, Logger } from "pinus-logger";
import roomManager from "../lib/roomManager";
import sessionService = require('../../../services/sessionService');
import * as constant from '../lib/constant';
import { fixNoRound } from "../../../utils/lottery/commonUtil";
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
     * 请求
     * @route: MineGame.mainHandler.initGame
     */
    async initGame({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        let opts = {
            code: 200,
            profit: playerInfo.profit,
            gold: playerInfo.gold,
            totalBet: playerInfo.totalBet,
            diamond: 16 - (playerInfo.detonatorCount + playerInfo.diamond),
            detonatorCount: playerInfo.detonatorCount,
            coefficient: playerInfo.coefficient,
            coefficient2: playerInfo.coefficient2,
            state: playerInfo.isGameState(),
            result: playerInfo.isGameState() ? playerInfo.hideWindows(playerInfo.window) : null,
            roundId: playerInfo.roundId
        }
        return opts;
    }

    /**
     * 开始游戏
     * @route: MineGame.mainHandler.start {betNum：基础下注,detonatorCount}
     */
    async start({ betNum, detonatorCount }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        // 如果玩家正在游戏则不进行判断
        if (playerInfo.isGameState() || playerInfo.isSettlement == true) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_3103) }
        }

        // // 查看下注参数是否
        if (!isHaveBet(betNum)) {
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_4000) };
        }

        // 是否是在下游戏中 小游戏中无法下注
        if (!constant.detonatorCountList.includes(detonatorCount)) {
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_4000) };
        }
        // 如果缺少金币
        if (playerInfo.isLackGold(betNum)) {
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
        }

        playerInfo.changeGameState();

        try {
            // 初始化玩家
            playerInfo.init();

            // 下注
            playerInfo.bet(betNum, detonatorCount);

            // 累积房间内部调控池 盈利池 小游戏奖池
            roomInfo.addRunningPool(playerInfo.totalBet)
                .addProfitPool(playerInfo.totalBet);

            // 开奖
            await roomInfo.lottery(playerInfo)
            const result = playerInfo.lottery();
            playerInfo.coefficient = constant.Multiples.find(c => c.group == playerInfo.detonatorCount).weight[playerInfo.diamond];
            playerInfo.coefficient2 = constant.Multiples.find(c => c.group == playerInfo.detonatorCount).weight[playerInfo.diamond + 1];
            let opts = {
                code: 200,
                curProfit: playerInfo.profit,
                diamond: 16 - (playerInfo.detonatorCount + playerInfo.diamond),
                detonatorCount: playerInfo.detonatorCount,
                coefficient: playerInfo.coefficient,
                coefficient2: playerInfo.coefficient2,
                result: playerInfo.hideWindows(result),
                gold: playerInfo.gold,
                roundId: playerInfo.roundId,
            }
            return opts;
        } catch (error) {
            this.logger.error(`MineGame.mainHandler.start: ${error.stack}`);
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
        } finally {
            // playerInfo.changeLeisureState();
            // await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }

    /**
     * 开始游戏
     * @route: MineGame.mainHandler.open {x,y}
     */
    async open({ x, y }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        // 如果玩家正在游戏则不进行判断
        if (!playerInfo.isGameState() || playerInfo.isSettlement == true) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_3103) }
        }
        if (![0, 1, 2, 3].includes(x) || ![0, 1, 2, 3].includes(y)) {
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_4000) };
        }
        try {
            if (playerInfo.window[x][y].open == 1) {
                return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_4000) };
            }
            playerInfo.window[x][y].open = 1;
            playerInfo.ChangResult(x, y, playerInfo.coefficient2);
            playerInfo.Details.push({ type: playerInfo.window[x][y].type, X: x, Y: y });

            playerInfo.diamond = 0;
            let settlement = false;
            for (let idx = 0; idx < playerInfo.window.length; idx++) {
                for (let idy = 0; idy < playerInfo.window[idx].length; idy++) {
                    if (playerInfo.window[idx][idy].open == 1 &&
                        playerInfo.window[idx][idy].type == "A") {
                        playerInfo.diamond++;
                    }
                }
            }
            if (playerInfo.window[x][y].type == "B") {
                settlement = true;
            }
            playerInfo.coefficient = constant.Multiples.find(c => c.group == playerInfo.detonatorCount).weight[playerInfo.diamond];
            playerInfo.coefficient2 = constant.Multiples.find(c => c.group == playerInfo.detonatorCount).weight[playerInfo.diamond + 1];
            // 结算
            let profit = 0;
            if (settlement) {
                playerInfo.isSettlement = true;
                await playerInfo.settlement(roomInfo, 0);
                playerInfo.isSettlement = false;
                playerInfo.changeLeisureState();
            } else if (playerInfo.diamond + playerInfo.detonatorCount == 16) {
                playerInfo.isSettlement = true;
                profit = playerInfo.coefficient * playerInfo.totalBet;
                await playerInfo.settlement(roomInfo, fixNoRound(profit));
                playerInfo.isSettlement = false;
                playerInfo.changeLeisureState();
            }

            let opts = {
                code: 200,
                diamond: 16 - (playerInfo.detonatorCount + playerInfo.diamond),
                detonatorCount: playerInfo.detonatorCount,
                coefficient: playerInfo.coefficient,
                coefficient2: playerInfo.coefficient2,
                curProfit: profit,
                result: (settlement || playerInfo.diamond + playerInfo.detonatorCount == 16) ? playerInfo.window : playerInfo.hideWindows(playerInfo.window),
                gold: playerInfo.gold,
                roundId: playerInfo.roundId,
            }
            return opts;
        } catch (error) {
            this.logger.error(`MineGame.mainHandler.open: ${error}`);
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
        } finally {
            // playerInfo.changeLeisureState();
            // await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }
    /**
     * 开始游戏
    * @route: MineGame.mainHandler.settlement {}
    */
    async settlement({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        // 如果玩家正在游戏则不进行判断
        if (!playerInfo.isGameState() || playerInfo.isSettlement == true) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_3103) }
        }
        playerInfo.changeLeisureState();
        try {
            playerInfo.diamond = 0;
            for (let idx = 0; idx < playerInfo.window.length; idx++) {
                for (let idy = 0; idy < playerInfo.window[idx].length; idy++) {
                    if (playerInfo.window[idx][idy].open == 1 &&
                        playerInfo.window[idx][idy].type == "A") {
                        playerInfo.diamond++;
                    }
                }
            }
            let odds = constant.Multiples.find(c => c.group == playerInfo.detonatorCount).weight[playerInfo.diamond]
            let profit = fixNoRound(odds * playerInfo.totalBet);
            playerInfo.isSettlement = true;
            await playerInfo.settlement(roomInfo, profit);
            playerInfo.isSettlement = false;

            let opts = {
                code: 200,
                curProfit: profit,
                result: playerInfo.window,
                gold: playerInfo.gold,
                roundId: playerInfo.roundId,
            }
            return opts;
        } catch (error) {
            this.logger.error(`MineGame.mainHandler.settlement: ${error}`);
            return { code: 500, msg: getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
        } finally {
            playerInfo.changeLeisureState();
            // await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }
    /**
     * 申请奖池信息
     * @route: MineGame.mainHandler.jackpotFund
     */
    async jackpotFund({ }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        const opts = {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
        return opts
    }

    /**
     * 申请奖池信息
     * @route: MineGame.mainHandler.jackpotShow
     */
    async jackpotShow({ }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        const opts = {
            code: 200,
            jackpotShow: roomInfo.jackpotShow,
        };
        return opts;
    }
}
