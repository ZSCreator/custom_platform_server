"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalInternalControl = exports.crateSlotLottery = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
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
        this.HasWild = this.getWildNumber(this.window);
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        if (this.HasWild && this.totalWin == 0) {
            this.freeSpinLottery();
        }
    }
    controlLottery() {
        for (let i = 0; i < 200; i++) {
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
        }
        if (this.openPoolAward) {
            const index = Math.random() < 0.5 ? 3 : 4;
            if (index === 3)
                weights.W[index] = 0;
        }
        this.weights = weights;
    }
    getWildNumber(window) {
        for (const line of window) {
            if (line.every(c => c == "W")) {
                return true;
            }
        }
        return false;
    }
    generateWindow(twoStrategy = false) {
        let window = [];
        const elementKeys = Object.keys(this.weights);
        for (let i = 0; i < constant_1.default.column; i++) {
            const elementSet = elementKeys.map(element => {
                return { key: element, value: this.weights[element][i] };
            });
            let HNum = 0;
            let line = [];
            do {
                let element = (0, utils_1.selectElement)(elementSet);
                if (twoStrategy && element == "H") {
                    continue;
                }
                line.push(element);
                if (element == "H") {
                    HNum++;
                }
                if (element == "H" && HNum >= 9) {
                    continue;
                }
            } while (line.length < constant_1.default.row);
            if (line.every(c => c == "H")) {
                line = ["W", "W", "W"];
            }
            window.push(line);
        }
        if (twoStrategy && Math.random() < 0.3) {
            let r = Math.random();
            if (r < 0.3) {
                window = [
                    ["H", "W", "W"],
                    ["H", "W", "W"],
                    ["H", "W", "W"],
                ];
            }
            else if (r < 0.6) {
                window = [
                    ["G", "W", "W"],
                    ["G", "W", "W"],
                    ["G", "W", "W"],
                ];
            }
            else {
                window = [
                    ["G", "H", "W"],
                    ["G", "H", "W"],
                    ["G", "H", "W"],
                ];
            }
        }
        return window;
    }
    calculateEarnings(window) {
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        let winLines = [], totalWin = 0;
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                const odds = constant_1.default.award[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds;
                totalWin += lineProfit;
                this.totalMultiple += odds;
                let linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });
        return { winLines, totalWin };
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine.find(c => c != "W");
        let result = { elementType: null, rewardType: 0, linkNum: 0, prizeType: 'none' };
        switch (true) {
            case elementLine.slice(0, 3).every(element => element == firstElement || element == "W"): {
                result.elementType = firstElement;
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
        do {
            let window = this.generateWindow(true);
            for (let idx = 0; idx < this.window.length; idx++) {
                const line = this.window[idx];
                if (line.every(c => c == "W")) {
                    window[idx] = this.window[idx];
                }
            }
            let result = this.calculateEarnings(window);
            this.freeSpinResult.push({ winLines: result.winLines, totalWin: result.totalWin, window });
            if (result.totalWin > 0) {
                break;
            }
        } while (true);
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
    const result = lottery.setBetAndLineNum(3, 5)
        .setTotalBet(3)
        .setInternalControl(false, false, false)
        .result();
    console.log(JSON.stringify(result));
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9UcmlwbGVQYW5kYS9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBd0U7QUFDeEUsNkNBQWlFO0FBUTFELE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxrQkFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFBNUUsUUFBQSxVQUFVLGNBQWtFO0FBMEZ6RixNQUFhLE9BQU87SUF1QmhCLFlBQVksS0FBYyxFQUFFLFFBQXlCO1FBakJyRCxrQkFBYSxHQUFZLEtBQUssQ0FBQztRQUUvQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixnQkFBVyxHQUFjLElBQUksQ0FBQztRQUU5QixXQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUM3QixhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBRzVCLG1CQUFjLEdBQXFCLEVBQUUsQ0FBQztRQUlsQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FB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