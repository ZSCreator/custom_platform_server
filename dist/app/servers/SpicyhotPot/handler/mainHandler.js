"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const Util = require("../../../utils");
const sessionService = require("../../../services/sessionService");
const RoomMgr_1 = require("../lib/RoomMgr");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const langsrv_1 = require("../../../services/common/langsrv");
const LoggerErr = (0, pinus_logger_1.getLogger)('server_out', __filename);
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function process(roomId, uid, sceneId) {
    const roomInfo = RoomMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        LoggerErr.warn(`error ==> mainHandler==>process函数 | 玩家${uid}: 未找到对应房间${roomId}`);
        return { error: 1 };
    }
    const roomPlayer = roomInfo.getPlayer(uid);
    if (!roomPlayer) {
        LoggerErr.warn(`error ==> mainHandler==>process函数 | 玩家${uid}: 未在房间${roomId}找到对应玩家`);
        return { error: 1 };
    }
    return { roomInfo, roomPlayer };
}
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
    }
    async loaded({}, session) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { roomInfo, roomPlayer, error } = process(roomId, uid, sceneId);
        const player = await Player_manager_1.default.findOne({ uid });
        if (error) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2004) };
        }
        if (!roomPlayer.isOnline()) {
            roomInfo.addPlayerInRoom(player);
        }
        return {
            code: 200,
            player: roomPlayer.strip(),
            betAreas: roomPlayer.betAreas,
            betArea1: roomPlayer.betArea1,
            betArea2: roomPlayer.betArea2,
            betArea3: roomPlayer.betArea3,
            roundId: roomPlayer.roundId,
        };
    }
    async userBet({ bets }, session) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { roomInfo, roomPlayer, error } = process(roomId, uid, sceneId);
        if (roomPlayer.isGameState()) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(roomPlayer.language, langsrv_1.Net_Message.id_3103) };
        }
        const player = await Player_manager_1.default.findOne({ uid });
        if (error) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2004) };
        }
        roomPlayer.changeGameState();
        try {
            let judge = false;
            let area;
            for (let key in roomPlayer.betAreas) {
                if (bets == roomPlayer.betAreas[key].bet) {
                    judge = true;
                    area = key;
                    break;
                }
            }
            if (judge === false) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
            }
            let betArea = roomPlayer.betAreas[area];
            if (Util.sum(bets) > Util.sum(roomPlayer.gold) || bets <= 0) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1015) };
            }
            roomPlayer.updateRoundId(roomInfo);
            judge = await roomPlayer.deductGold(bets);
            const { rest, rebate } = await roomInfo.GetKaiJiangResult(roomPlayer, Util.sum(bets));
            let arr = [null, null, null, null, null, null, null, null, null];
            let len = 0;
            let BZprofit = 0;
            for (let i = 0; i < arr.length; i++) {
                if (Math.random() < 0.21) {
                    arr[i] = 1;
                    len++;
                }
            }
            roomPlayer.betArea1 += bets * 0.01;
            roomPlayer.betArea2 += bets * 0.015;
            roomPlayer.betArea3 += bets * 0.02;
            let awardType = '0';
            if (len > 3) {
                if (len > 3 && len < 7) {
                    BZprofit = roomPlayer.betArea1 + betArea['Area'][0];
                    awardType = '1';
                    roomPlayer.betArea1 = 0;
                }
                else if (len > 6 && len < 9) {
                    BZprofit = roomPlayer.betArea2 + betArea['Area'][1];
                    awardType = '2';
                    roomPlayer.betArea2 = 0;
                }
                else {
                    BZprofit = roomPlayer.betArea3 + betArea['Area'][2];
                    awardType = '3';
                    roomPlayer.betArea3 = 0;
                }
            }
            BZprofit = Math.floor(BZprofit);
            const Spicyhotarr = { arr: arr, len: len, BZprofit: BZprofit };
            let totalWin = 0;
            const details = {};
            for (let key in rebate) {
                totalWin += rebate[key][Object.keys(rebate[key])[0]];
                details[Object.keys(rebate[key])[0]] = Math.floor(rebate[key][Object.keys(rebate[key])[0]] * bets);
            }
            totalWin = Math.floor(totalWin * bets);
            const { playerRealWin, reBZProfit } = await roomPlayer.addGold(totalWin, BZprofit, rest, details, awardType, roomInfo);
            totalWin = playerRealWin >= 0 ? playerRealWin + roomPlayer.totalBet : roomPlayer.totalBet - Math.abs(playerRealWin);
            Spicyhotarr.BZprofit = Math.floor(reBZProfit);
            player.isRobot !== 2 && log_logger.info(`bet|${GameNidEnum_1.GameNidEnum.SpicyhotPot}|${player.uid}|${bets}|${totalWin}|${Spicyhotarr.BZprofit}`);
            return {
                code: 200,
                gold: roomPlayer.gold,
                rest,
                rebate,
                totalWin: totalWin,
                Spicyhotarr: Spicyhotarr,
                betAreas: roomPlayer.betAreas,
                betArea1: roomPlayer.betArea1,
                betArea2: roomPlayer.betArea2,
                betArea3: roomPlayer.betArea3,
                roundId: roomPlayer.roundId,
            };
        }
        catch (e) {
            return { code: 500, error: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1012) };
        }
        finally {
            roomPlayer.changeLeisureState();
        }
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TcGljeWhvdFBvdC9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFJLHVDQUF3QztBQUM1QyxtRUFBb0U7QUFDcEUsNENBQXlDO0FBQ3pDLGtGQUE2RTtBQUU3RSwrQ0FBeUM7QUFDekMsMkVBQXdFO0FBQ3hFLDhEQUE0RTtBQUM1RSxNQUFNLFNBQVMsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFHdkQsU0FBUyxPQUFPLENBQUMsTUFBYyxFQUFFLEdBQVcsRUFBRSxPQUFlO0lBQ3pELE1BQU0sUUFBUSxHQUFHLGlCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUV6RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsU0FBUyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsR0FBRyxZQUFZLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDakYsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztLQUN2QjtJQUVELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLFNBQVMsQ0FBQyxJQUFJLENBQUMseUNBQXlDLEdBQUcsU0FBUyxNQUFNLFFBQVEsQ0FBQyxDQUFDO1FBQ3BGLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDdkI7SUFFRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFFRCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FB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