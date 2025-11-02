"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
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
        if ((0, commonUtil_1.isNullOrUndefined)(lineNum) || !constant_1.baseBetList.includes(bet)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_4000) };
        }
        if (!(0, lotteryUtil_1.isHaveLine)(lineNum)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_4000) };
        }
        playerInfo.changeGameState();
        try {
            if (typeof lineNum !== 'number' || typeof bet !== 'number' || bet <= 0) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_4000) };
            }
            if (playerInfo.isLackGold(bet, lineNum)) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1015) };
            }
            playerInfo.init();
            playerInfo.bet(bet, lineNum);
            roomInfo.addRunningPool(playerInfo.totalBet).addProfitPool(playerInfo.totalBet);
            const result = await roomInfo.lottery(playerInfo);
            await roomInfo.settlement(playerInfo, result);
            if (result.freeSpinResult.length > 0) {
                playerInfo.lastOperationTime = Date.now() + 5 * 60 * 1000;
            }
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
        }
        catch (e) {
            this.logger.error(`玩家${playerInfo.uid}的游戏spin出错:TriplePanda-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
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
        return {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
    }
    async loadGold({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        return { code: 200, gold: playerInfo.gold };
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9UcmlwbGVQYW5kYS9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE0RDtBQUM1RCwrREFBZ0U7QUFDaEUsK0NBQWlEO0FBQ2pELGtFQUFzRTtBQUN0RSx5REFBaUU7QUFJakUsbUVBQW9FO0FBQ3BFLG9EQUF5RTtBQUN6RSw4REFBNEU7QUFDNUUsOENBQTRFO0FBSTVFLFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVyxFQUFFLFFBQWdCO0lBQ3pFLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztLQUNoRTtJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7S0FDaEU7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDO0FBQUEsQ0FBQztBQUVGLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUdwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgs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