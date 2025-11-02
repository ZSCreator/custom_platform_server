"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../../../utils/index");
const DragonTigerConst = require("./DragonTigerConst");
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const DragonTigerConst_1 = require("./DragonTigerConst");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class dtplayer extends PlayerInfo_1.PlayerInfo {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalProfit = [];
        this.bet = 0;
        this.totalBet = [];
        this.recordBets = [];
        this.bets = {};
        this.firstEnTime = new Date().getTime();
        this.offlineCount = 0;
        this.isBanker = false;
        this.bankerCount = 0;
        this.bankerProfit = 0;
        this.quitBanker = false;
        this.lastProfit = 0;
        this.validBet = 0;
        this.winRound = 0;
        this.standbyRounds = 0;
        this.initgold = 0;
        this.gold = opts.gold;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.initgold = this.gold;
    }
    roundPlayerInit(roomInfo) {
        this.standbyRounds++;
        if (this.bet) {
            this.standbyRounds = 0;
            this.totalProfit.push(this.profit);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.winRound = this.totalProfit.reduce((total, Value) => {
                if (Value > 0) {
                    total++;
                }
                return total;
            }, 0);
        }
        if (roomInfo.bankerQueue.find(c => c.uid == this.uid)) {
            this.standbyRounds = 0;
        }
        if (this.bet > 0) {
            this.recordBets = [];
            for (const area in this.bets) {
                this.recordBets.push({ area: area, bet: this.bets[area].bet });
            }
        }
        this.lastProfit = this.bet > 0 ? this.profit : 0;
        this.validBet = 0;
        this.profit = 0;
        this.bet = 0;
        this.bets = {};
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.initControlType();
    }
    upOnlineTrue() {
        this.onLine = true;
        this.offlineCount = 0;
    }
    setBanker() {
        this.isBanker = true;
        this.bankerCount = DragonTigerConst.bankerRoundLimit;
    }
    clearBanker() {
        this.isBanker = false;
        this.bankerCount = 0;
        this.bankerProfit = 0;
        this.quitBanker = false;
    }
    addOffLineCount() {
        this.offlineCount += 1;
    }
    betHistory(area, betGold) {
        this.bet += betGold;
        if (!this.bets[area])
            this.bets[area] = { bet: 0, profit: 0 };
        this.bets[area].bet += betGold;
    }
    validBetCount(betNumber) {
        this.validBet = betNumber;
    }
    async addGold(roomInfo, winArea) {
        const res = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setControlType(this.controlType)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.validBet), this.profit, this.isBanker)
            .setGameRecordLivesResult(this.buildResult(roomInfo, winArea))
            .sendToDB(1);
        this.gold = res.gold;
        this.profit = res.playerRealWin;
        this.initgold = this.gold;
        if (this.isBanker) {
            this.bankerProfit += res.playerRealWin;
        }
    }
    strip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold - this.bet,
            profit: this.profit,
            robot: this.isRobot,
            bet: this.bet,
        };
    }
    bankerStrip() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
            remainingRound: DragonTigerConst_1.bankerRoundLimit - this.bankerCount
        };
    }
    stripOne() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            winRound: this.winRound,
            totalBet: utils.sum(this.totalBet),
        };
    }
    buildResult(roomInfo, winArea) {
        let settleDetails = {};
        if (this.isBanker) {
            settleDetails = roomInfo.BankSettleDetails;
        }
        else {
            for (let area in this.bets) {
                settleDetails[area] = { win: this.bets[area].profit, bet: this.bets[area].bet };
            }
        }
        const opts = {
            uid: this.uid,
            isBanker: this.isBanker,
            result: roomInfo.result,
            settlement_info: winArea,
            area: settleDetails,
            win: this.profit,
        };
        return opts;
    }
    checkOverrunBet(params) {
        let transfiniteArea = {}, transfiniteCondition = params.condition * 100;
        if (transfiniteCondition === 0)
            return transfiniteArea;
        for (let area in this.bets) {
            if (this.bets[area].bet >= transfiniteCondition) {
                transfiniteArea[area] = this.bets[area].bet;
            }
        }
        return transfiniteArea;
    }
    setControlState(params) {
        this.controlState = params.state;
    }
    filterBetNum(params) {
        let bet = 0;
        for (let area in this.bets) {
            if (params.areas.has(area)) {
                continue;
            }
            bet += this.bets[area].bet;
        }
        return bet;
    }
}
exports.default = dtplayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHRQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EcmFnb25UaWdlci9saWIvZHRQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBK0M7QUFDL0MsdURBQXdEO0FBQ3hELHVFQUFvRTtBQUNwRSx5REFBc0Q7QUFFdEQsa0ZBQXNGO0FBRXRGLG1GQUFpRjtBQUdqRixNQUFxQixRQUFTLFNBQVEsdUJBQVU7SUFtQzVDLFlBQVksSUFBUyxFQUFFLElBQVk7UUFDL0IsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBbENoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBRTNCLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFFaEIsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUV4QixlQUFVLEdBQW9DLEVBQUUsQ0FBQztRQUVqRCxTQUFJLEdBQXdELEVBQUUsQ0FBQztRQUUvRCxnQkFBVyxHQUFXLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFM0MsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUUxQixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUV4QixpQkFBWSxHQUFXLENBQUMsQ0FBQztRQUV6QixlQUFVLEdBQVksS0FBSyxDQUFDO1FBRTVCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR3JCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFHakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsZ0NBQWtCLENBQUMsTUFBTSxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLEdB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