"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const langsrv = require("../../../services/common/langsrv");
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
const langsrv_1 = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const roomManager_1 = require("../lib/roomManager");
const sessionService = require("../../../services/sessionService");
const constant = require("../lib/constant");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
function check(sceneId, roomId, uid, language) {
    const roomInfo = roomManager_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1004) };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_2017) };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
;
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
class mainHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('log', __filename);
    }
    async initGame({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
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
        };
        return opts;
    }
    async start({ betNum, detonatorCount }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        if (playerInfo.isGameState() || playerInfo.isSettlement == true) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(0, lotteryUtil_1.isHaveBet)(betNum)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_4000) };
        }
        if (!constant.detonatorCountList.includes(detonatorCount)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_4000) };
        }
        if (playerInfo.isLackGold(betNum)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_1015) };
        }
        playerInfo.changeGameState();
        try {
            playerInfo.init();
            playerInfo.bet(betNum, detonatorCount);
            roomInfo.addRunningPool(playerInfo.totalBet)
                .addProfitPool(playerInfo.totalBet);
            await roomInfo.lottery(playerInfo);
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
            };
            return opts;
        }
        catch (error) {
            this.logger.error(`MineGame.mainHandler.start: ${error.stack}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_1012) };
        }
        finally {
        }
    }
    async open({ x, y }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        if (!playerInfo.isGameState() || playerInfo.isSettlement == true) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3103) };
        }
        if (![0, 1, 2, 3].includes(x) || ![0, 1, 2, 3].includes(y)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_4000) };
        }
        try {
            if (playerInfo.window[x][y].open == 1) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_4000) };
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
            let profit = 0;
            if (settlement) {
                playerInfo.isSettlement = true;
                await playerInfo.settlement(roomInfo, 0);
                playerInfo.isSettlement = false;
                playerInfo.changeLeisureState();
            }
            else if (playerInfo.diamond + playerInfo.detonatorCount == 16) {
                playerInfo.isSettlement = true;
                profit = playerInfo.coefficient * playerInfo.totalBet;
                await playerInfo.settlement(roomInfo, (0, commonUtil_1.fixNoRound)(profit));
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
            };
            return opts;
        }
        catch (error) {
            this.logger.error(`MineGame.mainHandler.open: ${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_1012) };
        }
        finally {
        }
    }
    async settlement({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        if (!playerInfo.isGameState() || playerInfo.isSettlement == true) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3103) };
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
            let odds = constant.Multiples.find(c => c.group == playerInfo.detonatorCount).weight[playerInfo.diamond];
            let profit = (0, commonUtil_1.fixNoRound)(odds * playerInfo.totalBet);
            playerInfo.isSettlement = true;
            await playerInfo.settlement(roomInfo, profit);
            playerInfo.isSettlement = false;
            let opts = {
                code: 200,
                curProfit: profit,
                result: playerInfo.window,
                gold: playerInfo.gold,
                roundId: playerInfo.roundId,
            };
            return opts;
        }
        catch (error) {
            this.logger.error(`MineGame.mainHandler.settlement: ${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_1012) };
        }
        finally {
            playerInfo.changeLeisureState();
        }
    }
    async jackpotFund({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        const opts = {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
        return opts;
    }
    async jackpotShow({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        const opts = {
            code: 200,
            jackpotShow: roomInfo.jackpotShow,
        };
        return opts;
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9NaW5lR2FtZS9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDREQUE2RDtBQUc3RCx5REFBMEU7QUFDMUUsOERBQTRFO0FBQzVFLCtDQUFpRDtBQUNqRCxvREFBNkM7QUFDN0MsbUVBQW9FO0FBQ3BFLDRDQUE0QztBQUM1QyxrRUFBK0Q7QUFlL0QsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsUUFBZ0I7SUFDekUsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pELElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDWCxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUEscUJBQVcsRUFBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0tBQ2hFO0lBQ0QsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2IsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztLQUNoRTtJQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFBQSxDQUFDO0FBR0YsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBR3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMs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