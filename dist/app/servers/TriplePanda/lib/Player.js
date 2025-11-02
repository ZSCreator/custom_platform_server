"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvVHJpcGxlUGFuZGEvbGliL1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNGQUErRTtBQWtDL0UsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQWVqRCxZQUFZLElBQVMsRUFBRSxJQUFvQjtRQUN2QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFmaEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixXQUFNLEdBQW1CLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDN0YsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsV0FBTSxHQUFVLENBQUMsQ0FBQztRQUVsQixzQkFBaUIsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFJbkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFFckIsQ0FBQztJQUlELElBQUk7UUFDQSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsZUFB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