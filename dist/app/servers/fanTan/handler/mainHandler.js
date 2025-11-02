"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const utils_1 = require("../../../utils");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
    }
    async load({ room, player }, session) {
        return {
            code: 200,
            state: room.processState.stateName,
            countdown: room.processState.getRemainingTime(),
            betAreas: room.getSimpleBetAreas(),
            playerBetsDetail: player.getBetsDetail(),
            lotteryHistory: room.getLotteryHistory(),
            playersNumber: room.getPlayers().length,
            gold: player.gold,
            roundId: room.roundId,
        };
    }
    async bet({ room, player, bets }, session) {
        if (!room.isBetState()) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2011) };
        }
        if (!bets) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1214) };
        }
        if (player.isLackGold((0, utils_1.sum)(bets))) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        if (!player.checkBetAreas(bets)) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1738) };
        }
        if (room.checkBets(bets)) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1013) };
        }
        room.playerBet(player, bets);
        return { code: 200, gold: player.gold };
    }
    async renew({ room, player }, session) {
        if (!player.isLastBet()) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2022) };
        }
        if (player.isLackGold((0, utils_1.sum)(player.getLastBets()))) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        if (room.checkBets(player.getLastBets())) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1013) };
        }
        room.playerBet(player, player.getLastBets());
        return { code: 200, gold: player.gold };
    }
    async getPlayers({ room, player }, session) {
        return { code: 200, players: room.getFrontDisplayPlayers() };
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9mYW5UYW4vaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSwwQ0FBbUM7QUFDbkMsOERBQTBFO0FBSTFFLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFFRixNQUFhLFdBQVc7SUFFcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBT0QsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQWdDLEVBQUUsT0FBd0I7UUFDL0UsT0FBTztZQUNILElBQUksRUFBRSxHQUFHO1lBQ1QsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUztZQUNsQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtZQUMvQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ2xDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUU7WUFDeEMsY0FBYyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4QyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU07WUFDdkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztTQUN4QixDQUFDO0lBQ04sQ0FBQztJQU9ELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBdUUsRUFBRSxPQUF3QjtRQUUzSCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUs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