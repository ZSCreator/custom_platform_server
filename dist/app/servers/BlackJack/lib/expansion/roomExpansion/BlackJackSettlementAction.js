"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackSettlementAction = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const BlackJackPlayerStatusEnum_1 = require("../../enum/BlackJackPlayerStatusEnum");
const BlackJackPlayerRoleEnum_1 = require("../../enum/BlackJackPlayerRoleEnum");
const RoleEnum_1 = require("../../../../../common/constant/player/RoleEnum");
const recordUtil_1 = require("../../util/recordUtil");
const RecordGeneralManager_1 = require("../../../../../common/dao/RecordGeneralManager");
const BlackJackPlayerHistory_1 = require("../../BlackJackPlayerHistory");
class BlackJackSettlementAction {
    constructor(room) {
        this.room = room;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    static getInstance(room, paramRoomId) {
        if (this.roomIdList.findIndex(roomId => roomId === paramRoomId) < 0) {
            this.roomIdList.push(paramRoomId);
            this.instanceMap[paramRoomId] = new BlackJackSettlementAction(room);
        }
        return this.instanceMap[paramRoomId];
    }
    async settedCurrentGame() {
        var e_1, _a;
        const playerList = this.room.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player);
        const { countList: dealerCountList, pokerList: dealerPokerList } = this.room.runtimeData.getDealerPokerListAndCount();
        const dealerIsBlackJack = dealerCountList.some(count => count === 21);
        try {
            for (var playerList_1 = __asyncValues(playerList), playerList_1_1; playerList_1_1 = await playerList_1.next(), !playerList_1_1.done;) {
                const player = playerList_1_1.value;
                try {
                    const { uid, isRobot } = player;
                    const isRealPlayer = isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER;
                    let { bet, win, hadSeparate } = player.commonAreaBetList.reduce((result, area, areaIdx) => {
                        const { countList, pokerList } = area.getPokerAndCount();
                        if (pokerList.length === 0) {
                            return result;
                        }
                        if (area.checkHadSeparate()) {
                            result.hadSeparate = true;
                        }
                        const playerIsBlackJack = countList.some(count => count === 21);
                        result.bet += area.getCurrentBet();
                        if (player.hadBuyInsurance) {
                            result.bet += player.insuranceAreaList[areaIdx].getBet();
                        }
                        if (this.room.beInsuranceToSettlement) {
                            if (!dealerIsBlackJack) {
                                throw new Error(`${this.room.backendServerId} | ${this.room.sceneId} | ${this.room.roomId} | 保险阶段 -> 结算阶段 | 庄家结算出错: 庄家手牌不为 BlackJack ${JSON.stringify(dealerCountList)}`);
                            }
                            result.bet += (area.getCurrentBet() * 0.5);
                            area.addMulriple(0.5);
                            if (player.hadBuyInsurance) {
                                result.win += area.getCurrentBet();
                                return result;
                            }
                            if (playerIsBlackJack) {
                                result.win += area.getSettlementAmount();
                                return result;
                            }
                            return result;
                        }
                        const dealerPokerCount = Math.max(...dealerCountList);
                        const playerPokerCount = Math.max(...countList);
                        if (dealerPokerCount <= 21 && playerPokerCount > 21) {
                            if (dealerIsBlackJack && dealerPokerList.length === 2) {
                                result.bet += (area.getCurrentBet() * 0.5);
                            }
                            return result;
                        }
                        if (dealerPokerCount > 21 && playerPokerCount <= 21) {
                            area.addMulriple(1);
                            if (playerIsBlackJack && pokerList.length === 2) {
                                area.addMulriple(0.5);
                            }
                            result.win += area.getSettlementAmount();
                            return result;
                        }
                        if (dealerPokerCount > 21 && playerPokerCount > 21) {
                            return result;
                        }
                        if (dealerPokerCount > playerPokerCount) {
                            return result;
                        }
                        if (dealerPokerCount < playerPokerCount) {
                            area.addMulriple(1);
                            if (playerIsBlackJack && pokerList.length === 2) {
                                area.addMulriple(0.5);
                            }
                            result.win += area.getSettlementAmount();
                            return result;
                        }
                        if (dealerPokerCount === playerPokerCount) {
                            result.win += area.getSettlementAmount();
                            return result;
                        }
                        return result;
                    }, { bet: 0, win: 0, hadSeparate: false });
                    if (hadSeparate) {
                        const { bet: sepBet, win: sepWin } = player.separateAreaBetList.reduce((result, area, areaIdx) => {
                            const { countList, pokerList } = area.getPokerAndCount();
                            if (pokerList.length === 0) {
                                return result;
                            }
                            result.bet += area.getCurrentBet();
                            const dealerPokerCount = Math.max(...dealerCountList);
                            const playerPokerCount = Math.max(...countList);
                            if (dealerPokerCount <= 21 && playerPokerCount > 21) {
                                return result;
                            }
                            if (dealerPokerCount > 21 && playerPokerCount <= 21) {
                                area.addMulriple(1);
                                result.win += area.getSettlementAmount();
                                return result;
                            }
                            if (dealerPokerCount > 21 && playerPokerCount > 21) {
                                return result;
                            }
                            if (dealerPokerCount > playerPokerCount) {
                                return result;
                            }
                            if (dealerPokerCount < playerPokerCount) {
                                area.addMulriple(1);
                                result.win += area.getSettlementAmount();
                                return result;
                            }
                            if (dealerPokerCount === playerPokerCount) {
                                result.win += area.getSettlementAmount();
                                return result;
                            }
                            return result;
                        }, { bet, win });
                        bet = sepBet;
                        win = sepWin;
                    }
                    let gameRecordLivesResult = null;
                    if (player.isRobot === 0) {
                        gameRecordLivesResult = new BlackJackPlayerHistory_1.BlackJackPlayerHistory()
                            .setBetTotal(player.getCurrentTotalBet())
                            .setBetAreaList(player.commonAreaBetList)
                            .setSeparateBetAreaList(player.separateAreaBetList)
                            .setDealerArea(this.room.runtimeData.getDealerPokerListAndCount());
                    }
                    const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(player.uid, false, player.isRobot, player.gold)
                        .setGameInfo(this.room.nid, this.room.sceneId, this.room.roomId)
                        .setGameRoundInfo(this.room.roundId, this.room.realPlayersNumber, 0)
                        .setControlType(player.controlType)
                        .addResult((0, recordUtil_1.buildRecordResult)(this.room.runtimeData.getDealerPokerListAndCount(), player.commonAreaBetList))
                        .setGameRecordInfo(Math.abs(bet), Math.abs(bet), win - bet, false)
                        .setGameRecordLivesResult(gameRecordLivesResult)
                        .sendToDB(1);
                    player.profitQueue.push(playerRealWin);
                    if (playerRealWin > 0) {
                        player.winRound++;
                    }
                    const p = this.room.players.find(p => p.uid === player.uid);
                    !!p && (p.gold = gold);
                }
                catch (e) {
                    this.logger.error(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${player.uid} | 结算统计出错: ${e.stack}`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (playerList_1_1 && !playerList_1_1.done && (_a = playerList_1.return)) await _a.call(playerList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.room.players.map(pl => {
            if (pl.uid && pl.isRobot == 0 && pl.role == BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player && pl.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.None && pl.totalBet == 0) {
                pl.standbyRounds += 1;
            }
        });
        const pList = this.room.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
            p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
            p.totalBet > 0);
        playerList.filter(p => p.onLine === false).forEach(p => {
            const { uid, group_id: rootUid, lineCode: parantUid, } = p;
            this.room.runtimeData.leaveSeat(uid);
            p.playerHadLeave();
            this.room.channelForPlayer.playerLeaveToAllPlayer(this.room.players);
            let msg = {
                args: [
                    rootUid,
                    parantUid,
                    this.room.roomId
                ],
                method: "leaveRoomInIsolationPool",
                namespace: "user",
                service: "mainRemote",
            };
            msg["serverType"] = pinus_1.pinus.app.getServerType();
            pinus_1.pinus.app.components.__remote__.remote.dispatcher.route(null, msg, (err, ...args) => {
            });
        });
    }
}
exports.BlackJackSettlementAction = BlackJackSettlementAction;
BlackJackSettlementAction.roomIdList = [];
BlackJackSettlementAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrU2V0dGxlbWVudEFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvZXhwYW5zaW9uL3Jvb21FeHBhbnNpb24vQmxhY2tKYWNrU2V0dGxlbWVudEFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsaUNBQThDO0FBQzlDLCtDQUF5QztBQUV6QyxvRkFBaUY7QUFDakYsZ0ZBQTZFO0FBQzdFLDZFQUEwRTtBQUMxRSxzREFBMEQ7QUFDMUQseUZBQXVGO0FBQ3ZGLHlFQUFzRTtBQUd0RSxNQUFhLHlCQUF5QjtJQW1CbEMsWUFBWSxJQUF1QjtRQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQWJELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBdUIsRUFBRSxXQUFtQjtRQUMzRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUkseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDdEU7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQVFELEtBQUssQ0FBQyxpQkFBaUI7O1FBSW5CLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM1QyxDQUFD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