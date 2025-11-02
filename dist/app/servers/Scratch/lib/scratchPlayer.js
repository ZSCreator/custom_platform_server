"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
class Player extends slotMachinePlayer_1.default {
    constructor(opts) {
        super(opts);
    }
    setBetAndJackpotId(bet, jackpotId) {
        this.bet = bet;
        this.jackpotId = jackpotId;
        this.gold -= bet;
        this.initControlType();
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    settlement(profit, gold) {
        this.gold = gold;
        this.profit = profit;
    }
    buildGameLiveResult(result) {
        return {
            uid: this.uid,
            result,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXRjaFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NjcmF0Y2gvbGliL3NjcmF0Y2hQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzRkFBK0U7QUFLL0UsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQU1qRCxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFPRCxrQkFBa0IsQ0FBQyxHQUFXLEVBQUUsU0FBaUI7UUFDN0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQU1ELFVBQVUsQ0FBQyxPQUFlO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFPRCxVQUFVLENBQUMsTUFBYyxFQUFFLElBQUk7UUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQU1ELG1CQUFtQixDQUFDLE1BQWM7UUFDOUIsT0FBTztZQUNILEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLE1BQU07U0FDVCxDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBbERELHlCQWtEQyJ9