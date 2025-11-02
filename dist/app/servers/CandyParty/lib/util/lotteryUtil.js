"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThrowingCount = exports.calculateGameLevel = exports.isHaveBet = exports.cratePharaohLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
const utils = require("../../../../utils");
const weightsC = require("../config/weights");
class Lottery {
    constructor(newer, jackpot) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpot = 0;
        this.detonatorCount = 0;
        this.gameLevel = 0;
        this.needGenerateBigDetonator = false;
        this.window = [];
        this.roundWindows = [];
        this.totalMultiple = 0;
        this.awards = [];
        this.roundDetonatorCount = 0;
        this.controlState = 1;
        this.winningDetails = [];
        this.clearElements = [];
        this.freeSpinResult = [];
        this.newer = newer;
        this.jackpot = jackpot;
    }
    init() {
        this.totalWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.needGenerateBigDetonator = false;
        this.roundWindows = [];
        this.clearAll = undefined;
        this.specialElement = undefined;
        this.awards = [];
        this.roundDetonatorCount = 0;
        this.winningDetails = [];
        this.clearElements = [];
        this.freeSpinResult = [];
    }
    setTotalBet(totalBet) {
        this.totalBet = totalBet;
        return this;
    }
    setDetonatorCount(detonatorCount) {
        this.detonatorCount = detonatorCount;
        return this;
    }
    setSystemWinOrLoss(win) {
        this.controlState = win ? 2 : 3;
        return this;
    }
    result() {
        this.gameLevel = calculateGameLevel(this.detonatorCount);
        this.selectWights();
        if (this.controlState === 1) {
            this.randomLottery();
        }
        else {
            this.controlLottery();
        }
        return this.stripResult();
    }
    stripResult() {
        return {
            window: this.window,
            totalWin: this.totalWin,
            roundDetonatorCount: this.roundDetonatorCount,
            clearAll: this.clearAll,
            awards: this.awards,
            roundWindows: this.roundWindows,
            totalMultiple: this.totalMultiple,
            winningDetails: this.winningDetails,
            clearElements: this.clearElements,
            freeSpinResult: this.freeSpinResult,
            odds: 1
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        this.calculateGenerateBigDetonator();
        const result = this.calculateEarnings(this.window);
        this.roundWindows = result.roundWindows;
        this.totalWin = result.totalWin;
        this.roundDetonatorCount += result.roundDetonatorCount;
        this.clearAll = result.clearAll;
        this.awards = result.awards;
        this.totalMultiple = result.totalMultiple;
        this.winningDetails = result.winningDetails;
        this.clearElements = result.clearElements;
        if (this.scatterCount) {
            this.freeSpinLottery();
        }
    }
    freeSpinLottery() {
        this.freeSpin = true;
        let odds = utils.sortProbability_(constant_1.Multiples);
        for (let i = 0; i < 10; i++) {
            const window = this.generateWindow();
            const result = this.calculateEarnings(window);
            result.winningDetails;
            for (const item of result.winningDetails) {
                item.win *= odds;
            }
            result.totalWin *= odds;
            result.window = window;
            result.odds = odds;
            this.freeSpinResult.push(result);
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
        this.weights = Object.keys(weightsC.weights).map((element) => {
            if (constant_1.specialElements.includes(element)) {
                if (this.needGenerateBigDetonator) {
                    return { [element]: 0 };
                }
                let V = weightsC.weights[element].weight[this.gameLevel];
                return { [element]: V };
            }
            return { [element]: weightsC.weights[element].weight };
        });
    }
    generateWindow() {
        this.gameLevel = calculateGameLevel(this.detonatorCount);
        const window = [];
        const num = constant_1.gameLevelMappingElementsNum[this.gameLevel];
        for (let i = 0; i < num; i++) {
            let line = [];
            while (line.length !== num) {
                const element = utils.selectEle(this.weights);
                if (this.freeSpin && element == constant_1.detonator) {
                    continue;
                }
                if (constant_1.specialElements.includes(element)) {
                    if (this.specialElement || this.controlState === 2) {
                        continue;
                    }
                    if (element === constant_1.detonator) {
                        this.roundDetonatorCount++;
                    }
                    this.specialElement = element;
                }
                line.push(element);
            }
            window.push(line);
        }
        return window;
    }
    calculateEarnings(window) {
        let roundWindows = [];
        roundWindows.push(this.changeFirstWindow());
        let { randomType, clearCoordinates } = this.eliminateWindowElements(window);
        let clearAll = randomType;
        let clearElements = [];
        let totalMultiple = 0;
        let awards = [];
        let winningDetails = [];
        while (!utils.isVoid(clearCoordinates)) {
            const { result: winAward, winningDetails: Tmp } = this.calculateClearElementProfit(clearCoordinates);
            winningDetails.push(...Tmp);
            clearElements.push(clearCoordinates);
            totalMultiple += winAward.windowAward / 10;
            awards.push(winAward.windowAward * this.totalBet / 10);
            const result = this.subsequentWindow(window, clearCoordinates);
            roundWindows.push(result.position);
            roundWindows.push(result.newly);
            window = result.window;
            clearCoordinates = this.eliminateWindowElements(window).clearCoordinates;
        }
        let totalWin = totalMultiple * this.totalBet;
        let result = {
            clearAll,
            clearElements,
            totalMultiple,
            awards,
            totalWin,
            window,
            roundDetonatorCount: 0,
            winningDetails,
            roundWindows,
            odds: 1,
        };
        return result;
    }
    eliminateWindowElements(window) {
        let typePoints = {};
        window.forEach((elements, index) => {
            elements.forEach((element, i) => {
                if (!typePoints[element]) {
                    typePoints[element] = [];
                }
                typePoints[element].push([index, i]);
            });
        });
        let conversionPoints = {}, randomType;
        for (let type in typePoints) {
            conversionPoints[type] = !constant_1.ordinaryElements.includes(type) ? [typePoints[type]] :
                clearSimilarElements(typePoints[type], this.gameLevel);
        }
        const clearCoordinates = utils.filter((coordinates) => coordinates.length > 0)(conversionPoints);
        for (let i in clearCoordinates) {
            if (constant_1.ordinaryElements.includes(i) && i !== randomType) {
                clearCoordinates[i] = clearCoordinates[i].map(e => Array.from(e).map((k) => k.split('-')));
            }
        }
        for (let i in clearCoordinates) {
            for (let j in clearCoordinates[i]) {
                clearCoordinates[i][j] = utils.sortWith([
                    (r1, r2) => r2[1] - r1[1],
                    (r1, r2) => r1[0] - r2[0]
                ])(clearCoordinates[i][j]);
            }
            clearCoordinates[i] = utils.sortWith([
                (r1, r2) => r2[0][1] - r1[0][1],
                (r1, r2) => r1[0][0] - r2[0][0],
            ])(clearCoordinates[i]);
        }
        return { clearCoordinates, randomType };
    }
    changeFirstWindow() {
        return this.window.map(line => {
            return line.map(e => {
                return { type: e };
            });
        });
    }
    subsequentWindow(window, clearCoordinates) {
        let windowTranscript = utils.clone(window);
        let clears = [];
        for (let e in clearCoordinates) {
            clearCoordinates[e].forEach(coordinates => {
                e === this.clearAll ? coordinates.forEach(c => clears.unshift(c)) :
                    coordinates.forEach(c => clears.push(c));
            });
        }
        let position = [];
        clears.forEach(c => {
            windowTranscript[c[0]][c[1]] = 'del';
            position.push({ x: Number(c[0]), y: Number(c[1]) });
        });
        for (let i in windowTranscript) {
            for (let j = windowTranscript[i].length - 1; j > 0; j--) {
                if (windowTranscript[i][j] === 'del') {
                    const index = utils.findLastIndex(v => v !== 'del')(windowTranscript[i].slice(0, j));
                    if (index !== -1) {
                        [windowTranscript[i][j], windowTranscript[i][index]] =
                            [windowTranscript[i][index], windowTranscript[i][j]];
                    }
                }
            }
        }
        const completionWeights = Object.keys(weightsC.weights).map(element => {
            return constant_1.ordinaryElements.includes(element) ? { key: element, value: weightsC.weights[element].weight } :
                { key: element, value: 0 };
        });
        const newly = [];
        for (let i in windowTranscript) {
            const completionColumn = [];
            for (let j in windowTranscript) {
                if (windowTranscript[i][j] === 'del') {
                    windowTranscript[i][j] = utils.selectElement(completionWeights);
                    completionColumn.push({ type: windowTranscript[i][j] });
                }
                else {
                    break;
                }
            }
            newly.push(completionColumn);
        }
        return { window: windowTranscript, newly, position };
    }
    calculateGenerateBigDetonator() {
        if (this.controlState !== 1) {
            return;
        }
        const num = constant_1.gameLevelMappingElementsNum[this.gameLevel];
        this.scatterCount = Math.random() < 0.0115;
        if (this.scatterCount) {
            const first = [utils.random(0, num - 1), utils.random(0, num - 1)];
            this.window[first[0]][first[1]] = constant_1.scatter;
        }
    }
    calculateClearElementProfit(clearCoordinates) {
        let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0 };
        let winningDetails = [];
        for (let e in clearCoordinates) {
            if (e === constant_1.detonator) {
                result.detonatorCount = clearCoordinates[e][0].length;
            }
            else if (constant_1.ordinaryElements.includes(e)) {
                result[e] = {};
                const elementOddsConfig = weightsC.weights[e].clearAward[this.gameLevel];
                for (let i in clearCoordinates[e]) {
                    const len = clearCoordinates[e][i].length;
                    let odds;
                    if (e === this.clearAll && len < constant_1.gameLevelMappingElementsNum[this.gameLevel]) {
                        odds = 2;
                    }
                    else if (!elementOddsConfig[len - 3 - this.gameLevel]) {
                        odds = elementOddsConfig[elementOddsConfig.length - 1];
                    }
                    else {
                        odds = elementOddsConfig[len - 3 - this.gameLevel];
                    }
                    winningDetails.push({ type: e, num: len, win: odds * this.totalBet / 10 });
                    result.windowAward += odds;
                    result[e]['group' + i] = { award: odds };
                }
            }
        }
        result.jackpotMoney = this.jackpot;
        return { result, winningDetails };
    }
}
exports.Lottery = Lottery;
function cratePharaohLottery(newer, jackpotGoldNum) {
    return new Lottery(newer, jackpotGoldNum);
}
exports.cratePharaohLottery = cratePharaohLottery;
function isHaveBet(betNum, betOdds) {
    return constant_1.baseBetList.includes(betNum) && constant_1.oddsList.includes(betOdds);
}
exports.isHaveBet = isHaveBet;
function calculateGameLevel(detonatorCount) {
    return Math.floor(detonatorCount / 15) % 3 + 1;
}
exports.calculateGameLevel = calculateGameLevel;
function getThrowingCount() {
    return utils.random(1, 6);
}
exports.getThrowingCount = getThrowingCount;
function randomSquare(n) {
    if (n < 2) {
        throw new Error(`参数有误 ${n}`);
    }
    const first = [utils.random(0, n - 1), utils.random(0, n - 1)];
    const others = [first[0] + '' + first[1]];
    (function () {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (Math.pow(i - first[0], 2) + Math.pow(j - first[1], 2) == 2) {
                    others.push(i + '' + j);
                    if (i > first[0]) {
                        others.push(first[0] + '' + j, i + '' + first[1]);
                        return;
                    }
                    else {
                        others.push(i + '' + first[1], first[0] + '' + j);
                        return;
                    }
                }
            }
        }
    })();
    return others;
}
function isAdjacent(pointOne, pointTwo) {
    return Math.sqrt(Math.pow(pointOne[0] - pointTwo[0], 2) + Math.pow(pointOne[1] - pointTwo[1], 2)) === 1;
}
function clearSimilarElements(similarElementPoints, gameLevel) {
    let mid = {};
    for (let i in similarElementPoints) {
        for (let j in similarElementPoints) {
            if (isAdjacent(similarElementPoints[i], similarElementPoints[j])) {
                const key = similarElementPoints[i].toString();
                if (!mid[key]) {
                    mid[key] = new Set();
                }
                mid[key].add(similarElementPoints[j].join('-'));
            }
        }
    }
    for (let i in mid) {
        mid[i].forEach((value) => {
            mid[value.split('-').toString()].forEach((v) => {
                mid[i].add(v);
            });
        });
    }
    const coordinatesList = utils.values(mid);
    const len = coordinatesList.length;
    coordinatesList.forEach((coordinates, index) => {
        if (!coordinates) {
            return;
        }
        for (let i = index + 1; i < len; i++) {
            if (!coordinatesList[i])
                continue;
            if (isEqualSet(coordinates, coordinatesList[i])) {
                coordinatesList[i] = null;
            }
        }
    });
    const num = constant_1.gameLevelMappingElementsNum[gameLevel];
    return coordinatesList.filter(e => e !== null && e.size >= num);
}
function isEqualSet(setOne, setTwo) {
    return new Set([...setOne].filter(x => !setTwo.has(x))).size == 0 &&
        new Set([...setTwo].filter(x => !setOne.has(x))).size == 0;
}
function test(roundDetonatorCount, totalBet) {
    const lottery = cratePharaohLottery(false, 0);
    return lottery.setTotalBet(totalBet)
        .setDetonatorCount(roundDetonatorCount)
        .result();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DYW5keVBhcnR5L2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQWVxQjtBQUNyQiwyQ0FBMkM7QUFDM0MsOENBQThDO0FBOEQ5QyxNQUFhLE9BQU87SUE2QmhCLFlBQVksS0FBYyxFQUFFLE9BQWU7UUExQjNDLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBRTNCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsNkJBQXdCLEdBQVksS0FBSyxDQUFDO1FBRzFDLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFHcEIsaUJBQVksR0FBaUMsRUFBRSxDQUFDO1FBQ2hELGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFFdEIsd0JBQW1CLEdBQVcsQ0FBQyxDQUFDO1FBQ2hDLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBQzVCLG1CQUFjLEdBQW9CLEVBQUUsQ0FBQztRQUNyQyxrQkFBYSxHQUFVLEVBQUUsQ0FBQztRQUUxQixtQkFBYyxHQUEyQixFQUFFLENBQUM7UUFLeEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUVPLElBQUk7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZ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