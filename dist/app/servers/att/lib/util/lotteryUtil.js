"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomOfCards = exports.createLotteryUtil = exports.LotteryUtil = void 0;
const attConst_1 = require("../attConst");
const utils_1 = require("../../../../utils");
const GameUtil_1 = require("../../../../utils/GameUtil");
var ControlStatus;
(function (ControlStatus) {
    ControlStatus[ControlStatus["SystemWin"] = 0] = "SystemWin";
    ControlStatus[ControlStatus["PlayerWin"] = 1] = "PlayerWin";
    ControlStatus[ControlStatus["Random"] = 2] = "Random";
})(ControlStatus || (ControlStatus = {}));
class LotteryUtil {
    constructor(gameState, baseBet, limit) {
        this.controlStatus = ControlStatus.Random;
        this.totalBet = 0;
        this.totalWin = 0;
        this.cards = [];
        this.resultList = [];
        this.disCards = [];
        this._cards = [];
        this.gameState = gameState;
        this.baseBet = baseBet;
        this.limit = limit;
        this.totalBet = this.baseBet * this.limit;
    }
    result() {
        if (this.controlStatus === ControlStatus.Random) {
            this.randomLottery();
        }
        else {
            this.controlLottery();
        }
        return {
            totalWin: this.totalWin,
            cards: this.cards,
            multiple: this.multiple,
            card: this.card,
            resultList: this.resultList,
        };
    }
    setCards(cards) {
        this._cards = cards;
        return this;
    }
    setBoCurrentProfit(profit) {
        this.currentProfit = profit;
        return this;
    }
    setDisCardsAndColor(cards, color) {
        this.disCards = cards;
        this.color = color;
        return this;
    }
    setSystemWinOrLoss(systemWin) {
        this.controlStatus = systemWin ? ControlStatus.SystemWin : ControlStatus.PlayerWin;
        return this;
    }
    randomLottery() {
        this.init();
        switch (this.gameState) {
            case attConst_1.GameState.Deal: {
                this.totalBet = this.baseBet;
                this.deal();
                break;
            }
            case attConst_1.GameState.Again:
                this.again();
                break;
            case attConst_1.GameState.Bo:
                this.bo();
                break;
        }
    }
    controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            if (this.gameState === attConst_1.GameState.Bo) {
                if (this.controlStatus === ControlStatus.PlayerWin) {
                    break;
                }
                if (this.multiple === 0) {
                    break;
                }
            }
            if (this.controlStatus === ControlStatus.SystemWin && this.totalWin < this.totalBet) {
                break;
            }
            if (this.controlStatus === ControlStatus.PlayerWin && this.totalWin >= this.totalBet) {
                break;
            }
        }
    }
    init() {
        this.totalWin = 0;
        this.cards = [];
        this.resultList = [];
    }
    deal() {
        const cards = getCards(52);
        for (let i = 0; i < 5; i++) {
            const index = (0, utils_1.random)(0, cards.length - 1);
            const card = cards.splice(index, 1)[0];
            this.cards.push(card);
        }
        this.totalWin = (0, GameUtil_1.getResultByAtt)(this.cards).mul * this.baseBet;
    }
    again() {
        let cards = getCards(53);
        const count = 5 - this._cards.length;
        if (count === 0) {
            const result = (0, GameUtil_1.getResultByAtt)(this._cards);
            const win = this.baseBet * result.mul;
            this.resultList.push({ bupais: [], id: result.id, king: result.king, gain: win, cards: this._cards });
            this.totalWin = win * this.limit;
        }
        else {
            cards = cards.filter(c => !this._cards.includes(c));
            for (let i = 0; i < this.limit; i++) {
                const _cards = cards.slice();
                const personalCards = this._cards.slice();
                const newlyCards = [];
                for (let j = 0; j < count; j++) {
                    const index = (0, utils_1.random)(0, _cards.length - 1);
                    const card = _cards.splice(index, 1)[0];
                    personalCards.push(card);
                    newlyCards.push(card);
                }
                const result = (0, GameUtil_1.getResultByAtt)(personalCards);
                const win = result.mul * this.baseBet;
                this.resultList.push({ bupais: newlyCards, id: result.id, king: result.king, gain: win, cards: personalCards });
                this.totalWin += win;
            }
        }
    }
    bo() {
        let cards = getCards(52);
        cards = cards.filter(c => !this.disCards.includes(c));
        const index = (0, utils_1.random)(0, cards.length - 1);
        this.card = cards[index];
        const color = Math.floor(this.card / 13);
        this.multiple = calculateMul(this.color, color);
        this.totalWin = this.currentProfit * this.multiple;
    }
}
exports.LotteryUtil = LotteryUtil;
function createLotteryUtil(gameState, baseBet, limit) {
    return new LotteryUtil(gameState, baseBet, limit);
}
exports.createLotteryUtil = createLotteryUtil;
function getRandomOfCards(num) {
    const cards = getCards(52);
    const cs = [];
    for (let i = 0; i < num; i++) {
        const index = (0, utils_1.random)(0, cards.length - 1);
        const card = cards.splice(index, 1)[0];
        cs.push(card);
    }
    return cs;
}
exports.getRandomOfCards = getRandomOfCards;
function getCards(num) {
    const cards = [];
    for (let i = 0; i < num; i++) {
        cards.push(i);
    }
    return cards;
}
function calculateMul(selectColor, color) {
    let mul = 0;
    if (selectColor === 11 && color % 2 === 1) {
        mul = 2;
    }
    else if (selectColor === 22 && color % 2 === 0) {
        mul = 2;
    }
    else if (color === selectColor) {
        mul = 4;
    }
    return mul;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hdHQvbGliL3V0aWwvbG90dGVyeVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBQXNDO0FBQ3RDLDZDQUF5QztBQUN6Qyx5REFBMEQ7QUFrQjFELElBQUssYUFJSjtBQUpELFdBQUssYUFBYTtJQUNkLDJEQUFTLENBQUE7SUFDVCwyREFBUyxDQUFBO0lBQ1QscURBQU0sQ0FBQTtBQUNWLENBQUMsRUFKSSxhQUFhLEtBQWIsYUFBYSxRQUlqQjtBQWtCRCxNQUFhLFdBQVc7SUFnQnBCLFlBQVksU0FBb0IsRUFBRSxPQUFlLEVBQUUsS0FBYTtRQVpoRSxrQkFBYSxHQUFtQixhQUFhLENBQUMsTUFBTSxDQUFDO1FBQ3JELGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixVQUFLLEdBQWEsRUFBRSxDQUFDO1FBQ3JCLGVBQVUsR0FBa0YsRUFBRSxDQUFDO1FBQy9GLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFLaEIsV0FBTSxHQUFhLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM5QyxDQUFDO0lBS0QsTUFBTTtRQUNGLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQzdDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN4QjthQUFNO1lBQ0gsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3pCO1FBRUQsT0FBTztZQUNILFFBQVEsRUFB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