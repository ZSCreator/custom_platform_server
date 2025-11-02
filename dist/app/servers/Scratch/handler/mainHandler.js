"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const langsrv_1 = require("../../../services/common/langsrv");
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
    }
    async load({ player, room }, session) {
        return {
            code: 200,
            roundId: player.roundId,
        };
    }
    async start({ bet, player, room }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (bet === null) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1214) };
        }
        const jackpotId = (bet == 100 && 7) || (bet == 200 && 8) || (bet == 500 && 9) || (bet == 1000 && 10) || (bet == 10000 && 11);
        if (!jackpotId) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1214) };
        }
        if (bet <= 0) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1214) };
        }
        if (player.gold < bet) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1015) };
        }
        log_logger.debug(`玩家: ${player.uid} Scratch.mainHandler.start bet: ${bet}`);
        player.changeGameState();
        player.setBetAndJackpotId(bet, jackpotId);
        try {
            const result = await room.lottery(player);
            await room.settlement(player, result);
            return {
                code: 200,
                rebate: result.card.rebate,
                totalWin: result.totalWin,
                result: result.card.result,
                total_gold: player.gold,
                roundId: player.roundId,
            };
        }
        catch (error) {
            log_logger.warn(`${JSON.stringify(error)}`);
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1055) };
        }
        finally {
            player.changeLeisureState();
        }
    }
    ;
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TY3JhdGNoL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNERBQTREO0FBQzVELCtDQUF5QztBQUd6Qyw4REFBMEU7QUFDMUUsTUFBTSxVQUFVLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBQ0YsTUFBYSxXQUFXO0lBQ3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFDcEMsQ0FBQztJQVNELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUF1RCxFQUFFLE9BQXVCO1FBRXJHLE9BQU87WUFDSCxJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztTQUMxQixDQUFDO0lBQ04sQ0FBQztJQVdELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBdUQsRUFBRSxPQUF1QjtRQUczRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN0QixPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFBO1NBQy9FO1FBRUQsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ2QsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxP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