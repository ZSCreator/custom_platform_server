"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalInternalControl = exports.crateSlotLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const utils = require("../../../../utils");
const award_1 = require("../config/award");
const commonUtil_1 = require("../../../../utils/lottery/commonUtil");
class Lottery {
    constructor(newer, roulette) {
        this.openPoolAward = false;
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.jackpotType = null;
        this.window = [];
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
        this.winLines = null;
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
        try {
            this.init();
            this.window = this.generateWindow();
            const HasFree = this.get5BNumber(this.window);
            const result = this.calculateEarnings(this.window);
            this.winLines = result.winLines;
            this.totalWin += result.totalWin;
            if (HasFree) {
                this.freeSpinLottery();
            }
        }
        catch (err) {
            console.warn(err);
        }
    }
    controlLottery() {
        for (let i = 0; i < 200; i++) {
            this.randomLottery();
            if (this.controlState === 2 && this.freeSpinResult.reduce((sum, value) => sum + value.totalWin, this.totalWin) <= this.totalBet) {
                break;
            }
            if (this.controlState === 3 && this.freeSpinResult.reduce((sum, value) => sum + value.totalWin, this.totalWin) > this.totalBet) {
                break;
            }
        }
    }
    selectWights() {
        let weights;
        const roulette = this.roulette;
        weights = (0, utils_1.clone)(constant_1.default.weights['1']);
        if (this.openPoolAward) {
            const index = Math.random() < 0.5 ? 3 : 4;
            if (index === 3)
                weights.W[index] = 0;
        }
        this.weights = weights;
    }
    get5BNumber(window) {
        const length = window.filter(c => c.e == "H").length;
        return length >= 5 || false;
    }
    generateWindow(twoStrategy = false) {
        let window = [];
        const elementKeys = Object.keys(this.weights);
        const elementSet = elementKeys.map(element => {
            return { key: element, value: this.weights[element][0] };
        });
        do {
            let element = (0, utils_1.selectElement)(elementSet);
            if (twoStrategy && element == "W") {
                continue;
            }
            let opt = { e: element, p: 0, value: 0 };
            if (element == "H") {
                opt.p = constant_1.Points[utils.random(0, constant_1.Points.length - 1)];
            }
            window.push(opt);
        } while (window.length < 9);
        let r = Math.random();
        if (r <= 0.8) {
            window[4] = { e: "W", p: 0, value: 0 };
        }
        return window;
    }
    calculateEarnings(window) {
        let winLines;
        let totalWin = 0;
        for (let idx = 0; idx < window.length; idx++) {
            const element = window[idx].e;
            if (idx == 5) {
                continue;
            }
            const length = window.filter(c => c.e == element || (c.e == "W" && element != "H")).length;
            if (length >= 5) {
                if (element == "H") {
                    winLines = { linkNum: length, type: element, multiple: 0, money: 0 };
                }
                else {
                    const multiple = award_1.award[element][length - 5];
                    const money = (0, commonUtil_1.fixNoRound)(this.totalBet * multiple);
                    winLines = { linkNum: length, type: element, multiple, money };
                    totalWin = money;
                }
                break;
            }
        }
        return { winLines, totalWin };
    }
    freeSpinLottery() {
        this.freeSpin = true;
        let Num = 3;
        for (const el of this.window) {
            el.value = el.p / 50 * this.totalBet;
            this.totalWin += el.value;
        }
        let oldWindow = utils.clone(this.window);
        do {
            Num--;
            let window = this.generateWindow(true);
            let result = this.calculateEarnings(window);
            for (let x = 0; x < window.length; x++) {
                const ex = window[x];
                oldWindow[x].e = ex.e;
                oldWindow[x].p = ex.p;
                delete oldWindow[x]["New"];
                if (ex.e == "H") {
                    if (oldWindow[x].value == 0) {
                        oldWindow[x]["New"] = 1;
                        Num = 3;
                    }
                    oldWindow[x].value += ex.p / 50 * this.totalBet;
                    result.totalWin += ex.p / 50 * this.totalBet;
                }
            }
            this.freeSpinResult.push({ winLines: result.winLines, totalWin: result.totalWin, window: utils.clone(oldWindow) });
            if (Num == 0) {
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
        .setSystemWinOrLoss(false)
        .result();
    console.log(JSON.stringify(result));
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jYWlzaGVuL2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQUFnRjtBQUNoRiw2Q0FBaUU7QUFDakUsMkNBQTJDO0FBQzNDLDJDQUF3QztBQUN4QyxxRUFBa0U7QUE0RmxFLE1BQWEsT0FBTztJQXdCaEIsWUFBWSxLQUFjLEVBQUUsUUFBeUI7UUFsQnJELGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBRS9CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLGdCQUFXLEdBQWMsSUFBSSxDQUFDO1FBRTlCLFdBQU0sR0FBaUUsRUFBRSxDQUFDO1FBRTFFLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBRzVCLG1CQUFjLEdBQXFCLEVBQUUsQ0FBQztRQUtsQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFPRCxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZTtRQUN6QyxJ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