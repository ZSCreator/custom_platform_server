"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.lineNumber = 0;
        this.record = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '3', time: 0 };
        this.gameRound = 0;
        this.newer = false;
        this.isBigWin = false;
        this.winPercentage = 0;
        this.status = 1;
        this.lastOperationTime = Date.now();
        this.jackpot = {
            mini: 50,
            minor: 50,
            Grand: 5000,
        };
        this.room = room;
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.lineNumber = 0;
        this.isBigWin = false;
        this.initControlType();
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    bet(baseBet, lineNumber) {
        this.baseBet = baseBet;
        this.lineNumber = lineNumber;
        this.totalBet = baseBet * lineNumber;
        this.lastOperationTime = Date.now();
        this.gold -= this.totalBet;
        if (this.BetRecord == baseBet) {
            this.newer = !this.newer;
        }
        else {
            this.newer = false;
        }
        this.BetRecord = baseBet;
        this.jackpot.mini += (0, commonUtil_1.fixNoRound)(baseBet * 0.002);
        this.jackpot.minor += (0, commonUtil_1.fixNoRound)(baseBet * 0.003);
        this.jackpot.Grand += (0, commonUtil_1.fixNoRound)(baseBet * 0.005);
    }
    isLackGold(baseBet, lineNumber) {
        return this.gold < baseBet * lineNumber;
    }
    settlement(playerRealWin, gold) {
        const win = this.totalBet + playerRealWin;
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
    buildLiveRecord(result, freeSpin, odds, window) {
        return {
            uid: this.uid,
            baseBet: this.baseBet,
            lineNumber: this.lineNumber,
            result,
            odds,
            freeSpin,
            window
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ2FzaFNsb3QvbGliL1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNGQUErRTtBQUUvRSxrRUFBK0Q7QUFnQy9ELE1BQXFCLE1BQU8sU0FBUSwyQkFBaUI7SUFvQmpELFlBQVksSUFBUyxFQUFFLElBQW9CO1FBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQXBCaEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixXQUFNLEdBQW1CLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDN0YsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsV0FBTSxHQUFVLENBQUMsQ0FBQztRQUVsQixzQkFBaUIsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFdkMsWUFBTyxHQUFHO1lBQ04sSUFBSSxFQUFFLEVBQUU7WUFDUixLQUFLLEVBQUUsRUFBRTtZQUNULEtBQUssRUFBRSxJQUFJO1NBQ2QsQ0FBQTtRQUdHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBRXJCLENBQUM7SUFJRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFD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