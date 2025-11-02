"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const langsrv = require("../../../services/common/langsrv");
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
const langsrv_1 = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const roomManager_1 = require("../lib/roomManager");
const sessionService = require("../../../services/sessionService");
const lotteryUtil_2 = require("../lib/util/lotteryUtil");
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
        const lotteryUtil = (0, lotteryUtil_2.cratePharaohLottery)(playerInfo.newer, roomInfo.jackpot);
        let result = lotteryUtil.result();
        let opts = {
            code: 200,
            profit: playerInfo.profit,
            gold: playerInfo.gold,
            roundId: playerInfo.roundId,
            window: result.window
        };
        return opts;
    }
    async start({ betNum }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        if (playerInfo.isGameState()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(0, lotteryUtil_1.isHaveBet)(betNum)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_4000) };
        }
        if (playerInfo.isLackGold(betNum)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv.Net_Message.id_1015) };
        }
        playerInfo.changeGameState();
        try {
            playerInfo.init();
            playerInfo.bet(betNum);
            roomInfo.addRunningPool(playerInfo.totalBet)
                .addProfitPool(playerInfo.totalBet);
            const result = await roomInfo.lottery(playerInfo);
            await roomInfo.settlement(playerInfo, result);
            let opts = {
                code: 200,
                curProfit: playerInfo.profit,
                result,
                gold: playerInfo.gold,
                roundId: playerInfo.roundId,
            };
            return opts;
        }
        catch (error) {
            this.logger.error(`CandyMoney.mainHandler.start: ${error.stack}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DYW5keU1vbmV5L2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNERBQTZEO0FBRzdELHlEQUEwRTtBQUMxRSw4REFBNEU7QUFDNUUsK0NBQWlEO0FBQ2pELG9EQUE2QztBQUM3QyxtRUFBb0U7QUFDcEUseURBQThEO0FBZTlELFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVyxFQUFFLFFBQWdCO0lBQ3pFLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztLQUNoRTtJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7S0FDaEU7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDO0FBQUEsQ0FBQztBQUdGLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUdwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxH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