"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
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
        try {
            return {
                code: 200,
                gold: player.gold,
                headurl: player.headurl,
                roundId: player.roundId,
                ArchiveGrid1: player.ArchiveGrid1,
                ArchiveGrid2: player.ArchiveGrid2,
                ArchiveGrid3: player.ArchiveGrid3,
                ArchiveGrid4: player.ArchiveGrid4,
            };
        }
        catch (error) {
            return { code: 200, data: error };
        }
    }
    async start({ bet, room, player }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(await room.isGameOpen())) {
            await room.kickingPlayer(pinus_1.pinus.app.getServerId(), [player]);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1055) };
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
            player.bet(bet);
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);
            const result = await room.lottery(player);
            player.islucky = result.islucky;
            await room.settlement(player, result);
            room.sendMailAndRemoveOfflinePlayer(player);
            player.result = result;
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                islucky: result.islucky,
                result: result.result,
                jackpotWin: result.jackpotWin,
                gold: player.gold,
                luckyBall: result.luckyBall,
                roundId: player.roundId
            };
        }
        catch (e) {
            this.logger.error(`玩家${player.uid}的游戏spin出错:hl6xc-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
    async lucky({ room, player }, session) {
        if (!player.islucky) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_8401) };
        }
        player.islucky = false;
        try {
            const result = player.result;
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                islucky: result.islucky,
                result: result.result,
                jackpotWin: result.jackpotWin,
                Multiples: result.Multiples,
                Multiple: result.Multiple,
                gold: player.gold,
                luckyBall: result.luckyBall,
                roundId: player.roundId
            };
        }
        catch (e) {
            this.logger.error(`玩家${player.uid}的游戏spin出错:hl6xc-lucky: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
        }
        finally {
            player.changeLeisureState();
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
    async Grid({ player }, session) {
        player.Refresh();
        return {
            code: 200,
            ArchiveGrid1: player.ArchiveGrid1,
            ArchiveGrid2: player.ArchiveGrid2,
            ArchiveGrid3: player.ArchiveGrid3,
            ArchiveGrid4: player.ArchiveGrid4,
        };
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9obDZ4Yy9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE0RDtBQUM1RCwrREFBZ0U7QUFDaEUsK0NBQWlEO0FBTWpELDhEQUE0RTtBQWdCNUUsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBR3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFTRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBNEMsRUFBRSxPQUF3QjtRQUUzRixJQUFJO1lBQ0EsT0FBTztnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ2pCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDdkIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO2dCQUN2QixZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7Z0JBQ2pDLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtnQkFDakMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO2dCQUNqQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7YUFDcEMsQ0FBQztTQUNMO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDckM7SUFDTCxDQUFDO0lBVUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxJ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