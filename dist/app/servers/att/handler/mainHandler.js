"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_logger_1 = require("pinus-logger");
const langsrv_1 = require("../../../services/common/langsrv");
const attConst_1 = require("../lib/attConst");
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
            state: player.gameState,
            cards: player.cards,
            handNum: player.roundCount,
            betNum: player.baseBet,
        };
    }
    async deal({ player, room, betNum, handNum }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (typeof betNum !== 'number' || typeof handNum !== 'number' ||
            betNum <= 0 || handNum <= 0 ||
            betNum.toString().includes('.') || handNum.toString().includes('.')) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
        }
        if (player.isLackGold(betNum, handNum)) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        if (player.baseBet > 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
        }
        player.changeGameState();
        player.init();
        player.bet(betNum, handNum);
        try {
            await room.initPlayerCards(player);
            return {
                code: 200,
                gold: player.gold,
                cards: player.cards,
            };
        }
        catch (e) {
            player.init();
            this.logger.error(`att.mainHandler.deal error: ${JSON.stringify(e.stack)}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
        }
    }
    async retain({ player, room, retains }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!player.cards.length) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3151) };
        }
        if (player.gameState === attConst_1.GameState.Again) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3151) };
        }
        player.changeGameState();
        try {
            player.conversionRetainCards(retains);
            player.setAgainState();
            const result = await room.lottery(player);
            await room.settlement(player, result.totalWin === 0);
            return {
                code: 200,
                gold: player.gold,
                result: {
                    retains,
                    process: result.resultList,
                    sumGain: result.totalWin,
                },
                roundId: player.roundId,
            };
        }
        catch (e) {
            this.logger.error(`att.mainHandler.retain error: ${JSON.stringify(e.stack)}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
        }
    }
    async take({ player, room }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (!player.cards.length) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3151) };
        }
        if (player.profit <= 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1006) };
        }
        player.changeGameState();
        try {
            const profit = player.profit;
            await room.settlement(player, true);
            return {
                code: 200,
                gold: player.gold,
                gain: profit,
                roundId: player.roundId
            };
        }
        catch (e) {
            this.logger.error(`att.mainHandler.take error: ${JSON.stringify(e.stack)}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
        }
    }
    async atry({ player, room }, session) {
        if (player.profit <= 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1007) };
        }
        if (player.gambleCount <= 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1008) };
        }
        room.playerReadyBo(player);
        return {
            code: 200,
            cards: player.foldCards,
            canGuessCount: player.gambleCount,
            gain: player.profit
        };
    }
    async atryOpt({ player, room, opt }, session) {
        if (player.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103) };
        }
        if (player.gameState !== attConst_1.GameState.Bo || player.profit <= 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1006) };
        }
        if (typeof opt !== 'number') {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3153) };
        }
        if (player.gambleCount <= 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1008) };
        }
        player.changeGameState();
        try {
            const result = await room.boLottery(player, opt);
            player.gambleCountMinusOne();
            if (player.gambleCount <= 0 || result.multiple === 0) {
                await room.settlement(player, true);
            }
            return {
                code: 200,
                isNext: player.gameState === attConst_1.GameState.Bo,
                gold: player.gold,
                iswin: result.totalWin > 0,
                card: result.card,
                canGuessCount: player.gambleCount,
                gain: result.totalWin
            };
        }
        catch (e) {
            this.logger.error(`att.mainHandler.atryOpt error: ${JSON.stringify(e.stack)}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3153) };
        }
        finally {
            player.changeLeisureState();
        }
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hdHQvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBK0M7QUFHL0MsOERBQTBFO0FBQzFFLDhDQUEwQztBQUUxQyxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFHcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQVNELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFpQyxFQUFFLE9BQXdCO1FBRS9FLE9BQU87WUFDSCxJQUFJLEVBQUUsR0FBRztZQUNULElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDdkIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTO1lBQ3ZCLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztZQUNuQixPQUFPLEVBQUUsTUFBTSxDQUFDLFVBQVU7WUFDMUIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQ3pCLENBQUM7SUFDTixDQUFDO0lBV0QsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUNJLE1BQU0sRUFDTixJQUFJLEVBQ0osTUFBTSxFQUNOLE9BQU8sRUFDdUQsRUFBRSxPQUF3QjtRQUVuRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN0QixPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLE1BQU0sQ0FBQyxRQUFRLEVB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