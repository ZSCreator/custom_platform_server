"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalInternalControl = exports.crateSlotLottery = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const ONE_SCATTER_PROBABILITY = 0.1555;
const TWO_SCATTER_PROBABILITY = 0.0242;
const OTHER_SCATTER_PROBABILITY = 0.0018;
const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= constant_1.default.winLines.length;
exports.isHaveLine = isHaveLine;
class Lottery {
    constructor(newer, roulette) {
        this.openPoolAward = false;
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.jackpotType = null;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.controlState = 1;
        this.freeSpin = false;
        this.scatterCount = 0;
        this.freeSpinResult = [];
        this.newer = newer;
        this.roulette = roulette;
    }
    init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.scatterCount = 0;
        this.freeSpin = false;
        this.freeSpinResult = [];
    }
    setBetAndLineNum(bet, lineNum) {
        this.bet = bet;
        this.lineNum = lineNum;
        return this;
    }
    setOpenPoolAward(openPoolAward) {
        this.openPoolAward = openPoolAward;
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
            jackpotWin: this.jackpotWin,
            winLines: this.winLines,
            jackpotType: this.jackpotType,
            totalWin: this.totalWin,
            multiple: this.totalMultiple,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        this.modifyInitialWindow();
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
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
                    weights.W = weights.W.map(element => element += constant_1.default.overallControlSetting[roulette]);
                }
                if (this.singleControlOne) {
                    weights.W = weights.W.map(element => element += constant_1.default.singleControlSetting[roulette][0]);
                }
                if (this.singleControlTwo) {
                    weights.W = weights.W.map(element => element += constant_1.default.singleControlSetting[roulette][1]);
                }
            }
        }
        if (this.openPoolAward) {
            const index = Math.random() < 0.5 ? 3 : 4;
            if (index === 3)
                weights.W[index] = 0;
            constant_1.default.sevenElementGroup.forEach(element => weights[element][index] = 0);
        }
        this.weights = weights;
    }
    generateWindow() {
        const window = [];
        const elementKeys = Object.keys(this.weights);
        for (let i = 0; i < constant_1.default.column; i++) {
            const elementSet = elementKeys.map(element => {
                return { key: element, value: this.weights[element][i] };
            });
            const line = [];
            for (let j = 0; j < constant_1.default.row; j++) {
                line.push((0, utils_1.selectElement)(elementSet));
            }
            window.push(line);
        }
        return window;
    }
    modifyInitialWindow() {
        this.scatterCount = this.getScatterNumber();
        if (this.scatterCount === 0) {
            return;
        }
        let winCoordinates = new Set();
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        selectLines.forEach((line) => {
            const elementLine = line.map((l, i) => this.window[i][l - 1]);
            elementLine.forEach((element, index) => {
                if (element === constant_1.default.wild) {
                    elementLine[index] = elementLine[index - 1];
                }
            });
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                const coordinates = line.slice(0, lineResult.linkNum).map((l, i) => `${i}-${l - 1}`);
                coordinates.forEach(c => winCoordinates.add(c));
            }
        });
        let allCoordinates = [];
        this.window.forEach((column, columnNumber) => {
            column.forEach((element, rowNumber) => allCoordinates.push(`${columnNumber}-${rowNumber}`));
        });
        const lossCoordinates = new Set();
        allCoordinates.forEach(c => !winCoordinates.has(c) && lossCoordinates.add(c));
        if (lossCoordinates.size < this.scatterCount) {
            allCoordinates.slice(allCoordinates.length - 6).forEach(c => lossCoordinates.add(c));
        }
        let alternateCoordinates = [...lossCoordinates];
        for (let i = 0; i < this.scatterCount; i++) {
            const coordinate = alternateCoordinates[(0, utils_1.random)(0, alternateCoordinates.length - 1)];
            const realCoordinate = coordinate.split('-').map(p => Number(p));
            this.window[realCoordinate[0]][realCoordinate[1]] = constant_1.default.scatter;
            alternateCoordinates = alternateCoordinates.filter(c => c !== coordinate);
        }
    }
    calculateEarnings(window) {
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        let winLines = [], totalWin = 0;
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            elementLine.forEach((element, index) => {
                if (element === constant_1.default.wild) {
                    elementLine[index] = elementLine[index - 1];
                }
            });
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                const odds = constant_1.default.award[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds;
                totalWin += lineProfit;
                if ((lineResult.elementType === constant_1.default.anySeven
                    || constant_1.default.sevenElementGroup.includes(lineResult.elementType))
                    && lineResult.rewardType === 2) {
                    this.jackpotWin += lineProfit;
                }
                this.totalMultiple += odds;
                const linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });
        return { winLines, totalWin };
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine[0], belongSpecial = constant_1.default.sevenElementGroup.includes(firstElement) ? constant_1.default.anySeven
            : constant_1.default.barElementGroup.includes(firstElement) ? constant_1.default.anyBar : null;
        let result = { elementType: null, rewardType: 0, linkNum: 0, prizeType: 'none' };
        if (firstElement === constant_1.default.scatter) {
            return result;
        }
        if (!!belongSpecial) {
            if (belongSpecial === constant_1.default.anySeven ? !(constant_1.default.sevenElementGroup.includes(elementLine[1]))
                : !(constant_1.default.barElementGroup.includes(elementLine[1]))) {
                return result;
            }
        }
        else {
            if (firstElement !== elementLine[1]) {
                return result;
            }
        }
        switch (true) {
            case elementLine.every(element => element === firstElement): {
                result.linkNum = 5;
                result.elementType = firstElement;
                result.rewardType = 2;
                if (belongSpecial === constant_1.default.anySeven) {
                    result.prizeType = firstElement === constant_1.default.oneSeven ? 'mega'
                        : firstElement === constant_1.default.twoSeven ? 'monster' : 'colossal';
                }
                break;
            }
            case (!!belongSpecial && elementLine.every(element => {
                return belongSpecial === constant_1.default.anySeven ? constant_1.default.sevenElementGroup.includes(element)
                    : constant_1.default.barElementGroup.includes(element);
            })):
                {
                    result.elementType = belongSpecial;
                    result.rewardType = 2;
                    result.linkNum = 5;
                    if (belongSpecial === constant_1.default.anySeven) {
                        result.prizeType = 'mini';
                    }
                    break;
                }
            case elementLine.slice(0, 4).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = 1;
                result.linkNum = 4;
                break;
            }
            case elementLine.slice(0, 4).every(element => {
                return belongSpecial === constant_1.default.anySeven ? constant_1.default.sevenElementGroup.includes(element)
                    : constant_1.default.barElementGroup.includes(element);
            }):
                {
                    result.elementType = belongSpecial;
                    result.rewardType = 1;
                    result.linkNum = 4;
                    break;
                }
            case elementLine.slice(0, 3).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = 0;
                result.linkNum = 3;
                break;
            }
            case elementLine.slice(0, 3).every(element => {
                return belongSpecial === constant_1.default.anySeven ? constant_1.default.sevenElementGroup.includes(element)
                    : constant_1.default.barElementGroup.includes(element);
            }):
                {
                    result.elementType = belongSpecial;
                    result.rewardType = 0;
                    result.linkNum = 3;
                    break;
                }
            default:
                break;
        }
        return result;
    }
    freeSpinLottery() {
        this.freeSpin = true;
        let len = constant_1.default.freeSpinMapping[this.scatterCount];
        for (let i = 0; i < len; i++) {
            const window = this.generateWindow();
            const result = this.calculateEarnings(window);
            this.freeSpinResult.push({ winLines: result.winLines, totalWin: result.totalWin, window });
        }
    }
    getScatterNumber() {
        if (this.controlState !== 1) {
            return [0, 1, 2][(0, utils_1.random)(0, 2)];
        }
        let randomNumber = Math.random();
        if (randomNumber < OTHER_SCATTER_PROBABILITY) {
            randomNumber = Math.random();
            if (randomNumber < 1 / 7) {
                return 5;
            }
            if (randomNumber < 2 / 7) {
                return 4;
            }
            return 3;
        }
        if (randomNumber < TWO_SCATTER_PROBABILITY) {
            return 2;
        }
        if (randomNumber < ONE_SCATTER_PROBABILITY) {
            return 1;
        }
        return 0;
    }
}
exports.Lottery = Lottery;
function crateSlotLottery(newer, roulette) {
    return new Lottery(newer, roulette);
}
exports.crateSlotLottery = crateSlotLottery;
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
    const result = lottery.setBetAndLineNum(1, 3)
        .setTotalBet(3)
        .setInternalControl(false, false, false)
        .result();
    console.log(result);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9zbG90czc3Ny9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBc0U7QUFDdEUsNkNBQStEO0FBRy9ELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDO0FBRXZDLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDO0FBRXZDLE1BQU0seUJBQXlCLEdBQUcsTUFBTSxDQUFDO0FBTWxDLE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxrQkFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFBNUUsUUFBQSxVQUFVLGNBQWtFO0FBMEZ6RixNQUFhLE9BQU87SUFzQmhCLFlBQVksS0FBYyxFQUFFLFFBQXlCO1FBaEJyRCxrQkFBYSxHQUFZLEtBQUssQ0FBQztRQUUvQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixnQkFBVyxHQUFjLElBQUksQ0FBQztRQUU5QixXQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUM3QixhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBQzVCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsbUJBQWMsR0FBcUIsRUFBRSxDQUFDO1FBR2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFTyxJQUFJO1FBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENB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