"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const langsrv_1 = require("../../../services/common/langsrv");
const constants_1 = require("../lib/constants");
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
    async load({ room, player }) {
        return {
            code: 200,
            state: room.processState.stateName,
            countdown: room.processState.getRemainingTime(),
            roundId: room.roundId,
            totalBet: player.getTotalBet(),
            lotteryHistory: room.getLotteryHistory(),
            gold: player.gold,
        };
    }
    async bet({ room, player, num }) {
        if (!room.isBetState()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2011) };
        }
        if (!num || num < 0) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1214) };
        }
        if (player.isLackGold(num)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        if (num < room.lowBet || num > room.capBet) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1104) };
        }
        room.playerBet(player, num);
        return { code: 200, gold: player.gold };
    }
    async cashOut({ room, player }, session) {
        if (!room.isLotteryState()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2011) };
        }
        if (player.getTotalBet() <= 0) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        if (player.isTaken()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1018) };
        }
        const odds = await room.takeMoney(player);
        return {
            code: 200,
            gold: player.gold,
            profit: player.getProfit(),
            odds
        };
    }
    async setTakeProfitPoint({ room, player, odds }, session) {
        if (!odds && typeof odds !== 'number') {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        if (room.isLotteryState() && player.getTotalBet() > 0 && !player.isTaken()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        odds = Math.floor(odds * 100) / 100;
        if (odds < 0 || odds > constants_1.MAX_ODDS) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        player.setTakeProfitPoint(odds);
        return { code: 200, takeProfitPoint: odds };
    }
    async getPlayers({ room }) {
        return { code: 200, players: room.getFrontDisplayPlayers() };
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DcmFzaC9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLDhEQUE0RTtBQUM1RSxnREFBMEM7QUFFMUMsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUVGLE1BQWEsV0FBVztJQUVwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFPRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBa0M7UUFFdkQsT0FBTztZQUNILElBQUksRUFBRSxHQUFHO1lBQ1QsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUztZQUNsQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtZQUMvQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDOUIsY0FBYyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4QyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7U0FDcEIsQ0FBQztJQUNOLENBQUM7SUFPRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQStDO1FBRXhFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDcEIsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUEscUJBQVcsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxD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