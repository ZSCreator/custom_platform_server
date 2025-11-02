"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crateSlotLottery = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const winLines_1 = require("../config/winLines");
const award_1 = require("../config/award");
const weights_1 = require("../config/weights");
const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= (0, winLines_1.default)().length;
exports.isHaveLine = isHaveLine;
var ControlStatus;
(function (ControlStatus) {
    ControlStatus[ControlStatus["SystemWin"] = 0] = "SystemWin";
    ControlStatus[ControlStatus["PlayerWin"] = 1] = "PlayerWin";
    ControlStatus[ControlStatus["Random"] = 2] = "Random";
})(ControlStatus || (ControlStatus = {}));
class Lottery {
    constructor(newer, roulette) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.window = [];
        this.lastWindow = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.controlState = ControlStatus.Random;
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.freeSpinCount = 0;
        this.rowWildsCount = {};
        this.freeSpinTimesList = [];
        this.trigger = false;
        this.newer = newer;
        this.roulette = roulette;
    }
    init() {
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.rowWildsCount = {};
        this.freeSpinCount = 0;
        this.lastWindow = [];
        this.freeSpinTimesList = [];
        this.trigger = false;
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
    setSystemWinOrLoss(win) {
        this.controlState = win ? ControlStatus.SystemWin : ControlStatus.PlayerWin;
        return this;
    }
    result() {
        this.selectWights();
        if (this.controlState === ControlStatus.Random) {
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
            lastWindow: this.lastWindow,
            freeSpinTimesList: this.freeSpinTimesList,
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        const freeSpinCount = this.calculateFreeSpinCount(this.window);
        this.lastWindow = this.changeWindow(this.window);
        const result = this.calculateEarnings(this.lastWindow);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        this.freeSpinTimesList.push(freeSpinCount);
        if (freeSpinCount > 0) {
            this.freeSpinLottery(freeSpinCount);
        }
    }
    controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            if (this.controlState === ControlStatus.SystemWin && this.totalWin <= this.totalBet) {
                break;
            }
            if (this.controlState === ControlStatus.PlayerWin && this.totalWin > this.totalBet) {
                break;
            }
        }
    }
    selectWights() {
        let weights;
        const roulette = this.roulette;
        if (this.newer) {
            weights = (0, utils_1.clone)(weights_1.default['1']);
        }
        else {
            weights = (0, utils_1.clone)(weights_1.default[roulette]);
        }
        this.weights = weights;
    }
    generateWindow() {
        const window = [];
        const elementKeys = Object.keys(this.weights);
        for (let i = 0; i < constant_1.COLUMN_NUM; i++) {
            const elementSet = elementKeys.map(element => {
                if (element === constant_1.ElementEnum.WILD && this.controlState !== ControlStatus.Random) {
                    return { key: element, value: 0 };
                }
                return { key: element, value: this.weights[element][i] };
            });
            const line = [];
            const keys = Object.keys(this.rowWildsCount);
            if (keys.includes(i.toString())) {
                line.push(constant_1.ElementEnum.WILD, constant_1.ElementEnum.WILD, constant_1.ElementEnum.WILD);
            }
            else {
                for (let j = 0; j < constant_1.ROW_NUM; j++) {
                    const element = (0, utils_1.selectElement)(elementSet);
                    line.push(element);
                }
            }
            window.push(line);
        }
        return window;
    }
    calculateEarnings(window) {
        const selectLines = (0, winLines_1.default)().slice(0, this.lineNum);
        let winLines = [], totalWin = 0;
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            elementLine.forEach((element, index) => {
                if (element === constant_1.ElementEnum.WILD) {
                    elementLine[index] = index === 0 ? elementLine.find(e => e !== constant_1.ElementEnum.WILD) : elementLine[index - 1];
                }
            });
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                const odds = award_1.default[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds;
                totalWin += lineProfit;
                this.totalMultiple += odds;
                const linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({
                    index, linkNum: lineResult.linkNum, linkIds, money: lineProfit,
                    type: lineResult.elementType, multiple: odds
                });
            }
        });
        return { winLines, totalWin };
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine[0];
        let result = { elementType: null, rewardType: 0, linkNum: 0 };
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
    freeSpinLottery(len) {
        this.freeSpin = true;
        while (len > 0) {
            const window = this.generateWindow();
            len = this.calculateFreeSpinCount(window, len);
            const lastWindow = this.changeWindow(window);
            const result = this.calculateEarnings(lastWindow);
            this.freeSpinResult.push({
                winLines: result.winLines,
                totalWin: result.totalWin,
                window,
                lastWindow,
            });
            len--;
            this.freeSpinTimesList.push(len);
        }
    }
    changeWindow(window) {
        return window.map((row, index) => {
            if (!!this.rowWildsCount[index]) {
                this.rowWildsCount[index]--;
                if (this.rowWildsCount[index] === 0)
                    Reflect.deleteProperty(this.rowWildsCount, index.toString());
                return [constant_1.ElementEnum.WILD, constant_1.ElementEnum.WILD, constant_1.ElementEnum.WILD];
            }
            return row;
        });
    }
    calculateFreeSpinCount(window, len = 0) {
        const indexList = [];
        window.filter((row, index) => {
            if (row.includes(constant_1.ElementEnum.WILD))
                indexList.push(index);
        });
        const keys = Object.keys(this.rowWildsCount);
        keys.forEach(k => {
            let _k = parseInt(k);
            const index = indexList.findIndex(i => i === _k);
            if (index !== -1)
                indexList.splice(index, 1);
        });
        if (this.trigger) {
            if (indexList.length === 0)
                return len;
            indexList.forEach(i => {
                this.rowWildsCount[i] = 2;
                len++;
            });
            for (let i in this.rowWildsCount) {
                this.rowWildsCount[i] = 2;
            }
            return len;
        }
        let trigger = indexList.length >= 2 || (keys.length === 1 && indexList.length > 0);
        if (trigger) {
            this.trigger = true;
            len += 5;
            indexList.forEach(i => this.rowWildsCount[i] = 2);
            for (let i in this.rowWildsCount) {
                this.rowWildsCount[i] = 2;
            }
        }
        else {
            indexList.forEach(i => {
                this.rowWildsCount[i] = 2;
                len++;
            });
            for (let i in this.rowWildsCount) {
                this.rowWildsCount[i] = 2;
            }
        }
        return len;
    }
}
exports.Lottery = Lottery;
function crateSlotLottery(newer, roulette) {
    return new Lottery(newer, roulette);
}
exports.crateSlotLottery = crateSlotLottery;
function test() {
    const lottery = crateSlotLottery(false, '1');
    const result = lottery.setBetAndLineNum(0.1, 10)
        .setTotalBet(1)
        .result();
    if (result.window.every(row => row.every(e => e === constant_1.ElementEnum.SEVEN))) {
        console.warn('333333333333');
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Sb3RhdGVQYXJ0eS9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBOEU7QUFDOUUsNkNBQXVEO0FBQ3ZELGlEQUE2QztBQUM3QywyQ0FBMEM7QUFDMUMsK0NBQThDO0FBTXZDLE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxJQUFBLGtCQUFXLEdBQUUsQ0FBQyxNQUFNLENBQUM7QUFBMUUsUUFBQSxVQUFVLGNBQWdFO0FBS3ZGLElBQUssYUFJSjtBQUpELFdBQUssYUFBYTtJQUNkLDJEQUFTLENBQUE7SUFDVCwyREFBUyxDQUFBO0lBQ1QscURBQU0sQ0FBQTtBQUNWLENBQUMsRUFKSSxhQUFhLEtBQWIsYUFBYSxRQUlqQjtBQW9HRCxNQUFhLE9BQU87SUFvQmhCLFlBQVksS0FBYyxFQUFFLFFBQXlCO1FBaEJyRCxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsV0FBTSxHQUFvQixFQUFFLENBQUM7UUFDN0IsZUFBVSxHQUFvQixFQUFFLENBQUM7UUFDakMsYUFBUSxHQUFjLEVBQUUsQ0FBQztRQUN6QixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixpQkFBWSxHQUFrQixhQUFhLENBQUMsTUFBTSxDQUFDO1FBQ25ELGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsbUJBQWMsR0FBcUIsRUFBRSxDQUFDO1FBQ3RDLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGtCQUFhLEdBQThCLEVBQUUsQ0FBQztRQUM5QyxzQkFBaUIsR0FBYSxFQUFFLENBQUM7UUFDakMsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUdyQixJQUFJLENBQUMsS0FBSyxHQUFHLEtB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