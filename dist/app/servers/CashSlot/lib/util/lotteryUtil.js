"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalInternalControl = exports.crateSlotLottery = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const commonUtil_1 = require("../../../../utils/lottery/commonUtil");
const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= constant_1.default.winLines.length;
exports.isHaveLine = isHaveLine;
class Lottery {
    constructor(newer, roulette) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.jackpotType = null;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.controlState = 1;
        this.freeSpinResult = {};
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
        this.freeSpinResult = { totalWin: 0, group: 0, odds: 0 };
    }
    setBetAndLineNum(bet, lineNum) {
        this.bet = bet;
        this.lineNum = lineNum;
        return this;
    }
    setOpenPoolAward(openPoolAward) {
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
        this.scatterCount = this.getScatterNumber(this.window);
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
    selectWights(column) {
        let weights;
        const group = (0, utils_1.sortProbability_)(constant_1.weightsConfig[column].group);
        weights = (0, utils_1.clone)(constant_1.default.weights[group]);
        this.weights = weights;
        return group;
    }
    generateWindow() {
        const window = [];
        for (let i = 0; i < constant_1.default.column; i++) {
            const group = this.selectWights(i);
            const elementKeys = Object.keys(this.weights);
            const elementSet = elementKeys.map(element => {
                return { key: element, value: this.weights[element][i] };
            });
            const line = [];
            do {
                let element = (0, utils_1.selectElement)(elementSet);
                line.push(element);
                if (line.length == 1 && group == 2) {
                    line.push(-1);
                }
            } while (line.length < constant_1.default.row);
            window.push(line);
        }
        if (Math.random() < 0.3) {
        }
        return window;
    }
    calculateEarnings(window) {
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        let winLines = [], totalWin = 0;
        const elementLine = selectLines[0].map((l, i) => window[i][l - 1]).reverse();
        let transcript = (0, utils_1.clone)(elementLine);
        transcript = transcript.filter(c => c != -1 && c != "bonus");
        let odds = 0;
        if (transcript.length > 0) {
            if (transcript.length == 3) {
                let frist = transcript[0];
                let two = transcript[1];
                let third = transcript[2];
                odds = constant_1.default.award[frist][2] + constant_1.default.award[two][1] + constant_1.default.award[third][0];
            }
            else if (transcript.length == 2) {
                let frist = transcript[0];
                let two = transcript[1];
                odds = constant_1.default.award[frist][1] + constant_1.default.award[two][0];
            }
            else if (transcript.length == 1) {
                let frist = transcript[0];
                odds = constant_1.default.award[frist][0];
            }
            const lineProfit = (0, commonUtil_1.fixNoRound)(this.bet * odds);
            totalWin += lineProfit;
            this.totalMultiple += odds;
            winLines.push({ linkNum: transcript.length, money: lineProfit, type: transcript.toString(), multiple: odds });
        }
        return { winLines, totalWin };
    }
    freeSpinLottery() {
        this.freeSpin = true;
        const group = (0, utils_1.sortProbability_)(constant_1.bonusGame);
        const result = constant_1.bonusGame.find(c => c.group == group);
        this.freeSpinResult = {
            group: result.group,
            odds: result.value,
            totalWin: (0, commonUtil_1.fixNoRound)(result.value * this.bet),
        };
    }
    getScatterNumber(window) {
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        const elementLine = selectLines[0].map((l, i) => window[i][l - 1]);
        let scatterCount = 0;
        scatterCount += elementLine.filter(c => c == "bonus").length;
        return scatterCount;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DYXNoU2xvdC9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FHcUI7QUFDckIsNkNBQW9GO0FBQ3BGLHFFQUFrRTtBQVEzRCxNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksa0JBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQTVFLFFBQUEsVUFBVSxjQUFrRTtBQTZFekYsTUFBYSxPQUFPO0lBc0JoQixZQUFZLEtBQWMsRUFBRSxRQUF5QjtRQWRyRCxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixnQkFBVyxHQUFjLElBQUksQ0FBQztRQUU5QixXQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUM3QixhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBRzVCLG1CQUFjLEdBQW1CLEVBQUUsQ0FBQztRQUdoQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxRQUFR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