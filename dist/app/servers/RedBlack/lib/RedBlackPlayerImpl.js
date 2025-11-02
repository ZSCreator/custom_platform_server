"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const RedBlackConst_1 = require("./RedBlackConst");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RedBlackPlayerImpl extends PlayerInfo_1.PlayerInfo {
    constructor(opts, roomInfo) {
        super(opts);
        this.profit = 0;
        this.totalProfit = [];
        this.bet = 0;
        this.totalBet = [];
        this.bets = {};
        this.firstEnTime = Date.now();
        this.offlineCount = 0;
        this.betAreas = {};
        this.validBet = 0;
        this.quitBanker = false;
        this.isBanker = false;
        this.bankerCount = 0;
        this.bankerProfit = 0;
        this.roundCount = 0;
        this.winRound = 0;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.standbyRounds = 0;
        this.initgold = 0;
        this.initgold = this.gold;
    }
    async roundPlayerInit() {
        this.initControlType();
        this.standbyRounds++;
        if (this.bet > 0) {
            this.totalBet.push(this.bet);
            this.totalProfit.push(this.profit);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.standbyRounds = 0;
        }
        this.validBet = 0;
        this.profit = 0;
        this.bet = 0;
        this.bets = {};
        this.betAreas = {};
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
    }
    setBanker() {
        this.isBanker = true;
        this.bankerCount += 1;
    }
    clearBanker() {
        this.isBanker = false;
        this.bankerCount = 0;
        this.bankerProfit = 0;
        this.quitBanker = false;
    }
    upOnlineTrue() {
        this.onLine = true;
        this.offlineCount = 0;
    }
    isOnline() {
        return this.onLine;
    }
    betHistory(area, gold) {
        this.bet += gold;
        if (!this.betAreas[area])
            this.betAreas[area] = 0;
        this.betAreas[area] += gold;
        if (!this.bets[area])
            this.bets[area] = { bet: 0, profit: 0 };
        this.bets[area].bet += gold;
    }
    validBetCount(betNumber) {
        this.validBet = betNumber;
    }
    async addGold(roomInfo, winArea, settlement_info) {
        const res = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.validBet), this.profit - this.bet, false)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildResult(winArea, settlement_info))
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
        if (this.isBanker)
            this.bankerProfit += res.playerRealWin;
    }
    strip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            totalProfit: this.totalProfit,
            firstEnTime: this.firstEnTime,
            bet: this.bet,
            robot: this.isRobot,
        };
    }
    topUpStrip() {
        return {
            uid: this.uid,
            gold: this.gold
        };
    }
    bankerStrip() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
            remainingRound: RedBlackConst_1.bankerRoundLimit - this.bankerCount
        };
    }
    buildResult(winArea, settlement_info) {
        let settleDetails = {};
        for (let area in this.bets) {
            settleDetails[area] = { win: this.bets[area].profit - this.bets[area].bet, bet: this.bets[area].bet };
        }
        return this.isBanker ? {
            uid: this.uid,
            isBanker: this.isBanker,
            win: this.profit,
            settlement_info
        } : {
            uid: this.uid,
            isBanker: this.isBanker,
            area: settleDetails,
            settlement_info
        };
    }
    setControlState(params) {
        this.controlState = params.state;
    }
    checkOverrunBet(params) {
        let transfiniteArea = {}, transfiniteCondition = params.condition * 100;
        if (transfiniteCondition === 0)
            return transfiniteArea;
        for (let area in this.betAreas) {
            if (this.betAreas[area] >= transfiniteCondition) {
                transfiniteArea[area] = this.betAreas[area];
            }
        }
        return transfiniteArea;
    }
    filterBetNum(params) {
        let bet = 0;
        for (let area in this.betAreas) {
            if (params.areas.has(area)) {
                continue;
            }
            bet += this.betAreas[area];
        }
        return bet;
    }
}
exports.default = RedBlackPlayerImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkQmxhY2tQbGF5ZXJJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvUmVkQmxhY2svbGliL1JlZEJsYWNrUGxheWVySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHVFQUFvRTtBQUNwRSxtREFBNEQ7QUFDNUQsa0ZBQXNGO0FBRXRGLG1GQUFpRjtBQWlCakYsTUFBcUIsa0JBQW1CLFNBQVEsdUJBQVU7SUE4QnRELFlBQVksSUFBSSxFQUFFLFFBQXNCO1FBQ3BDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTdCaEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUVuQixnQkFBVyxHQUFhLEVBQUUsQ0FBQztRQUUzQixRQUFHLEdBQVcsQ0FBQyxDQUFDO1FBRWhCLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFHeEIsU0FBSSxHQUF3RCxFQUFFLENBQUM7UUFHL0QsZ0JBQVcsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDakMsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsYUFBUSxHQUErQixFQUFFLENBQUM7UUFFMUMsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixlQUFVLEdBQVksS0FBSyxDQUFDO1FBQzVCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFDeEIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGlCQUFZLEdBQXVCLGdDQUFrQixDQUFDLE1BQU0sQ0FBQztRQUU3RCxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUVsQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0lBR0QsS0FBSyxDQUFDLGVBQWU7UUFDakIsSUFBSSxDQUFD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