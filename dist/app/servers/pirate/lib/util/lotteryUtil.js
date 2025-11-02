"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPirateLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const weights_1 = require("../config/weights");
const winLine_1 = require("../config/winLine");
const awards_1 = require("../config/awards");
const big_js_1 = require("big.js");
class Lottery {
    constructor(roulette) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.weights = [];
        this.window = [];
        this.winLines = [];
        this.controlState = 1;
        this.multiply = 0;
        this.goldCount = 0;
        this.freeSpin = false;
        this.roulette = roulette;
    }
    init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.winLines = [];
        this.goldCount = 0;
    }
    setTotalBetAndMultiply(totalBet, multiply) {
        this.totalBet = totalBet;
        this.multiply = multiply;
        return this;
    }
    setSystemWinOrLoss(win) {
        this.controlState = win ? 2 : 3;
        return this;
    }
    setFreeSpin(f) {
        this.freeSpin = f;
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
            totalWin: this.totalWin,
            goldCount: this.goldCount,
            winLines: this.winLines
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        modifyInitialWindow(this.window);
        const result = this.calculateEarnings(this.window);
        this.winLines = result.currentLines;
        this.totalWin += result.jackpotProfit + result.baseProfit;
        this.jackpotWin += result.jackpotProfit;
    }
    freeSpinLottery(count) {
        const freeSpinResults = [];
        this.freeSpin = true;
        for (let i = 0; i < count; i++) {
            const window = this.generateWindow();
            modifyInitialWindow(window);
            const result = this.calculateEarnings(window);
            this.totalWin += result.jackpotProfit + result.baseProfit;
            freeSpinResults.push({
                win: result.jackpotProfit + result.baseProfit,
                window,
                winLines: result.currentLines,
            });
        }
        return {
            freeSpinResults,
            totalWin: this.totalWin,
        };
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
        this.weights = weights_1.baseWeights[this.roulette];
    }
    generateWindow() {
        let hasGold = this.controlState === 2 || this.freeSpin, window = [];
        for (let i = 0, len = this.weights.length; i < len; i++) {
            const columnLen = (i + 1) % 2 == 0 ? 4 : 3;
            const elementsWeight = conversionElements(this.weights[i]);
            let column = [];
            for (let j = 0; j < columnLen; j++) {
                let element = (0, utils_1.sortProbability)(Math.random(), elementsWeight);
                while (hasGold && element.name === constant_1.gold) {
                    element = (0, utils_1.sortProbability)(Math.random(), elementsWeight);
                }
                if (element.name === constant_1.gold) {
                    hasGold = true;
                    this.goldCount++;
                }
                column.push(element.name);
            }
            window.push(column);
        }
        return window;
    }
    calculateEarnings(window) {
        let currentLines = this.findWinLine(window);
        currentLines = this.removeGoldLine(currentLines);
        let baseProfit = new big_js_1.Big(0), jackpotProfit = new big_js_1.Big(0);
        currentLines.forEach((line) => {
            let first = line.elements[0];
            first = first[first.length - 1];
            if (first !== constant_1.map) {
                const profit = this.multiply === 0.1 ? awards_1.awards[first][line.count - 3] / 10
                    : awards_1.awards[first][line.count - 3] * this.multiply;
                baseProfit = baseProfit.add(profit);
                line.win = profit;
            }
            else {
                const profit = this.multiply === 0.1 ? awards_1.awards[first][line.count - 3] / 10
                    : awards_1.awards[first][line.count - 3] * this.multiply;
                jackpotProfit = baseProfit.add(profit);
                line.win = profit;
            }
        });
        return { currentLines, jackpotProfit: jackpotProfit.toNumber(), baseProfit: baseProfit.toNumber() };
    }
    findWinLine(window) {
        let lines = [], offsets = new Set();
        winLine_1.winLine.forEach(line => {
            const onceLine = { elements: [], winLine: [], count: 0, hasWild: false, type: null };
            window.forEach((elementLine, index) => {
                onceLine.elements.push(elementLine[line[index] - 1]);
            });
            line.forEach((pos, index) => {
                let offset = getOffset();
                while (offsets.has(offset)) {
                    offset = getOffset();
                }
                offsets.add(offset);
                onceLine.winLine[index] = { offset, index: pos };
            });
            lines.push(onceLine);
        });
        let currentWinLines = [];
        for (let i = 0; i < lines.length; i++) {
            const { hasWild, type } = this.replaceWild(lines[i].elements);
            lines[i].hasWild = hasWild;
            lines[i].type = type;
            let count = calculateLineResult(lines[i].elements, hasWild);
            if (count >= 3) {
                lines[i].count = count;
                currentWinLines.push(lines[i]);
            }
        }
        return currentWinLines;
    }
    removeGoldLine(currentWinLines) {
        let newLines = [];
        for (let i = 0; i < currentWinLines.length; i++) {
            if (currentWinLines[i].elements[0] !== constant_1.gold &&
                currentWinLines[i].elements[1] !== constant_1.gold &&
                currentWinLines[i].elements[2] !== constant_1.gold) {
                newLines.push(currentWinLines[i]);
            }
        }
        return newLines;
    }
    replaceWild(elementLine) {
        let hasWild = false, type = elementLine[0];
        if (elementLine.includes(constant_1.smallMermaid)) {
            const other = elementLine.find(e => e !== constant_1.smallMermaid);
            if (other) {
                hasWild = true;
            }
            elementLine.forEach((e, index) => {
                if (e === constant_1.smallMermaid) {
                    elementLine[index] = (other ? `${constant_1.smallMermaid}-${other}` : constant_1.smallMermaid);
                    if (index === 0) {
                        type = other;
                    }
                }
            });
        }
        return { hasWild, type };
    }
}
exports.Lottery = Lottery;
function createPirateLottery(roulette = calculateRoulette()) {
    return new Lottery(roulette);
}
exports.createPirateLottery = createPirateLottery;
function calculateRoulette() {
    const randomNum = Math.random();
    if (randomNum < 0.2) {
        return '1';
    }
    else if (randomNum < 0.5) {
        return '2';
    }
    else {
        return '3';
    }
}
function modifyInitialWindow(window) {
    for (let i = 0; i < window.length; i++) {
        for (let j = 0; j < window[i].length; j++) {
            if (window[i][j] === constant_1.bigMermaid) {
                window[i].fill(constant_1.smallMermaid);
            }
        }
    }
    return window;
}
function conversionElements(elements) {
    return [
        { name: '0', probability: elements['0'] },
        { name: '1', probability: elements['1'] },
        { name: '2', probability: elements['2'] },
        { name: '3', probability: elements['3'] },
        { name: '4', probability: elements['4'] },
        { name: '5', probability: elements['5'] },
        { name: '6', probability: elements['6'] },
        { name: '7', probability: elements['7'] },
        { name: '8', probability: elements['8'] },
        { name: '9', probability: elements['9'] },
        { name: '10', probability: elements['10'] }
    ];
}
function getOffset() {
    let rand = Math.random() * (0, utils_1.random)(-40, 40);
    while (rand < -40) {
        rand = Math.random() * 40;
    }
    return rand;
}
function calculateLineResult(elementLine, hasWild) {
    let count = 0;
    for (let i = 0; i < elementLine.length; i++) {
        if (i + 1 <= 4) {
            let current = elementLine[i];
            current = current[current.length - 1];
            let next = elementLine[i + 1];
            next = next[next.length - 1];
            if (current !== next) {
                break;
            }
            count = i + 2;
        }
        else {
            count = 5;
        }
    }
    return count;
}
function test() {
    const lottery = createPirateLottery('1');
    const result = lottery.setTotalBetAndMultiply(1000, 20)
        .setSystemWinOrLoss(false)
        .result();
    console.log(result.totalWin);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9waXJhdGUvbGliL3V0aWwvbG90dGVyeVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBQStFO0FBQy9FLDZDQUE0RDtBQUM1RCwrQ0FBZ0Q7QUFDaEQsK0NBQTRDO0FBQzVDLDZDQUEwQztBQUMxQyxtQ0FBMEI7QUFrRTFCLE1BQWEsT0FBTztJQWVoQixZQUFZLFFBQXlCO1FBWnJDLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLFlBQU8sR0FBMkMsRUFBRSxDQUFDO1FBQ3JELFdBQU0sR0FBb0IsRUFBRSxDQUFDO1FBQzdCLGFBQVEsR0FBaUIsRUFBRSxDQUFDO1FBQzVCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBQzVCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixhQUFRLEdBQVksS0FBSyxDQUFDO1FBR3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFTyxJQUFJO1FBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQU9ELHNCQUFzQixDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7UUFDckQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsT0FBTyxJQUFJLENB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TSxDQUFDO0FBQ2xCLENBQUM7QUFNRCxTQUFTLGtCQUFrQixDQUFDLFFBQThDO0lBQ3RFLE9BQU87UUFDSCxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtLQUM5QyxDQUFDO0FBQ04sQ0FBQztBQUtELFNBQVMsU0FBUztJQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFBLGNBQU0sRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzQyxPQUFPLElBQUksR0FBRyxDQUFDLEVBQUUsRUFBRTtRQUNmLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO0tBQzdCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQVFELFNBQVMsbUJBQW1CLENBQUMsV0FBMEIsRUFBRSxPQUFnQjtJQUVyRSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFFZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ1osSUFBSSxPQUFPLEdBQVEsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QyxJQUFJLElBQUksR0FBUSxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUc3QixJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLE1BQU07YUFDVDtZQUVELEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2pCO2FBQU07WUFDSCxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2I7S0FFSjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFHRCxTQUFTLElBQUk7SUFDVCxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztTQUNsRCxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7U0FDekIsTUFBTSxFQUFFLENBQUM7SUFLZCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxDQUFDIn0=