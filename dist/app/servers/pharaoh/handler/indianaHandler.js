"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indianaHandler = void 0;
const langsrv = require("../../../services/common/langsrv");
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
const langsrv_1 = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
function default_1(app) {
    return new indianaHandler(app);
}
exports.default = default_1;
class indianaHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('log', __filename);
    }
    async initGame({ player }) {
        return {
            code: 200,
            shovelNum: player.detonatorCount,
            profit: player.profit,
            lv: player.gameLevel,
            gold: player.gold,
            littleGame: beforeFrontendLittleGameInfo(player),
            roundId: player.roundId
        };
    }
    async start({ betNum, betOdd, player, room }) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!(0, lotteryUtil_1.isHaveBet)(betNum, betOdd)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_4000) };
        }
        if (player.isLittleGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_3100) };
        }
        if (player.isLackGold(betNum, betOdd)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_1015) };
        }
        player.changeGameState();
        try {
            player.init();
            player.bet(betNum, betOdd);
            room.addRunningPool(player.totalBet)
                .addProfitPool(player.totalBet);
            const result = await room.lottery(player);
            await room.settlement(player, result);
            return {
                code: 200,
                curProfit: player.profit,
                result,
                pass: player.gameLevel,
                isCanPass: player.isLittleGameState(),
                littleGame: beforeFrontendLittleGameInfo(player),
                gold: player.gold,
                shovelNum: player.detonatorCount,
                canOnlineAward: false,
                onlineAward: 0,
                roundId: player.roundId,
            };
        }
        catch (error) {
            this.logger.error(`pharaoh.indianaHandler.start: ${error.stack}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
    async cast({ player, room }) {
        if (player.isSpinState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_3101) };
        }
        if (player.throwNum <= 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_3102) };
        }
        try {
            const result = await room.littleGameLottery(player);
            let boxPrizeType = '', prizeNum = 0;
            return {
                code: 200,
                result: beforeFrontedLittleGameResult(result, player),
                curProfit: 0,
                gold: player.gold,
                collect: player.customsClearance,
                boxPrizeType,
                prizeNum,
                roundId: player.roundId,
                throwNum: player.throwNum
            };
        }
        catch (e) {
            this.logger.error(`pharaoh.indianaHandler.cast: ${e.stack}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_1012) };
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
    async jackpotShow({ room }) {
        return {
            code: 200,
            jackpotShow: room.jackpotShow,
        };
    }
}
exports.indianaHandler = indianaHandler;
function beforeFrontendLittleGameInfo(player) {
    return {
        activation: player.isLittleGameState(),
        pass: player.gameLevel,
        curPosition: player.currentPosition,
        historyPosition: player.historyPosition,
        gains: player.littleGameGainDetail,
        restDice: player.throwNum,
        totalWin: player.littleGameWin,
        initMoney: player.littleGameAccumulate,
        initMoneyDis: [player.littleGameAccumulate, 0],
        bonusMoney: player.totalBet,
    };
}
function beforeFrontedLittleGameResult(result, player) {
    return {
        point: player.throwCount,
        awardType: player.currentAwardType,
        award: player.littleGameWin,
        select: result.select,
        selectType: result.selectType,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kaWFuYUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9waGFyYW9oL2hhbmRsZXIvaW5kaWFuYUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNERBQTZEO0FBRzdELHlEQUEwRTtBQUMxRSw4REFBMEU7QUFDMUUsK0NBQStDO0FBa0IvQyxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLGNBQWM7SUFHdkIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUUvQyxDQUFDO0lBTUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBNEM7UUFFL0QsT0FBTztZQUNILElBQUksRUFBRSxHQUFHO1lBQ1QsU0FBUyxFQUFFLE1BQU0sQ0FBQyxjQUFjO1lBQ2hDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtZQUNyQixFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVM7WUFDcEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLFVBQVUsRUFBRSw0QkFBNEIsQ0FBQyxNQUFNLENBQUM7WUFDaEQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQzFCLENBQUM7SUFDTixDQUFDO0lBTUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBa0I7UUFFeEQsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFF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