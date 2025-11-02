"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const regulation = require("../../../domain/games/regulation");
const pinus_logger_1 = require("pinus-logger");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
const lotteryUtil_1 = require("../lib/util/lotteryUtil");
const utils = require("../../../utils");
const sessionService = require("../../../services/sessionService");
const roomManager_1 = require("../lib/roomManager");
const langsrv_1 = require("../../../services/common/langsrv");
const constant_1 = require("../lib/constant");
function check(sceneId, roomId, uid, language) {
    const roomInfo = roomManager_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1004) };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_2017) };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
;
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async load({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        return {
            code: 200,
            gold: playerInfo.gold,
            headurl: playerInfo.headurl,
            roundId: playerInfo.roundId,
            ArchiveGrid: playerInfo.ArchiveGrid,
        };
    }
    async start({ bet }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        if (playerInfo.isGameState()) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3103) };
        }
        let lineNum = constant_1.default.winLines.length;
        if (!(await roomInfo.isGameOpen())) {
            await roomInfo.kickingPlayer(pinus_1.pinus.app.getServerId(), [playerInfo]);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1055) };
        }
        if ((0, commonUtil_1.isNullOrUndefined)(lineNum) || (0, commonUtil_1.isNullOrUndefined)(bet)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_4000) };
        }
        if (!(0, lotteryUtil_1.isHaveLine)(lineNum)) {
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_4000) };
        }
        playerInfo.changeGameState();
        try {
            if (typeof lineNum !== 'number' || typeof bet !== 'number' || bet <= 0) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_4000) };
            }
            if (playerInfo.isLackGold(bet, lineNum)) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1015) };
            }
            playerInfo.init();
            playerInfo.bet(bet, lineNum);
            roomInfo.addRunningPool(playerInfo.totalBet).addProfitPool(playerInfo.totalBet);
            const result = await roomInfo.lottery(playerInfo);
            if (result.bigBG >= 4) {
                playerInfo.bigBG = Math.min(result.bigBG, 5);
                playerInfo.Grid = [];
            }
            await roomInfo.settlement(playerInfo, result);
            roomInfo.sendMailAndRemoveOfflinePlayer(playerInfo);
            return {
                code: 200,
                getWindow: result.window,
                totalWin: playerInfo.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                jackpotWin: result.jackpotWin,
                isBigWin: playerInfo.isBigWin,
                canOnlineAward: false,
                onlineAward: 0,
                gold: playerInfo.gold,
                bigBG: result.bigBG,
                roundId: playerInfo.roundId
            };
        }
        catch (e) {
            this.logger.error(`玩家${playerInfo.uid}的游戏spin出错:BingoMoney-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            playerInfo.changeLeisureState();
            await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }
    async jackpotFund({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error };
        }
        return {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
    }
    async loadGold({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        return { code: 200, gold: playerInfo.gold };
    }
    async Grid({}, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        playerInfo.Refresh();
        return { code: 200, ArchiveGrid: playerInfo.ArchiveGrid };
    }
    async BingGuo({ TwoStrategy }, session) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        try {
            let num = 1;
            if (TwoStrategy) {
                num = playerInfo.bigBG;
            }
            let ArchiveGrid = playerInfo.ArchiveGrid.slice();
            ArchiveGrid.sort((a, b) => 0.5 - Math.random());
            playerInfo.bigBG -= num;
            let nCount = [];
            for (let idx = 0; idx < num; idx++) {
                nCount.push(utils.random(2, 4));
            }
            while (15 - (utils.sum(nCount) + playerInfo.Grid.length) < playerInfo.bigBG * 2) {
                nCount.sort((a, b) => b - a);
                nCount[0]--;
            }
            let CurrGrid = [];
            ArchiveGrid.forEach(c => {
                if (CurrGrid.length == utils.sum(nCount)) {
                    return;
                }
                if (!playerInfo.Grid.includes(c)) {
                    playerInfo.Grid.push(c);
                    CurrGrid.push(c);
                }
            });
            let opts = {
                code: 200, Grid: playerInfo.Grid, CurrGrid, bigBG: playerInfo.bigBG, nCount
            };
            if (playerInfo.bigBG == 0) {
                let Multiple = (0, lotteryUtil_1.GetTotalMultiple)(playerInfo.Grid, playerInfo.ArchiveGrid);
                const result = {
                    window: [],
                    jackpotWin: 0,
                    winLines: [],
                    jackpotType: 'none',
                    totalWin: Multiple * playerInfo.baseBet,
                    multiple: 0,
                    bigBG: 0,
                };
                playerInfo.totalBet = 0;
                await roomInfo.settlement(playerInfo, result);
                opts['gold'] = playerInfo.gold;
                opts['Multiple'] = Multiple;
                opts['totalWin'] = playerInfo.profit;
            }
            return opts;
        }
        catch (error) {
            console.error(error);
            return { code: 500, msg: "err" };
        }
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CaW5nb01vbmV5L2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQTREO0FBQzVELCtEQUFnRTtBQUNoRSwrQ0FBaUQ7QUFDakQsa0VBQXNFO0FBQ3RFLHlEQUFtRjtBQUNuRix3Q0FBdUM7QUFHdkMsbUVBQW9FO0FBQ3BFLG9EQUF3RTtBQUN4RSw4REFBNEU7QUFDNUUsOENBQTRFO0FBYzVFLFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVyxFQUFFLFFBQWdCO0lBQ3pFLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztLQUNoRTtJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7S0FDaEU7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDO0FBQUEsQ0FBQztBQUVGLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUdwQixZQUFvQixHQUFnQjtRQUFo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