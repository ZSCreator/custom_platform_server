"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
const langsrv_1 = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
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
    async load({ player }) {
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId
        };
    }
    async start({ betNum, lineNum, player, room }) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(0, lotteryUtil_1.isHaveBet)(betNum, lineNum)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
        }
        if (player.isLackGold(betNum, lineNum)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        player.changeGameState();
        player.init();
        player.bet(betNum, lineNum);
        room.addRunningPool(player.totalBet)
            .addProfitPool(player.totalBet);
        const result = await room.lottery(player);
        await room.settlement(player, result);
        player.changeLeisureState();
        return {
            code: 200,
            result,
            gold: player.gold,
            roundId: player.roundId,
        };
    }
    async jackpot({ room, player }, session) {
        return {
            code: 200,
            runningPool: room.runningPool,
        };
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9pY2VCYWxsL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EseURBQTBFO0FBQzFFLDhEQUEwRTtBQUMxRSwrQ0FBK0M7QUFrQi9DLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUdwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRS9DLENBQUM7SUFNRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUE0QztRQUMzRCxPQUFPO1lBQ0gsSUFBSSxFQUFFLEdBQUc7WUFDVCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQzFCLENBQUM7SUFDTixDQUFDO0lBTUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBa0I7UUFFekQsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUEscUJBQVcsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQTtTQUMvRTtRQUdELElBQUksQ0FBQyxJQUFBLHVCQUFTLEVBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQzdCLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDbEY7UUFJRCxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDbEY7UUFFRCxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7UUFJckIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBR2QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2FBQy9CLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFHcEMsTUFBTSxNQUFNLEdBQXlCLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUdoRSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXRDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTVCLE9BQU87WUFDSCxJQUFJLEVBQUUsR0FBRztZQUNULE1BQU07WUFDTixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQzFCLENBQUM7SUFRVixDQUFDO0lBU0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQTJDLEVBQUUsT0FBd0I7UUFDNUYsT0FBTztZQUNILElBQUksRUFBRSxHQUFHO1lBQ1QsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1NBQ2hDLENBQUE7SUFDTCxDQUFDO0NBQ0o7QUEzRkQsa0NBMkZDIn0=