"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const pinus_logger_1 = require("pinus-logger");
const FMConst = require("../lib/FruitMachineConst");
const langsrv_1 = require("../../../services/common/langsrv");
const gamesScenePointValue_1 = require("../../../../config/data/gamesScenePointValue");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
class mainHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
    }
    async loadedGame({ player }) {
        return {
            code: 200,
            player: player.strip(),
            roundId: player.roundId,
            pointValue: gamesScenePointValue_1.ScenePointValueMap[GameNidEnum_1.GameNidEnum.FruitMachine].pointValue
        };
    }
    async userBet({ data, player, room }) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (typeof data !== 'object' || !Object.keys(data).length) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1106) };
        }
        if (Object.keys(data).find(key => !FMConst.areaOdds.hasOwnProperty(key))) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1106) };
        }
        player.changeGameState();
        try {
            if (player.isLackGold(data)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
            }
            if (room.checkLimit(player, data)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1013) };
            }
            await player.bet(data);
            const { totalProfit, playerWinAreas, lotteryResult, bigOdds, records } = await room.lottery(player);
            await room.settlement(player, totalProfit, bigOdds, lotteryResult, records);
            return {
                code: 200,
                lotteryResult,
                totalProfit,
                bigOdds,
                playerWinAreas,
                gold: player.gold,
                roundId: player.roundId
            };
        }
        catch (error) {
            logger.error('水果机下注失败', error.stack || error);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9GcnVpdE1hY2hpbmUvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBeUM7QUFDekMsb0RBQW9EO0FBR3BELDhEQUEwRTtBQUMxRSx1RkFBZ0Y7QUFDaEYsMkVBQXNFO0FBQ3RFLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFnQm5ELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUVwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFPRCxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsTUFBTSxFQUE0QztRQUVqRSxPQUFPO1lBQ0gsSUFBSSxFQUFFLEdBQUc7WUFDVCxNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUN0QixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDdkIsVUFBVSxFQUFFLHlDQUFrQixDQUFDLHlCQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsVUFBVTtTQUN0RSxDQUFDO0lBQ04sQ0FBQztJQTRCRCxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQWtCO1FBRWhELElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3RCLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUE7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