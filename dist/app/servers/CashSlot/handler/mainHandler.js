"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
const sessionService = require("../../../services/sessionService");
const roomManager_1 = require("../lib/roomManager");
const langsrv_1 = require("../../../services/common/langsrv");
const constant_1 = require("../lib/constant");
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
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async load({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 501, msg: error };
        }
        return {
            code: 200,
            gold: playerInfo.gold,
            headurl: playerInfo.headurl,
            roundId: playerInfo.roundId,
        };
    }
    async start({ bet }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 501, msg: error };
        }
        if (playerInfo.isGameState()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3103) };
        }
        let lineNum = constant_1.default.winLines.length;
        if (!(await roomInfo.isGameOpen())) {
            await roomInfo.kickingPlayer(pinus_1.pinus.app.getServerId(), [playerInfo]);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1055) };
        }
        if (!roomInfo.ChipList.includes(bet)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_4000) };
        }
        playerInfo.changeGameState();
        try {
            if (playerInfo.isLackGold(bet, lineNum)) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1015) };
            }
            playerInfo.init();
            playerInfo.bet(bet, lineNum);
            roomInfo.addRunningPool(playerInfo.totalBet).addProfitPool(playerInfo.totalBet);
            const result = await roomInfo.lottery(playerInfo);
            await roomInfo.settlement(playerInfo, result);
            roomInfo.sendMailAndRemoveOfflinePlayer(playerInfo);
            if (result.freeSpin) {
                playerInfo.lastOperationTime = Date.now() + 5 * 60 * 1000;
            }
            return {
                code: 200,
                getWindow: result.window,
                totalWin: playerInfo.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                jackpotWin: result.jackpotWin,
                canOnlineAward: false,
                onlineAward: 0,
                gold: playerInfo.gold,
                freeSpin: result.freeSpin,
                freeSpinResult: result.freeSpinResult,
                roundId: playerInfo.roundId
            };
        }
        catch (e) {
            this.logger.error(`玩家${playerInfo.uid}的游戏spin出错:CashSlot-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1012) };
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
            return { code: 501, msg: error };
        }
        const opts = {
            code: 200,
            jackpot: playerInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
        return opts;
    }
    async loadGold({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        return { code: 200, gold: playerInfo.gold };
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DYXNoU2xvdC9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE0RDtBQUM1RCwrREFBZ0U7QUFDaEUsK0NBQWlEO0FBTWpELG1FQUFvRTtBQUNwRSxvREFBc0U7QUFDdEUsOERBQTRFO0FBQzVFLDhDQUE0RTtBQUk1RSxTQUFTLEtBQUssQ0FBQyxPQUFlLEVBQUUsTUFBYyxFQUFFLEdBQVcsRUFBRSxRQUFnQjtJQUN6RSxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7S0FDaEU7SUFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUEscUJBQVcsRUFBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0tBQ2hFO0lBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pCLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUFBLENBQUM7QUFFRixtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFHcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsTUFB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