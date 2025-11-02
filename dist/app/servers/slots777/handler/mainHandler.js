"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async load({ player, room }, session) {
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId,
        };
    }
    async start({ lineNum, bet, room, player }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(await room.isGameOpen())) {
            await room.kickingPlayer(pinus_1.pinus.app.getServerId(), [player]);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1055) };
        }
        if ((0, commonUtil_1.isNullOrUndefined)(lineNum) || (0, commonUtil_1.isNullOrUndefined)(bet)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
        }
        if (!(0, lotteryUtil_1.isHaveLine)(lineNum)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
        }
        player.changeGameState();
        try {
            if (typeof lineNum !== 'number' || typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
            }
            if (player.isLackGold(bet, lineNum)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
            }
            player.init();
            player.bet(bet, lineNum);
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);
            const result = await room.lottery(player);
            await room.settlement(player, result);
            room.sendMailAndRemoveOfflinePlayer(player);
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                jackpotWin: result.jackpotWin,
                isBigWin: player.isBigWin,
                canOnlineAward: false,
                onlineAward: 0,
                gold: player.gold,
                freeSpin: result.freeSpin,
                freeSpinResult: result.freeSpinResult,
                roundId: player.roundId
            };
        }
        catch (e) {
            this.logger.error(`玩家${player.uid}的游戏spin出错:slots777-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
    async jackpotFund({ room }, session) {
        return {
            code: 200,
            jackpotFund: room.jackpot,
            runningPool: room.runningPool,
            profit: room.profitPool
        };
    }
    async loadGold({ player }, session) {
        return { code: 200, gold: player.gold };
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9zbG90czc3Ny9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE0RDtBQUM1RCwrREFBZ0U7QUFDaEUsK0NBQWlEO0FBQ2pELGtFQUFzRTtBQUN0RSx5REFBaUU7QUFHakUsOERBQTRFO0FBZ0I1RSxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFHcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQVNELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUE0QyxFQUFFLE9BQXdCO1FBRTNGLE9BQU87WUFDSCxJQUFJLEVBQUUsR0FBRztZQUNULElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87U0FDMUIsQ0FBQztJQUNOLENBQUM7SUFXRCxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFrQixFQUFFLE9BQXdCO1FBRWhGLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3RCLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUE7U0FDL0U7UUFHRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFV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