"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
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
        player.setRoundId(room.getRoundId(player.uid));
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
            player.playerWin = result.totalWin;
            await room.settlement(player, result);
            room.sendMailAndRemoveOfflinePlayer(player);
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                freeSpinResult: result.freeSpinResult,
                roundId: player.roundId,
                bankCard: result.bankCard,
            };
        }
        catch (e) {
            this.logger.error(`玩家${player.uid}的游戏spin出错:slots77-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
    async goldDouble({ player, room }, session) {
        if (player.gold < player.playerWin) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        try {
            let result = await room.goldDouble(player);
            return { code: 200, doubleResult: result.doubleResult, bankCard: result.bankCard };
        }
        catch (e) {
            this.logger.error(`玩家${player.uid}玩家点击扑克获取小游戏相关信息:${e} `);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
    }
    async getGold({ player }, session) {
        if (player.gold < player.playerWin) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
        }
        try {
            return { code: 200, gold: player.gold, playerWin: player.playerWin };
        }
        catch (e) {
            this.logger.error(`玩家${player.uid}玩家点击扑克获取小游戏相关信息:${e} `);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
    }
    async loadGold({ player }, session) {
        return { code: 200, gold: player.gold };
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9zbG90czc3L2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQTREO0FBQzVELCtEQUFnRTtBQUNoRSwrQ0FBaUQ7QUFDakQsa0VBQXNFO0FBSXRFLDhEQUE0RTtBQWdCNUUsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBR3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFTRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBNEMsRUFBRSxPQUF3QjtRQUUzRixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0MsT0FBTztZQUNILElBQUksRUFBRSxHQUFHO1lBQ1QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztTQUMxQixDQUFDO0lBQ04sQ0FBQztJQVdELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBa0IsRUFBRSxPQUF3QjtRQUV2RSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN0QixPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFB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