"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseBetConfig_1 = require("./config/baseBetConfig");
const treasureChest_1 = require("./config/treasureChest");
const utils_1 = require("../../../utils");
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
const gamesScenePointValue_1 = require("../../../../config/data/gamesScenePointValue");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
class Player extends slotMachinePlayer_1.default {
    constructor(opts, room) {
        super(opts);
        this.profit = 0;
        this.totalBet = 0;
        this.multiply = 0;
        this.record = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '3', time: 0 };
        this.gameRound = 0;
        this.newer = false;
        this.isBigWin = false;
        this.winPercentage = 0;
        this.goldCount = genGoldCount();
        this.gameStatus = 1;
        this.treasureChestList = [];
        this.keyCount = 0;
        this.freeSpinCount = 0;
        this.room = room;
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.multiply = 0;
        this.isBigWin = false;
        this.initControlType();
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    freeSpinInit() {
        this.profit = 0;
        this.isBigWin = false;
    }
    isSpinStatus() {
        return this.gameStatus === 1;
    }
    bet(multiplyType) {
        this.multiply = baseBetConfig_1.baseMultiple[multiplyType] * gamesScenePointValue_1.ScenePointValueMap[GameNidEnum_1.GameNidEnum.pirate].pointValue;
        this.totalBet = this.multiply * baseBetConfig_1.baseBetNum;
        this.gold -= this.totalBet;
    }
    isLackGold(multiplyType) {
        return this.gold < baseBetConfig_1.baseMultiple[multiplyType] * baseBetConfig_1.baseBetNum * gamesScenePointValue_1.ScenePointValueMap[GameNidEnum_1.GameNidEnum.pirate].pointValue;
    }
    settlement(playerRealWin, goldCount, gold, isFreeSpin = false) {
        this.goldCount[this.multiply / gamesScenePointValue_1.ScenePointValueMap[GameNidEnum_1.GameNidEnum.pirate].pointValue] += goldCount;
        this.profit = isFreeSpin ? playerRealWin : playerRealWin + this.totalBet;
        this.gold = gold;
        this.profit = Number(this.profit.toFixed(2));
        if (this.goldCount[this.multiply / gamesScenePointValue_1.ScenePointValueMap[GameNidEnum_1.GameNidEnum.pirate].pointValue] >= treasureChest_1.treasureChestNumber) {
            this.gameStatus = 2;
            this.treasureChestList = (0, utils_1.clone)(treasureChest_1.baseTreasureChests).sort((x, y) => Math.random() - 0.5);
            this.keyCount = treasureChest_1.keyNumber;
        }
    }
    treasureChestSettlement() {
        if (this.keyCount === 0) {
            this.gameStatus = 1;
            this.goldCount[this.multiply / gamesScenePointValue_1.ScenePointValueMap[GameNidEnum_1.GameNidEnum.pirate].pointValue] = 0;
        }
    }
    buildLiveRecord(result) {
        return {
            uid: this.uid,
            result,
            gameState: this.gameStatus.toString()
        };
    }
}
exports.default = Player;
function genGoldCount() {
    let goldCount = {};
    for (let key in baseBetConfig_1.baseMultiple) {
        goldCount[baseBetConfig_1.baseMultiple[key]] = 0;
    }
    return goldCount;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcGlyYXRlL2xpYi9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwREFBZ0U7QUFDaEUsMERBQTBHO0FBQzFHLDBDQUFxQztBQUNyQyxzRkFBK0U7QUFDL0UsdUZBQWdGO0FBQ2hGLDJFQUFzRTtBQWtDdEUsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQWtCakQsWUFBWSxJQUFTLEVBQUUsSUFBb0I7UUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBbEJoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixXQUFNLEdBQW1CLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFDLENBQUM7UUFDNUYsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsY0FBUyxHQUE0QixZQUFZLEVBQUUsQ0FBQztRQUNwRCxlQUFVLEdBQVUsQ0FBQyxDQUFDO1FBQ3RCLHNCQUFpQixHQUFxQixFQUFFLENBQUM7UUFDekMsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQU10QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBS0QsSUFBSTtRQUNBLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxRQUFR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