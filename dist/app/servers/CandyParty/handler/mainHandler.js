"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const langsrv = require("../../../services/common/langsrv");
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
const langsrv_1 = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const roomManager_1 = require("../lib/roomManager");
const sessionService = require("../../../services/sessionService");
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
            shovelNum: playerInfo.detonatorCount,
            profit: playerInfo.profit,
            lv: playerInfo.gameLevel,
            gold: playerInfo.gold,
            roundId: playerInfo.roundId
        };
        return opts;
    }
    async start({ betNum, betOdd }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        if (playerInfo.isGameState()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(0, lotteryUtil_1.isHaveBet)(betNum, betOdd)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_4000) };
        }
        if (playerInfo.isLackGold(betNum, betOdd)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_1015) };
        }
        playerInfo.changeGameState();
        try {
            playerInfo.init();
            playerInfo.bet(betNum, betOdd);
            roomInfo.addRunningPool(playerInfo.totalBet)
                .addProfitPool(playerInfo.totalBet);
            const result = await roomInfo.lottery(playerInfo);
            await roomInfo.settlement(playerInfo, result);
            let opts = {
                code: 200,
                curProfit: playerInfo.profit,
                result,
                pass: playerInfo.gameLevel,
                gold: playerInfo.gold,
                shovelNum: playerInfo.detonatorCount,
                roundId: playerInfo.roundId,
            };
            return opts;
        }
        catch (error) {
            this.logger.error(`CandyParty.mainHandler.start: ${error.stack}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_1012) };
        }
        finally {
            playerInfo.changeLeisureState();
            await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }
    async jackpotFund({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        return {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
    }
    async jackpotShow({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        return {
            code: 200,
            jackpotShow: roomInfo.jackpotShow,
        };
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DYW5keVBhcnR5L2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNERBQTZEO0FBRzdELHlEQUEwRTtBQUMxRSw4REFBNEU7QUFDNUUsK0NBQWlEO0FBQ2pELG9EQUE2QztBQUM3QyxtRUFBb0U7QUFnQnBFLFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVyxFQUFFLFFBQWdCO0lBQ3pFLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztLQUNoRTtJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7S0FDaEU7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDO0FBQUEsQ0FBQztBQUdGLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUdwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FB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