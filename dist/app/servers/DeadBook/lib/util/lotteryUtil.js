"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalInternalControl = exports.createBoLottery = exports.crateSlotLottery = exports.BoLotteryUtil = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= constant_1.default.winLines.length;
exports.isHaveLine = isHaveLine;
class Lottery {
    constructor(newer, roulette) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.controlState = 1;
        this.freeSpin = false;
        this.scatterCount = 0;
        this.freeSpinResult = [];
        this.freeSpinSpecialElement = null;
        this.newer = newer;
        this.roulette = roulette;
    }
    init() {
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.scatterCount = 0;
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.freeSpinSpecialElement = null;
    }
    setBetAndLineNum(bet, lineNum) {
        this.bet = bet;
        this.lineNum = lineNum;
        return this;
    }
    setTotalBet(totalBet) {
        this.totalBet = totalBet;
        return this;
    }
    setInternalControl(overallControl, singleControlOne, singleControlTwo) {
        this.overallControl = overallControl;
        this.singleControlOne = singleControlOne;
        this.singleControlTwo = singleControlTwo;
        return this;
    }
    setSystemWinOrLoss(win) {
        this.controlState = win ? 2 : 3;
        return this;
    }
    result() {
        this.selectWights();
        if (this.controlState === 1) {
            this.randomLottery();
        }
        else {
            this.controlLottery();
        }
        return {
            window: this.window,
            winLines: this.winLines,
            totalWin: this.totalWin,
            multiple: this.totalMultiple,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
            scatterCount: this.scatterCount,
            freeSpinSpecialElement: this.freeSpinSpecialElement,
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        this.scatterCount = result.scatterCount;
        if (this.scatterCount >= 3) {
            this.freeSpinLottery();
        }
    }
    controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            if (this.controlState === 2 && this.totalWin <= this.totalBet) {
                break;
            }
            if (this.controlState === 3 && this.totalWin > this.totalBet) {
                break;
            }
        }
    }
    selectWights() {
        let weights;
        const roulette = this.roulette;
        if (this.newer) {
            weights = (0, utils_1.clone)(constant_1.default.weights['1']);
        }
        else {
            weights = (0, utils_1.clone)(constant_1.default.weights[roulette]);
            if (roulette !== '3') {
                if (this.overallControl) {
                    weights.W = weights.W.map(element => element + constant_1.default.overallControlSetting[roulette]);
                }
                if (this.singleControlOne) {
                    weights.W = weights.W.map(element => element + constant_1.default.singleControlSetting[roulette][0]);
                }
                if (this.singleControlTwo) {
                    weights.W = weights.W.map(element => element + constant_1.default.singleControlSetting[roulette][1]);
                }
            }
        }
        this.weights = weights;
    }
    generateWindow() {
        const window = [];
        const elementKeys = Object.keys(this.weights);
        let scatterCount = 0;
        for (let i = 0; i < constant_1.default.column; i++) {
            const elementSet = elementKeys.map(element => {
                if (element === constant_1.default.wild && ((scatterCount === 5) || this.controlState !== 1)) {
                    return { key: element, value: 0 };
                }
                return { key: element, value: this.weights[element][i] };
            });
            const line = [];
            for (let j = 0; j < constant_1.default.row; j++) {
                const element = (0, utils_1.selectElement)(elementSet);
                if (element === constant_1.default.wild)
                    scatterCount++;
                line.push(element);
                if (scatterCount === 5) {
                    for (let es of elementSet) {
                        if (es.key === constant_1.default.wild)
                            es.value = 0;
                    }
                }
            }
            window.push(line);
        }
        return window;
    }
    calculateEarnings(window) {
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        const scatterCount = this.countScatter(window);
        let winLines = [], totalWin = 0;
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            elementLine.forEach((element, index) => {
                if (element === constant_1.default.wild) {
                    elementLine[index] = index === 0 ? elementLine.find(e => e !== constant_1.default.wild) : elementLine[index - 1];
                }
            });
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                const odds = constant_1.default.award[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds;
                totalWin += lineProfit;
                this.totalMultiple += odds;
                const linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });
        if (scatterCount >= 3) {
            totalWin += (constant_1.specialAward[scatterCount] * this.totalBet);
        }
        return { winLines, totalWin, scatterCount };
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine[0];
        let result = { elementType: null, rewardType: 0, linkNum: 0 };
        if (!!this.freeSpinSpecialElement) {
            const len = elementLine.filter(e => e === this.freeSpinSpecialElement).length;
            if (len === 5) {
                result.linkNum = 5;
                result.elementType = this.freeSpinSpecialElement;
                result.rewardType = constant_1.specialElements.includes(this.freeSpinSpecialElement) ? 3 : 2;
            }
            else if (len === 4) {
                result.elementType = firstElement;
                result.linkNum = 4;
                result.rewardType = constant_1.specialElements.includes(firstElement) ? 2 : 1;
            }
            else if (len === 3) {
                result.elementType = firstElement;
                result.rewardType = constant_1.specialElements.includes(firstElement) ? 1 : 0;
                result.linkNum = 3;
            }
            else if (len === 2 && constant_1.specialElements.includes(this.freeSpinSpecialElement)) {
                result.elementType = firstElement;
                result.rewardType = 0;
                result.linkNum = 2;
            }
            if (result.linkNum > 0)
                return result;
        }
        if (firstElement !== elementLine[1]) {
            return result;
        }
        switch (true) {
            case elementLine.every(element => element === firstElement): {
                result.linkNum = 5;
                result.elementType = firstElement;
                result.rewardType = constant_1.specialElements.includes(firstElement) ? 3 : 2;
                break;
            }
            case elementLine.slice(0, 4).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.linkNum = 4;
                result.rewardType = constant_1.specialElements.includes(firstElement) ? 2 : 1;
                break;
            }
            case elementLine.slice(0, 3).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = constant_1.specialElements.includes(firstElement) ? 1 : 0;
                result.linkNum = 3;
                break;
            }
            case (constant_1.specialElements.includes(firstElement) &&
                elementLine.slice(0, 2).every(element => element === firstElement)):
                {
                    result.elementType = firstElement;
                    result.rewardType = 0;
                    result.linkNum = 2;
                    break;
                }
            default:
                break;
        }
        return result;
    }
    chooseSpecialElement() {
        this.freeSpinSpecialElement = constant_1.baseElements[(0, utils_1.random)(0, constant_1.baseElements.length - 1)];
    }
    freeSpinLottery() {
        this.freeSpin = true;
        this.chooseSpecialElement();
        let len = 10;
        while (len > 0) {
            const window = this.generateWindow();
            const lastWindow = this.changeWindow(JSON.parse(JSON.stringify(window)));
            const result = this.calculateEarnings(lastWindow);
            if (result.scatterCount >= 3)
                len += 10;
            this.freeSpinResult.push({
                winLines: result.winLines,
                totalWin: result.totalWin,
                window,
                lastWindow,
                scatterCount: result.scatterCount
            });
            len--;
        }
    }
    changeWindow(window) {
        const num = window.reduce((num, row) => {
            return row.find(e => e === this.freeSpinSpecialElement) ? num + 1 : num;
        }, 0);
        if (num >= 3) {
            return window.map(row => {
                const has = row.find(e => e === this.freeSpinSpecialElement);
                if (has)
                    return row.map(e => this.freeSpinSpecialElement);
                return row;
            });
        }
        return window;
    }
    countScatter(window) {
        let count = 0;
        window.forEach(row => {
            row.forEach(e => {
                if (e === constant_1.default.wild)
                    count++;
            });
        });
        return count;
    }
}
exports.Lottery = Lottery;
function getCards() {
    return [0, 13, 26, 39];
}
var ControlStatus;
(function (ControlStatus) {
    ControlStatus[ControlStatus["SystemWin"] = 0] = "SystemWin";
    ControlStatus[ControlStatus["PlayerWin"] = 1] = "PlayerWin";
    ControlStatus[ControlStatus["Random"] = 2] = "Random";
})(ControlStatus || (ControlStatus = {}));
class BoLotteryUtil {
    constructor(disCards, profit) {
        this.disCards = [];
        this.controlStatus = ControlStatus.Random;
        this.disCards = disCards;
        this.profit = profit;
    }
    init() {
        this.multiple = 0;
        this.totalWin = 0;
    }
    setSystemWinOrLoss(systemWin) {
        this.controlStatus = systemWin ? ControlStatus.SystemWin : ControlStatus.PlayerWin;
        return this;
    }
    setColor(color) {
        this.color = color;
        return this;
    }
    result() {
        if (this.controlStatus === ControlStatus.Random) {
            this.randomLottery();
        }
        else {
            this.controlLottery();
        }
        return {
            card: this.card,
            totalWin: this.totalWin,
            multiple: this.multiple,
        };
    }
    randomLottery() {
        this.init();
        this.bo();
    }
    controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            if (this.controlStatus === ControlStatus.SystemWin && this.totalWin < 0) {
                break;
            }
            if (this.controlStatus === ControlStatus.PlayerWin && this.totalWin >= 0) {
                break;
            }
        }
    }
    bo() {
        let cards = getCards();
        const index = (0, utils_1.random)(0, cards.length - 1);
        this.card = cards[index];
        const color = Math.floor(this.card / 13);
        this.multiple = calculateMul(this.color, color);
        this.totalWin = this.profit * this.multiple;
    }
}
exports.BoLotteryUtil = BoLotteryUtil;
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
function crateSlotLottery(newer, roulette) {
    return new Lottery(newer, roulette);
}
exports.crateSlotLottery = crateSlotLottery;
function createBoLottery(disCards, profit) {
    return new BoLotteryUtil(disCards, profit);
}
exports.createBoLottery = createBoLottery;
function personalInternalControl(recordCount, roulette, winPercentage, overallControl) {
    if (!overallControl && recordCount >= 10) {
        if (roulette === '1') {
            return [false, false];
        }
        const rightValue = roulette === '2' ? 0.45 : 0.25;
        const leftValue = roulette == '2' ? 0.25 : 0.05;
        if (leftValue < winPercentage && winPercentage < rightValue) {
            return [true, false];
        }
        if (winPercentage <= leftValue) {
            return [false, true];
        }
    }
    return [false, false];
}
exports.personalInternalControl = personalInternalControl;
function test() {
    const lottery = crateSlotLottery(false, '1');
    const result = lottery.setBetAndLineNum(1, 10)
        .setInternalControl(false, false, false)
        .result();
    console.log(result);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EZWFkQm9vay9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBbUg7QUFDbkgsNkNBQStEO0FBTXhELE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxrQkFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFBNUUsUUFBQSxVQUFVLGNBQWtFO0FBdUd6RixNQUFhLE9BQU87SUFvQmhCLFlBQVksS0FBYyxFQUFFLFFBQXlCO1FBYnJELGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixXQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUM3QixhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBQzVCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsbUJBQWMsR0FBcUIsRUFBRSxDQUFDO1FBQ3RDLDJCQUFzQixHQUFnQixJQUFJLENBQUM7UUFHdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUVPLElBQUk7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN0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