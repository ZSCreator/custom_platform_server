"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalInternalControl = exports.crateSlotLottery = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const weights_1 = require("../config/weights");
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
        this.sixthAxis = 0;
        this.firstWindow = [];
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
        this.sixthAxis = 0;
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
            sixthAxis: this.sixthAxis,
            firstWindow: this.firstWindow,
            freeSpinResult: this.freeSpinResult,
        };
    }
    randomLottery() {
        this.init();
        this.firstWindow = this.generateWindow();
        this.addScatterElement();
        this.window = JSON.parse(JSON.stringify(this.firstWindow));
        this.sixthAxis = this.genSixthAxis();
        this.addWildElement(this.window, this.sixthAxis);
        this.countScatterNum();
        const result = this.calculateEarnings(this.window, this.sixthAxis);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        if (this.scatterCount >= 3) {
            this.freeSpinLottery();
        }
    }
    countScatterNum() {
        let num = 0;
        this.window.forEach(row => {
            row.forEach(e => {
                if (e === constant_1.default.scatter) {
                    num++;
                }
            });
        });
        this.scatterCount = num;
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
                const element = (0, utils_1.selectElement)(elementSet);
                line.push(element);
                if (element === constant_1.default.wild) {
                    elementSet.find(e => {
                        if (e.key === constant_1.default.wild) {
                            e.value = 0;
                            return true;
                        }
                        return false;
                    });
                }
            }
            window.push(line);
        }
        return window;
    }
    genSixthAxis() {
        return parseInt((0, utils_1.selectElement)(JSON.parse(JSON.stringify(weights_1.sixthAxisElements))));
    }
    addWildElement(window, sixthAxis) {
        this.genSixthAxis();
        window.forEach(row => {
            if (sixthAxis == constant_1.JIN_JI_DAO) {
                const num = (0, utils_1.random)(0, 2);
                row[num] = constant_1.default.wild;
            }
            if (row[1] === constant_1.default.wild) {
                row[0] = constant_1.default.wild;
                row[2] = constant_1.default.wild;
            }
        });
    }
    addScatterElement() {
        this.scatterCount = this.getScatterNumber();
        if (this.scatterCount === 0) {
            return;
        }
        let winCoordinates = new Set();
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        selectLines.forEach((line) => {
            const elementLine = line.map((l, i) => this.firstWindow[i][l - 1]);
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                const coordinates = line.slice(0, lineResult.linkNum).map((l, i) => `${i}-${l - 1}`);
                coordinates.forEach(c => winCoordinates.add(c));
            }
        });
        let allCoordinates = [];
        this.firstWindow.forEach((column, columnNumber) => {
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
            this.firstWindow[realCoordinate[0]][realCoordinate[1]] = constant_1.default.scatter;
            alternateCoordinates = alternateCoordinates.filter(c => c !== coordinate);
        }
    }
    calculateEarnings(window, sixthAxis) {
        const selectLines = constant_1.default.winLines.slice(0, this.lineNum);
        sixthAxis = sixthAxis === constant_1.JIN_JI_DAO ? 1 : sixthAxis;
        let winLines = [], totalWin = 0;
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            elementLine.forEach((element, index) => {
                if (index === 0)
                    return;
                if (element === constant_1.default.wild) {
                    elementLine[index] = elementLine[index - 1];
                }
            });
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType && lineResult.elementType !== constant_1.default.scatter) {
                const odds = constant_1.default.award[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds * sixthAxis;
                totalWin += lineProfit;
                this.totalMultiple += odds;
                const linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });
        return { winLines, totalWin };
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine[0];
        let result = { elementType: null, rewardType: 0, linkNum: 0, prizeType: 'none' };
        if (firstElement === constant_1.default.scatter) {
            return result;
        }
        this.specialCount(elementLine, result);
        if (result.elementType) {
            return result;
        }
        elementLine.forEach((element, index) => {
            if (index === 0)
                return;
            if (element === constant_1.default.wild) {
                elementLine[index] = elementLine[index - 1];
            }
        });
        if (firstElement !== elementLine[1]) {
            return result;
        }
        switch (true) {
            case elementLine.every(element => element === firstElement): {
                result.linkNum = 5;
                result.elementType = firstElement;
                result.rewardType = 2;
                break;
            }
            case elementLine.slice(0, 4).every(element => element === firstElement): {
                result.elementType = firstElement;
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
            default:
                break;
        }
        return result;
    }
    specialCount(elementLine, result) {
        const s = new Set();
        elementLine.forEach(e => s.add(e));
        s.delete(constant_1.default.wild);
        if (s.size === 0) {
            result.linkNum = 5;
            result.elementType = constant_1.default.wild;
            result.rewardType = 2;
            return result;
        }
        if (s.size === 1) {
            result.linkNum = 5;
            result.elementType = [...s.values()][0];
            result.rewardType = 2;
            return result;
        }
        s.clear();
        const fourElementLine = elementLine.slice(0, 4);
        fourElementLine.forEach(e => s.add(e));
        s.delete(constant_1.default.wild);
        if (s.size === 0) {
            result.linkNum = 4;
            result.elementType = constant_1.default.wild;
            result.rewardType = 1;
            return result;
        }
        if (s.size === 1) {
            result.linkNum = 4;
            result.elementType = [...s.values()][0];
            result.rewardType = 1;
            return result;
        }
        s.clear();
        const threeElementLine = elementLine.slice(0, 3);
        threeElementLine.forEach(e => s.add(e));
        s.delete(constant_1.default.wild);
        if (s.size === 0) {
            result.linkNum = 3;
            result.elementType = constant_1.default.wild;
            result.rewardType = 0;
            return result;
        }
        if (s.size === 1) {
            result.linkNum = 3;
            result.elementType = [...s.values()][0];
            result.rewardType = 0;
            return result;
        }
        return result;
    }
    freeSpinLottery() {
        this.freeSpin = true;
        for (let i = 0; i < 10; i++) {
            const firstWindow = this.generateWindow();
            this.changeFreeSpinWindow(firstWindow);
            const window = JSON.parse(JSON.stringify(firstWindow));
            const sixthAxis = this.genSixthAxis();
            this.addWildElement(window, sixthAxis);
            const result = this.calculateEarnings(window, sixthAxis);
            this.freeSpinResult.push({ firstWindow, winLines: result.winLines, totalWin: result.totalWin, window, sixthAxis });
        }
    }
    changeFreeSpinWindow(window) {
        window.forEach(row => {
            row.forEach((e, index) => {
                switch (e) {
                    case constant_1.default.A:
                        row[index] = constant_1.default.lion;
                        break;
                    case constant_1.default.K:
                        row[index] = constant_1.default.fish;
                        break;
                    case constant_1.default.Q:
                        row[index] = constant_1.default.toad;
                        break;
                    case constant_1.default.J:
                        row[index] = constant_1.default.lantern;
                        break;
                    case constant_1.default.TEN:
                        row[index] = constant_1.default.firecrackers;
                        break;
                    default:
                        break;
                }
            });
        });
    }
    getScatterNumber() {
        if (this.controlState !== 1) {
            return [0, 1, 2][(0, utils_1.random)(0, 2)];
        }
        let randomNumber = Math.random();
        if (randomNumber < OTHER_SCATTER_PROBABILITY) {
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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Gb3J0dW5lUm9vc3Rlci9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBa0Y7QUFDbEYsNkNBQStEO0FBQy9ELCtDQUFvRDtBQUlwRCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztBQUV2QyxNQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztBQUV2QyxNQUFNLHlCQUF5QixHQUFHLE1BQU0sQ0FBQztBQU1sQyxNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksa0JBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQTVFLFFBQUEsVUFBVSxjQUFrRTtBQW9HekYsTUFBYSxPQUFPO0lBd0JoQixZQUFZLEtBQWMsRUFBRSxRQUF5QjtRQWxCckQsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFFL0IsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFDdkIsZ0JBQVcsR0FBYyxJQUFJLENBQUM7UUFFOUIsV0FBTSxHQUFvQixFQUFFLENBQUM7UUFDN0IsYUFBUSxHQUFjLEVBQUUsQ0FBQztRQUN6QixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixpQkFBWSxHQUFjLENBQUMsQ0FBQztRQUM1QixhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBQ3pCLG1CQUFjLEdBQXFCLEVBQUUsQ0FBQztRQUN0QyxjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLGdCQUFXLEdBQW9CLEVBQUUsQ0FBQztRQUc5QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMs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