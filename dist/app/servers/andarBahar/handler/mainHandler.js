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
            playerBetsDetail: player.getBetsDetail(),
            players: room.getFrontDisplayPlayers(),
            result: room.getResult(),
            systemCard: room.getSystemCard(),
            lowBet: room.lowBet,
            capBet: room.capBet,
            roundId: room.roundId,
        };
    }
    async bet({ room, player, bets }, session) {
        if (!room.isBetState()) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2011) };
        }
        if (room.checkBettingState(player)) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1011) };
        }
        if (!bets) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1214) };
        }
        if (!room.checkBetAreas(player, bets)) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1738) };
        }
        if (player.isLackGold((0, utils_1.sum)(bets))) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        room.playerBet(player, bets);
        room.changeBettingState();
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
    async skip({ room, player }, session) {
        if (!room.isSecondBetState() || !player.isBet()) {
            return { code: 500, message: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1216) };
        }
        room.skip(player);
        return { code: 200, gold: player.gold };
    }
    async getPlayers({ room, player }, session) {
        return { code: 200, players: room.getFrontDisplayPlayers() };
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hbmRhckJhaGFyL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsMENBQW1DO0FBQ25DLDhEQUEwRTtBQUkxRSxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBRUYsTUFBYSxXQUFXO0lBRXBCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQU9ELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFnQyxFQUFFLE9BQXdCO1FBRy9FLE9BQU87WUFDSCxJQUFJLEVBQUUsR0FBRztZQUNULEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDbEMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUU7WUFDL0MsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRTtZQUN4QyxPQUFPLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQ3RDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3hCLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3hCLENBQUM7SUFDTixDQUFDO0lBT0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUF1RSxFQUFFLE9BQXdCO1FBRTNILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDcEIsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUEscUJBQVcsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztTQUNsRjtRQUdELElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUM7U0FDakY7UUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUEscUJBQVcsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztTQUNsRjtRQUdELElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNuQyxPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBQSxxQkFBVyxFQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDO1NBQ2xGO1FBR0QsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUEsV0FBRyxFQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUEscUJBQVcsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztTQUNsRjtRQUlELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRzdCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFDLENBQUM7SUFDMUMsQ0FBQztJQU9ELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUF1RSxFQUFFLE9BQXdCO1FBRXZILElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDckIsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUEscUJBQVcsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztTQUNsRjtRQUdELElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFBLFdBQUcsRUFBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQzlDLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUM7U0FDbEY7UUFHRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBMEMsQ0FBQyxFQUFFO1lBQzlFLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUM7U0FDbEY7UUFHRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxFQUEwQyxDQUFDLENBQUM7UUFFckYsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUMsQ0FBQztJQUMxQyxDQUFDO0lBUUQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQWtDLEVBQUUsT0FBd0I7UUFFakYsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzdDLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUM7U0FDbEY7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFDLENBQUM7SUFDMUMsQ0FBQztJQU9ELEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFnQyxFQUFFLE9BQXdCO1FBQ3JGLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBQyxDQUFDO0lBQy9ELENBQUM7Q0FDSjtBQXZIRCxrQ0F1SEMifQ==