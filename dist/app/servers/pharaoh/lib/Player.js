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
        this.gameState = 1;
        this.bonusGameProfit = 0;
        this.detonatorCount = 0;
        this.gameLevel = 1;
        this.littleGameAccumulate = 0;
        this.currentPosition = 0;
        this.throwNum = 5;
        this.littleGameWin = 0;
        this.littleGameLevel = 1;
        this.historyPosition = [];
        this.littleGameGainDetail = { gold: 0, silver: 0, copper: 0 };
        this.throwCount = 0;
        this.currentAwardType = '';
        this.customsClearance = false;
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
    initPlayerLittleGame() {
        this.currentPosition = 0;
        this.throwNum = 5;
        this.littleGameWin = 0;
        this.littleGameLevel = this.gameLevel;
        this.historyPosition = [];
        this.littleGameGainDetail = { gold: 0, silver: 0, copper: 0 };
        this.throwCount = 0;
        this.currentAwardType = '';
        this.customsClearance = false;
    }
    bet(baseBet, betOdds) {
        this.baseBet = baseBet;
        this.betOdds = betOdds;
        this.totalBet = baseBet * betOdds;
        this.gold -= this.totalBet;
        this.littleGameAccumulate += this.totalBet * 0.13;
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
    isSpinState() {
        return this.gameState === 1;
    }
    isLittleGameState() {
        return this.gameState === 2;
    }
    setSpinState() {
        this.gameState = 1;
        this.littleGameAccumulate = 0;
    }
    setLittleGameState() {
        this.gameState = 2;
    }
    initBonusProfit(totalBet) {
        this.bonusGameProfit = totalBet * 5;
    }
    settlement(playerRealWin, gold) {
        this.gold = gold;
        this.profit = playerRealWin;
    }
    littleGameSettlement(playerRealWin, gold) {
        this.gold = gold;
        this.littleGameWin = playerRealWin;
    }
    updateGameLevelAndPlayerGameState() {
        const nextGameLevel = (0, lotteryUtil_1.calculateGameLevel)(this.detonatorCount);
        if (nextGameLevel !== this.gameLevel) {
            this.initPlayerLittleGame();
            this.setLittleGameState();
            this.setRoundId(this.room.getRoundId(this.uid));
            this.gameLevel = nextGameLevel;
        }
    }
    buildLittleGameLiveResult(result) {
        return {
            uid: this.uid,
            result,
            gameState: this.gameState.toString()
        };
    }
    buildGameLiveResult(result) {
        return {
            uid: this.uid,
            result,
            gameState: this.gameState.toString(),
            baseBet: this.baseBet,
            betOdds: this.betOdds,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcGhhcmFvaC9saWIvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esb0RBQXNEO0FBQ3RELHNGQUErRTtBQTZCL0UsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQXdCakQsWUFBWSxJQUFTLEVBQUUsSUFBb0I7UUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBeEJoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFVBQUssR0FBWSxLQUFLLENBQUM7UUFDdkIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUNsQixjQUFTLEdBQVUsQ0FBQyxDQUFDO1FBQzdCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBQzVCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBQzNCLGNBQVMsR0FBYyxDQUFDLENBQUM7UUFDekIseUJBQW9CLEdBQVcsQ0FBQyxDQUFDO1FBQ2pDLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBQzVCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsb0JBQWUsR0FBYyxDQUFDLENBQUM7UUFDL0Isb0JBQWUsR0FBYSxFQUFFLENBQUM7UUFDL0IseUJBQW9CLEdBQWUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDO1FBQ25FLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFDdkIscUJBQWdCLEdBQVcsRUFBRSxDQUFDO1FBQzlCLHFCQUFnQixHQUFZLEtBQUssQ0FBQztRQUs5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBS0QsSUFB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