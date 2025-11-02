"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
const langsrv_1 = require("../../../services/common/langsrv");
const moment = require("moment");
const GameRecord_mysql_dao_1 = require("../../../common/dao/mysql/GameRecord.mysql.dao");
const roomManager_1 = require("../lib/roomManager");
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('log', __filename);
    }
    async load({ player, room }, session) {
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId
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
        if (typeof bet !== 'number' || bet <= 0) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_4000) };
        }
        console.warn('大转盘玩家下注', player.uid, bet);
        player.changeGameState();
        try {
            if (player.isLackGold(bet)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
            }
            player.init();
            player.bet(bet);
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);
            const result = await room.lottery(player);
            await room.settlement(player, result);
            room.sendMailAndRemoveOfflinePlayer(player);
            const returns = {
                lotteryResult: result.result,
                isBigWin: player.isBigWin,
                roundId: player.roundId,
                gold: player.gold,
                profit: result.profit
            };
            return { code: 200, result: returns };
        }
        catch (e) {
            this.logger.error(`幸运转盘 玩家${player.uid}的游戏spin出错:start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
    async gameRecord({ player }) {
        let language = null;
        try {
            let tableName = moment().format("YYYYMM");
            let table = `Sp_GameRecord_${tableName}`;
            if (player.group_id) {
                table = `Sp_GameRecord_${player.group_id}_${tableName}`;
            }
            let result = await GameRecord_mysql_dao_1.default.findListForLuckyWheel(table, roomManager_1.default._nid, player.uid);
            if (!result) {
                return { code: 200, result: [] };
            }
            return { code: 200, result: result.map(r => {
                    return {
                        roundId: r.roundId,
                        result: JSON.parse(r.result).lotteryResult,
                        validBet: r.validBet,
                    };
                }) };
        }
        catch (error) {
            this.logger.error(`luckyWheel.gameHandler.gameRecord: ${error.stack || error.message || JSON.stringify(error)}`);
            return { code: 500, error: (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_14) };
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9sdWNreVdoZWVsL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXlDO0FBQ3pDLCtEQUFnRTtBQUNoRSwrQ0FBaUQ7QUFLakQsOERBQTRFO0FBQzVFLGlDQUFpQztBQUNqQyx5RkFBZ0Y7QUFDaEYsb0RBQTZDO0FBZ0I3QyxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBQ0YsTUFBYSxXQUFXO0lBR3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFTRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBNEMsRUFBRSxPQUF3QjtRQUMzRixPQUFPO1lBQ0gsSUFBSSxFQUFFLEdBQUc7WUFDVCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQzFCLENBQUM7SUFDTixDQUFDO0lBWUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFrQixFQUFFLE9BQXdCO1FBRXZFLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3RCLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUE7U0FDL0U7UUFHRCxJQUFJLENBQUMsQ0FBQyxNQUFN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