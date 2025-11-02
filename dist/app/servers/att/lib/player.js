"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attConst_1 = require("./attConst");
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
const GAMBLE_MAX = 5;
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.roundCount = 0;
        this.roundRecords = [];
        this.gameState = attConst_1.GameState.Init;
        this.gambleCount = 0;
        this.foldCards = [];
        this.cards = [];
        this.retainCards = [];
        this.cardsList = [];
        this.boRecords = [];
        this.room = room;
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.roundCount = 0;
        this.cards = [];
        this.roundRecords = [];
        this.gameState = attConst_1.GameState.Init;
        this.gambleCount = GAMBLE_MAX;
        this.foldCards = [];
        this.retainCards = [];
        this.cardsList = [];
        this.boRecords = [];
        this.initControlType();
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    setProfit(profit) {
        this.profit = profit;
    }
    gambleCountMinusOne() {
        this.gambleCount--;
    }
    setAgainState() {
        this.gameState = attConst_1.GameState.Again;
    }
    conversionRetainCards(retainIndexList) {
        this.retainCards = this.cards.filter((m, i) => retainIndexList.indexOf(i) !== -1);
    }
    bet(baseBet, roundCount) {
        this.baseBet = baseBet;
        this.roundCount = roundCount;
        this.totalBet = baseBet * roundCount;
        this.gold -= this.totalBet;
    }
    isLackGold(baseBet, roundCount) {
        return this.gold < baseBet * roundCount;
    }
    settlement(playerRealWin, gold) {
        this.gold = gold;
        this.profit = playerRealWin;
    }
    buildLiveRecord(record) {
        return {
            uid: this.uid,
            result: record
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYXR0L2xpYi9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5Q0FBcUM7QUFDckMsc0ZBQStFO0FBRS9FLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQztBQWdCckIsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQWdCakQsWUFBWSxJQUFTLEVBQUUsSUFBb0I7UUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBaEJoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLGlCQUFZLEdBQVUsRUFBRSxDQUFDO1FBQ3pCLGNBQVMsR0FBYyxvQkFBUyxDQUFDLElBQUksQ0FBQztRQUN0QyxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixjQUFTLEdBQWEsRUFBRSxDQUFDO1FBQ3pCLFVBQUssR0FBYSxFQUFFLENBQUM7UUFHckIsZ0JBQVcsR0FBYSxFQUFFLENBQUM7UUFDM0IsY0FBUyxHQUFrRixFQUFFLENBQUM7UUFDOUYsY0FBUyxHQUFzRSxFQUFFLENBQUM7UUFJOUUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUtELElBQUk7UUFDQSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLG9CQUFTLENBQUMsSUFBSSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBTUQsVUFBVSxDQUFDLE9BQWU7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQU1ELFNBQVMsQ0FBQyxNQUFjO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFLRCxtQkFBbUI7UUFDZixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUtELGFBQWE7UUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLG9CQUFTLENBQUMsS0FBSyxDQUFDO0lBQ3JDLENBQUM7SUFNRCxxQkFBcUIsQ0FBQyxlQUF5QjtRQUMzQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFRRCxHQUFHLENBQUMsT0FBZSxFQUFFLFVBQWtCO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxHQUFHLFVBQVUsQ0FBQztRQUdyQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDL0IsQ0FBQztJQUtELFVBQVUsQ0FBQyxPQUFlLEVBQUUsVUFBa0I7UUFDMUMsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxVQUFVLENBQUM7SUFDNUMsQ0FBQztJQUtELFVBQVUsQ0FBQyxhQUFxQixFQUFFLElBQVk7UUFDMUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7SUFDaEMsQ0FBQztJQUVELGVBQWUsQ0FBQyxNQUFjO1FBQzFCLE9BQU87WUFDSCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBbEhELHlCQWtIQyJ9