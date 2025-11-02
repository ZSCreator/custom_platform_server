"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.lineNumber = 0;
        this.record = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '2', time: 0 };
        this.gameRound = 0;
        this.newer = false;
        this.isBigWin = false;
        this.winPercentage = 0;
        this.gameState = 1;
        this.bonusGameProfit = 0;
        this.characters = genCharacters();
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
    setCharacters(characters) {
        this.characters[this.baseBet.toString()] = characters;
    }
    getAllCharacters() {
        return this.characters;
    }
    getCurrentCharacters() {
        return this.characters[this.baseBet.toString()] || [];
    }
    bet(baseBet, lineNumber) {
        this.baseBet = baseBet;
        this.lineNumber = lineNumber;
        this.totalBet = baseBet * lineNumber;
        this.gold -= this.totalBet;
    }
    isLackGold(baseBet, lineNumber) {
        return this.gold < baseBet * lineNumber;
    }
    initBonusProfit(totalBet) {
        this.bonusGameProfit = totalBet * 5;
    }
    settlement(playerRealWin, gold) {
        this.gold = gold;
        this.profit = playerRealWin;
        this.record.totalBet += this.totalBet;
        this.record.totalWin += playerRealWin;
        this.record.time = Date.now();
        this.gameRound++;
        this.record.recordCount++;
        this.winPercentage = this.record.totalWin / this.record.totalBet;
        if (this.winPercentage > 0.9 || this.record.recordCount > 20) {
            this.record.recordCount = 0;
            this.record.totalWin = 0;
            this.record.totalBet = 0;
        }
    }
    hasCharacter() {
        for (let betNum in this.characters) {
            if (this.characters[betNum].length > 0) {
                return true;
            }
        }
        return false;
    }
    buildLiveRecord(result) {
        return {
            uid: this.uid,
            result,
            gameState: result !== 'w' ? '1' : '2',
            baseBet: this.baseBet,
            lineNumber: this.lineNumber,
        };
    }
}
exports.default = Player;
;
function genCharacters() {
    const character = {};
    constant_1.betNums.map(num => character[num] = []);
    return character;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMveGl5b3VqaS9saWIvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EseUNBQW1DO0FBQ25DLHNGQUErRTtBQWtDL0UsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQWdCakQsWUFBWSxJQUFTLEVBQUUsSUFBb0I7UUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBaEJoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLFdBQU0sR0FBbUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUMsQ0FBQztRQUM1RixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLFVBQUssR0FBWSxLQUFLLENBQUM7UUFDdkIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixjQUFTLEdBQVUsQ0FBQyxDQUFDO1FBQ3JCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLGVBQVUsR0FBOEIsYUFBYSxFQUFFLENBQUM7UUFJNUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUtELElBQUk7UUFDQSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLEtB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