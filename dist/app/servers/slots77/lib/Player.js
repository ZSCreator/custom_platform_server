"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.playerWin = 0;
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
        this.playerWin = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.lineNumber = 0;
        this.isBigWin = false;
        this.initControlType();
        this.goldDoubleResult = null;
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    bet(baseBet) {
        this.baseBet = baseBet;
        this.lineNumber = 5;
        this.totalBet = baseBet * 5;
        this.lastOperationTime = Date.now();
    }
    isLackGold(baseBet) {
        return this.gold < baseBet * 5;
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
    buildLiveRecord(result) {
        return {
            uid: this.uid,
            baseBet: this.baseBet,
            result,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvc2xvdHM3Ny9saWIvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0ZBQStFO0FBbUQvRSxNQUFxQixNQUFPLFNBQVEsMkJBQWlCO0lBaUJqRCxZQUFZLElBQVMsRUFBRSxJQUFvQjtRQUN2QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFqQmhCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixXQUFNLEdBQW1CLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFDLENBQUM7UUFDNUYsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsV0FBTSxHQUFVLENBQUMsQ0FBQztRQUdsQixzQkFBaUIsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFJbkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUtELElBQUk7UUFDQSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUNqQyxDQUFDO0lBTUQsVUFBVSxDQUFDLE9BQWU7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQU9ELEdBQUcsQ0FBQyxPQUFlO1FBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFeEMsQ0FBQztJQUtELFVBQVUsQ0FBQyxPQUFlO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFLRCxVQUFVLENBQUMsYUFBcUIsRUFBRSxJQUFZO1FBRTFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDO1FBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO1FBR3RDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU5QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFHakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBR2pFLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLEVBQUU7WUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDNUI7SUFDTCxDQUFDO0lBTUQsZUFBZSxDQUFDLE1BQVc7UUFDdkIsT0FBTztZQUNILEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixNQUFNO1NBQ1QsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQTFHRCx5QkEwR0MifQ==