"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBoLottery = exports.crateSlotLottery = exports.removeOneElement = exports.BoLotteryUtil = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const winLines_1 = require("../config/winLines");
const weights_1 = require("../config/weights");
const award_1 = require("../config/award");
var ControlStatus;
(function (ControlStatus) {
    ControlStatus[ControlStatus["SystemWin"] = 0] = "SystemWin";
    ControlStatus[ControlStatus["PlayerWin"] = 1] = "PlayerWin";
    ControlStatus[ControlStatus["Random"] = 2] = "Random";
})(ControlStatus || (ControlStatus = {}));
const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= (0, winLines_1.default)().length;
exports.isHaveLine = isHaveLine;
class Lottery {
    constructor(newer, roulette) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.controlState = ControlStatus.Random;
        this.freeSpin = false;
        this.newer = newer;
        this.roulette = roulette;
    }
    init() {
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.freeSpin = false;
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
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        this.freeSpin = this.countScatter(this.window) >= 3;
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
                if (this.controlState !== ControlStatus.Random &&
                    (constant_1.anyList.includes(element) || element === constant_1.ElementEnum.SAMBA)) {
                    return { key: element, value: 0 };
                }
                return { key: element, value: this.weights[element][i] };
            });
            const line = [];
            while (line.length < constant_1.ROW_NUM) {
                const element = (0, utils_1.selectElement)(elementSet);
                if (element === constant_1.ElementEnum.SAMBA && line.includes(constant_1.ElementEnum.SAMBA))
                    continue;
                line.push(element);
                if (constant_1.anyList.includes(element)) {
                    for (let es of elementSet) {
                        if (constant_1.anyList.includes(element))
                            es.value = 0;
                    }
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
            const lines = [];
            const anyElement = elementLine.find(e => constant_1.anyList.includes(e));
            if (!!anyElement) {
                const one = (0, utils_1.clone)(elementLine);
                const two = (0, utils_1.clone)(elementLine);
                one[2] = one[1];
                two[2] = two[3];
                lines.push(one, two);
            }
            else {
                lines.push(transcript);
            }
            const linesResult = lines.map(line => this.calculateLineResult(line));
            linesResult.sort((x, y) => {
                let one = !!x.elementType ? award_1.default[x.elementType][x.rewardType] : 0;
                let two = !!y.elementType ? award_1.default[y.elementType][y.rewardType] : 0;
                return two - one;
            });
            const lineResult = linesResult[0];
            if (lineResult.elementType) {
                const odds = award_1.default[lineResult.elementType][lineResult.rewardType];
                const attach = !!anyElement ? constant_1.anyOddsMap[anyElement] : 1;
                const lineProfit = this.bet * odds * attach;
                totalWin += lineProfit;
                this.totalMultiple += odds;
                const _index = transcript.findIndex(element => constant_1.anyList.includes(element) || element === lineResult.elementType);
                const linkIds = transcript.slice(_index, _index + lineResult.linkNum);
                winLines.push({
                    index,
                    linkNum: lineResult.linkNum,
                    linkIds,
                    money: lineProfit,
                    type: lineResult.elementType,
                    multiple: odds
                });
            }
        });
        return { winLines, totalWin };
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine[0];
        let result = { elementType: null, rewardType: 0, linkNum: 0 };
        if (elementLine.every(element => element === firstElement)) {
            result.linkNum = 5;
            result.elementType = firstElement;
            result.rewardType = 2;
            return result;
        }
        let element = this.getsStraightForNum(elementLine, 4);
        if (!!element) {
            result.elementType = element;
            result.linkNum = 4;
            result.rewardType = 1;
            return result;
        }
        element = this.getsStraightForNum(elementLine, 3);
        if (!!element) {
            result.elementType = element;
            result.rewardType = 0;
            result.linkNum = 3;
            return result;
        }
        return result;
    }
    getsStraightForNum(line, num) {
        if (num === 4) {
            let str = line.slice(0, 4);
            if (str.every(s => s === str[0]))
                return str[0];
            str = line.slice(1, 5);
            return (str.every(s => s === str[0])) ? str[0] : null;
        }
        let str = line.slice(0, 3);
        if (str.every(s => s === str[0]))
            return str[0];
        str = line.slice(1, 4);
        if (str.every(s => s === str[0]))
            return str[0];
        str = line.slice(2, 5);
        return (str.every(s => s === str[0])) ? str[0] : null;
    }
    countScatter(window) {
        let count = 0;
        window.forEach(row => {
            row.forEach(e => {
                if (e === constant_1.ElementEnum.SAMBA)
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
function removeOneElement(list) {
    const index = (0, utils_1.random)(0, list.length - 1);
    const num = list[index];
    list.splice(index, 1);
    return num;
}
exports.removeOneElement = removeOneElement;
function crateSlotLottery(newer, roulette) {
    return new Lottery(newer, roulette);
}
exports.crateSlotLottery = crateSlotLottery;
function createBoLottery(disCards, profit) {
    return new BoLotteryUtil(disCards, profit);
}
exports.createBoLottery = createBoLottery;
function test() {
    const lottery = crateSlotLottery(false, '1');
    const result = lottery.setBetAndLineNum(1, 10)
        .result();
    if (result.freeSpin) {
        console.log(result);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TYW1iYS9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBOEY7QUFDOUYsNkNBQStEO0FBQy9ELGlEQUE2QztBQUM3QywrQ0FBOEM7QUFDOUMsMkNBQTBDO0FBTTFDLElBQUssYUFJSjtBQUpELFdBQUssYUFBYTtJQUNkLDJEQUFTLENBQUE7SUFDVCwyREFBUyxDQUFBO0lBQ1QscURBQU0sQ0FBQTtBQUNWLENBQUMsRUFKSSxhQUFhLEtBQWIsYUFBYSxRQUlqQjtBQUtNLE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxJQUFBLGtCQUFXLEdBQUUsQ0FBQyxNQUFNLENBQUM7QUFBMUUsUUFBQSxVQUFVLGNBQWdFO0FBMkV2RixNQUFhLE9BQU87SUFjaEIsWUFBWSxLQUFjLEVBQUUsUUFBeUI7UUFWckQsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLFdBQU0sR0FBb0IsRUFBRSxDQUFDO1FBQzdCLGFBQVEsR0FBYyxFQUFFLENBQUM7UUFDekIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsaUJBQVksR0FBa0IsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUNuRCxhQUFRLEdBQVksS0FBSyxDQUFDO1FBR3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFTyxJQUFJO1FBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7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