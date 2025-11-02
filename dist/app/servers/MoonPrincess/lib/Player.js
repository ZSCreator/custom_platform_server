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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTW9vblByaW5jZXNzL2xpYi9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxvREFBd0Q7QUFDeEQsc0ZBQStFO0FBZ0IvRSxNQUFxQixNQUFPLFNBQVEsMkJBQWlCO0lBYWpELFlBQVksSUFBUyxFQUFFLElBQW9CO1FBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWJoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFVBQUssR0FBWSxLQUFLLENBQUM7UUFDdkIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUUxQixtQkFBYyxHQUFXLENBQUMsQ0FBQztRQUMzQixjQUFTLEdBQWMsQ0FBQyxDQUFDO1FBS3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFLRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFNRCxVQUFVLENBQUMsT0FBZTtRQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBT0QsR0FBRyxDQUFDLE9BQWUsRUFBRSxPQUFlO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7SUFFL0IsQ0FBQztJQU9ELFVBQVUsQ0FBQyxPQUFlLEVBQUUsT0FBZTtRQUN2QyxPQUFPLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QyxDQUFDO0lBTUQsWUFBWSxDQUFDLEdBQVc7UUFDcEIsSUFBSSxDQUFDLGNBQWMsSUFBSSxHQUFHLENBQUM7SUFDL0IsQ0FBQztJQUtELGtCQUFrQjtRQUNkLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFPRCxVQUFVLENBQUMsYUFBcUIsRUFBRSxJQUFZO1FBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxpQ0FBaUM7UUFFN0IsTUFBTSxhQUFhLEdBQUcsSUFBQSxnQ0FBa0IsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFOUQsSUFBSSxhQUFhLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQy9DLElBQUksQ0FBQyxTQUFTLEdBQUcsYUFBMEIsQ0FBQztTQUMvQztJQUNMLENBQUM7SUFNRCxtQkFBbUIsQ0FBQyxNQUFjO1FBQzlCLE9BQU87WUFDSCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixNQUFNO1lBQ04sT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3JCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztTQUN4QixDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBM0dELHlCQTJHQyJ9