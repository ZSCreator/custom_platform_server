"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
const constant_1 = require("./constant");
const elemenets_1 = require("./config/elemenets");
const lotteryUtil_1 = require("./util/lotteryUtil");
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.lineNumber = constant_1.AWARD_LINE_COUNT;
        this.record = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '3', time: 0 };
        this.gameRound = 0;
        this.newer = false;
        this.isBigWin = false;
        this.winPercentage = 0;
        this.subGameType = null;
        this.status = 1;
        this.lastOperationTime = Date.now();
        this.clayPotGameBonusCount = 1;
        this.orchardGameWindow = [];
        this.orchardProfit = 0;
        this.orchardGameResults = [];
        this.room = room;
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.isBigWin = false;
        this.subGameType = null;
        this.clayPotGameBonusCount = 1;
        this.orchardProfit = 0;
        this.orchardGameResults = [];
        this.initControlType();
    }
    setSubGameType(type) {
        this.subGameType = type;
        if (type === elemenets_1.ElementsEnum.Witch) {
            this.orchardGameWindow = (0, lotteryUtil_1.genOrchardGameWindow)();
        }
    }
    orchardGameOpen(index) {
        this.orchardGameWindow[index].open = true;
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    bet(baseBet) {
        this.baseBet = baseBet;
        this.totalBet = baseBet * this.lineNumber;
        this.lastOperationTime = Date.now();
    }
    isLackGold(baseBet) {
        return this.gold < baseBet * this.lineNumber;
    }
    settlement(playerRealWin, gold) {
        const win = this.subGameType === null ? this.totalBet + playerRealWin : playerRealWin;
        this.profit = win;
        this.record.totalWin += win;
        this.gold = gold;
        this.record.totalBet += this.totalBet;
        this.record.time = Date.now();
        this.gameRound++;
        this.record.recordCount++;
        this.winPercentage = this.record.totalWin / this.record.totalBet;
        if (this.winPercentage > 0.9) {
            this.record.recordCount = 0;
            this.record.totalWin = 0;
            this.record.totalBet = 0;
        }
    }
    buildLiveRecord(result) {
        return {
            uid: this.uid,
            baseBet: this.baseBet,
            result,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvaGFsbG93ZWVuL2xpYi9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzRkFBK0U7QUFDL0UseUNBQWlGO0FBQ2pGLGtEQUFnRDtBQUNoRCxvREFBd0Q7QUFxQ3hELE1BQXFCLE1BQU8sU0FBUSwyQkFBaUI7SUFvQmpELFlBQVksSUFBUyxFQUFFLElBQW9CO1FBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQXBCaEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsZUFBVSxHQUFXLDJCQUFnQixDQUFDO1FBRXRDLFdBQU0sR0FBbUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUMsQ0FBQztRQUM1RixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLFVBQUssR0FBWSxLQUFLLENBQUM7UUFDdkIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixnQkFBVyxHQUFnQixJQUFJLENBQUM7UUFDaEMsV0FBTSxHQUFVLENBQUMsQ0FBQztRQUVsQixzQkFBaUIsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkMsMEJBQXFCLEdBQVcsQ0FBQyxDQUFDO1FBQ2xDLHNCQUFpQixHQUFvRCxFQUFFLENBQUM7UUFDeEUsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsdUJBQWtCLEdBQTZCLEVBQUUsQ0FBQztRQUk5QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBS0QsSUFBSTtRQUNBLElBQUksQ0FBQyxN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