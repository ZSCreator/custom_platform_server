"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.newer = false;
        this.isBigWin = false;
        this.room = room;
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.isBigWin = false;
        this.initControlType();
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    bet(baseBet) {
        this.baseBet = baseBet;
        this.totalBet = baseBet;
        this.gold -= this.totalBet;
    }
    isLackGold(baseBet) {
        return this.gold < baseBet;
    }
    settlement(playerRealWin, gold) {
        this.gold = gold;
        this.profit = playerRealWin;
    }
    buildGameLiveResult(result) {
        return {
            uid: this.uid,
            result,
            baseBet: this.baseBet,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ2FuZHlNb25leS9saWIvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsc0ZBQStFO0FBZ0IvRSxNQUFxQixNQUFPLFNBQVEsMkJBQWlCO0lBVWpELFlBQVksSUFBUyxFQUFFLElBQW9CO1FBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQVZoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUdwQixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFLdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUtELElBQUk7UUFDQSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUV0QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQU1ELFVBQVUsQ0FBQyxPQUFlO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFPRCxHQUFHLENBQUMsT0FBZTtRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUUvQixDQUFDO0lBT0QsVUFBVSxDQUFDLE9BQWU7UUFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztJQUMvQixDQUFDO0lBT0QsVUFBVSxDQUFDLGFBQXFCLEVBQUUsSUFBWTtRQUMxQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztJQUNoQyxDQUFDO0lBT0QsbUJBQW1CLENBQUMsTUFBYztRQUM5QixPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsTUFBTTtZQUNOLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztTQUV4QixDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBaEZELHlCQWdGQyJ9