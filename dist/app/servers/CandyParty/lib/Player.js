"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lotteryUtil_1 = require("./util/lotteryUtil");
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.betOdds = 0;
        this.newer = false;
        this.isBigWin = false;
        this.detonatorCount = 0;
        this.gameLevel = 1;
        this.room = room;
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.isBigWin = false;
        this.betOdds = 0;
        this.initControlType();
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    bet(baseBet, betOdds) {
        this.baseBet = baseBet;
        this.betOdds = betOdds;
        this.totalBet = baseBet * betOdds;
        this.gold -= this.totalBet;
    }
    isLackGold(baseBet, betOdds) {
        return this.gold < baseBet * betOdds;
    }
    addDetonator(num) {
        this.detonatorCount += num;
    }
    initDetonatorCount() {
        this.detonatorCount = 0;
    }
    settlement(playerRealWin, gold) {
        this.gold = gold;
        this.profit = playerRealWin;
    }
    updateGameLevelAndPlayerGameState() {
        const nextGameLevel = (0, lotteryUtil_1.calculateGameLevel)(this.detonatorCount);
        if (nextGameLevel !== this.gameLevel) {
            this.setRoundId(this.room.getRoundId(this.uid));
            this.gameLevel = nextGameLevel;
        }
    }
    buildGameLiveResult(result) {
        return {
            uid: this.uid,
            result,
            baseBet: this.baseBet,
            betOdds: this.betOdds,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ2FuZHlQYXJ0eS9saWIvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esb0RBQXdEO0FBQ3hELHNGQUErRTtBQWdCL0UsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQWFqRCxZQUFZLElBQVMsRUFBRSxJQUFvQjtRQUN2QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFiaEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUVwQixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFMUIsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFDM0IsY0FBUyxHQUFjLENBQUMsQ0FBQztRQUtyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBS0QsSUFBSTtRQUNBLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBTUQsVUFBVSxDQUFDLE9BQWU7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQU9ELEdBQUcsQ0FBQyxPQUFlLEVBQUUsT0FBZTtRQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO0lBRS9CLENBQUM7SUFPRCxVQUFVLENBQUMsT0FBZSxFQUFFLE9BQWU7UUFDdkMsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekMsQ0FBQztJQU1ELFlBQVksQ0FBQyxHQUFXO1FBQ3BCLElBQUksQ0FBQyxjQUFjLElBQUksR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFLRCxrQkFBa0I7UUFDZCxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBT0QsVUFBVSxDQUFDLGFBQXFCLEVBQUUsSUFBWTtRQUMxQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztJQUNoQyxDQUFDO0lBRUQsaUNBQWlDO1FBRTdCLE1BQU0sYUFBYSxHQUFHLElBQUEsZ0NBQWtCLEVBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTlELElBQUksYUFBYSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUMvQyxJQUFJLENBQUMsU0FBUyxHQUFHLGFBQTBCLENBQUM7U0FDL0M7SUFDTCxDQUFDO0lBTUQsbUJBQW1CLENBQUMsTUFBYztRQUM5QixPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsTUFBTTtZQUNOLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDeEIsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQTNHRCx5QkEyR0MifQ==