"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
const langsrv_1 = require("../../../services/common/langsrv");
const constant_1 = require("../lib/constant");
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
    async start({ bet, room, player }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(await room.isGameOpen())) {
            await room.kickingPlayer(pinus_1.pinus.app.getServerId(), [player]);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1055) };
        }
        if ((0, commonUtil_1.isNullOrUndefined)(bet)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
        }
        if (player.gameState !== constant_1.PlayerGameState.NORMAL) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        player.changeGameState();
        try {
            if (typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
            }
            if (player.isLackGold(bet)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
            }
            player.init();
            room.setRoundId(player);
            player.bet(bet);
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);
            const result = await room.lottery(player);
            player.setResult(result);
            if (result.totalWin === 0) {
                await room.settlement(player);
            }
            else {
                player.setBoState();
            }
            return {
                code: 200,
                getWindow: result.window,
                totalWin: result.totalWin,
                winLines: result.winLines,
                isBigWin: player.isBigWin,
                gold: player.gold,
                freeSpin: result.freeSpin,
                freeSpinResult: result.freeSpinResult,
                roundId: player.roundId,
                freeSpinSpecialElement: result.freeSpinSpecialElement
            };
        }
        catch (e) {
            this.logger.error(`玩家${player.uid}的游戏spin出错:DeadBook-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
            if (!player.onLine) {
                await room.settlement(player);
                await room.removeOfflinePlayer(player);
            }
        }
    }
    async jackpotFund({ room }) {
        return {
            code: 200,
            jackpotFund: room.jackpot,
            runningPool: room.runningPool,
            profit: room.profitPool
        };
    }
    async bo({ room, player, color, }) {
        if (player.gameState !== constant_1.PlayerGameState.BO) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        player.reduceBoTimes();
        console.warn('博一博1', player.gold, player.profit, player.boProfit);
        const result = await room.boLottery(player, color);
        player.setBoResult(result.card, result.totalWin);
        console.warn('博一博2', player.gold, player.profit, player.boProfit, result);
        if (result.totalWin === 0 || player.boTimes === 0 || result.totalWin >= 2500 * player.baseBet) {
            await room.settlement(player);
            player.setNormalState();
        }
        return {
            code: 200,
            profit: result.totalWin,
            card: result.card,
            roundId: player.roundId,
            gold: player.gold,
        };
    }
    async done({ room, player }) {
        if (player.gameState !== constant_1.PlayerGameState.BO) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        await room.settlement(player);
        player.setNormalState();
        return {
            code: 200,
            profit: player.profit,
            roundId: player.roundId,
            gold: player.gold,
        };
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EZWFkQm9vay9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE0RDtBQUM1RCwrREFBZ0U7QUFDaEUsK0NBQWlEO0FBQ2pELGtFQUFzRTtBQUl0RSw4REFBNEU7QUFDNUUsOENBQTJEO0FBZ0IzRCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFHcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQVNELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUE0QyxFQUFFLE9BQXdCO1FBRTNGLE9BQU87WUFDSCxJQUFJLEVBQUUsR0FBRztZQUNULElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87U0FDMUIsQ0FBQztJQUNOLENBQUM7SUFVRCxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQWtCLEVBQUUsT0FBd0I7UUFFdkUsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUEscUJBQVcsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQTtTQUMvRTtRQUdELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFD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