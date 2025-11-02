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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ2Vtcy9saWIvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0ZBQStFO0FBa0MvRSxNQUFxQixNQUFPLFNBQVEsMkJBQWlCO0lBZWpELFlBQVksSUFBUyxFQUFFLElBQW9CO1FBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWZoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLFdBQU0sR0FBbUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM3RixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLFVBQUssR0FBWSxLQUFLLENBQUM7UUFDdkIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixXQUFNLEdBQVUsQ0FBQyxDQUFDO1FBRWxCLHNCQUFpQixHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUluQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUVyQixDQUFDO0lBSUQsSUFBSTtRQUNBLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxlQUFlLEVBQUUs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