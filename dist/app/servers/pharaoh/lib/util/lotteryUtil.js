"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwingDiceResult = exports.getThrowingCount = exports.calculateGameLevel = exports.isHaveBet = exports.cratePharaohLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const weights_1 = require("../config/weights");
const utils_2 = require("../../../../utils");
const littleGame_1 = require("../config/littleGame");
const BIG_AWARDS = {
    '4': { name: 'king', ratio: 0.0008 },
    '3': { name: 'diamond', ratio: 0.00008 },
    '2': { name: 'platinum', ratio: 0.00005 },
    '1': { name: 'gold', ratio: 0.00001 },
};
class Lottery {
    constructor(newer, jackpot) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.jackpot = 0;
        this.detonatorCount = 0;
        this.gameLevel = 0;
        this.needGenerateBigDetonator = false;
        this.window = [];
        this.roundWindows = [];
        this.totalMultiple = 0;
        this.awards = [];
        this.jackpotTypeList = [];
        this.jackpotWinList = [];
        this.roundDetonatorCount = 0;
        this.controlState = 1;
        this.winningDetails = [];
        this.clearElements = [];
        this.newer = newer;
        this.jackpot = jackpot;
    }
    init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.needGenerateBigDetonator = false;
        this.roundWindows = [];
        this.clearAll = undefined;
        this.specialElement = undefined;
        this.awards = [];
        this.jackpotTypeList = [];
        this.jackpotWinList = [];
        this.roundDetonatorCount = 0;
        this.winningDetails = [];
        this.clearElements = [];
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
            jackpotTypeList: this.jackpotTypeList,
            jackpotWinList: this.jackpotWinList,
            roundDetonatorCount: this.roundDetonatorCount,
            clearAll: this.clearAll,
            awards: this.awards,
            roundWindows: this.roundWindows,
            jackpotWin: this.jackpotWin,
            totalMultiple: this.totalMultiple,
            winningDetails: this.winningDetails,
            clearElements: this.clearElements
        };
    }
    randomLottery() {
        this.init();
        this.calculateGenerateBigDetonator();
        this.generateWindow();
        this.calculateEarnings();
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
        this.weights = Object.keys(weights_1.weights).map((element) => {
            if (constant_1.specialElements.includes(element)) {
                if (this.needGenerateBigDetonator) {
                    return { [element]: 0 };
                }
                return { [element]: weights_1.weights[element].weight[this.gameLevel] };
            }
            return { [element]: weights_1.weights[element].weight };
        });
    }
    generateWindow() {
        if (this.needGenerateBigDetonator) {
            this.specialElement = constant_1.detonator;
            this.roundDetonatorCount = 4;
        }
        const num = constant_1.gameLevelMappingElementsNum[this.gameLevel];
        for (let i = 0; i < num; i++) {
            let line = [];
            while (line.length !== num) {
                const element = (0, utils_1.selectEle)(this.weights);
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
            this.window.push(line);
        }
        if (this.needGenerateBigDetonator) {
            randomSquare(num).forEach(e => this.window[e[0]][e[1]] = constant_1.detonator);
        }
    }
    calculateEarnings() {
        this.roundWindows.push(this.changeFirstWindow());
        let { randomType, clearCoordinates } = this.eliminateWindowElements(this.window);
        this.clearAll = randomType;
        let window = this.window;
        while (!(0, utils_2.isVoid)(clearCoordinates)) {
            const winAward = this.calculateClearElementProfit(clearCoordinates);
            this.clearElements.push(clearCoordinates);
            if (winAward[constant_1.bonus]) {
                this.jackpotWinList.push(winAward[constant_1.bonus].award);
                this.jackpotTypeList.push(winAward[constant_1.bonus].type);
            }
            this.totalMultiple += winAward.windowAward / 10;
            this.awards.push(winAward.windowAward * this.totalBet / 10);
            const result = this.subsequentWindow(window, clearCoordinates);
            this.roundWindows.push(result.position);
            this.roundWindows.push(result.newly);
            window = result.window;
            clearCoordinates = this.eliminateWindowElements(window).clearCoordinates;
        }
        this.jackpotWin = this.jackpotWinList.reduce((num, v) => num + v, 0);
        this.totalWin = this.totalMultiple * this.totalBet + this.jackpotWin;
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
        for (let element of constant_1.clearSpecialElements) {
            if (!!typePoints[element]) {
                typePoints = { [element]: typePoints[element] };
                break;
            }
        }
        let conversionPoints = {}, randomType;
        if (!!typePoints[constant_1.squib]) {
            const ordinaryList = Object.keys(typePoints).filter(type => constant_1.ordinaryElements.includes(type));
            randomType = ordinaryList[(0, utils_1.random)(0, ordinaryList.length - 1)];
            for (let type in typePoints) {
                conversionPoints[type] = type === randomType || !constant_1.ordinaryElements.includes(type) ?
                    [typePoints[type]] : clearSimilarElements(typePoints[type], this.gameLevel);
            }
        }
        else {
            for (let type in typePoints) {
                conversionPoints[type] = !constant_1.ordinaryElements.includes(type) ? [typePoints[type]] :
                    clearSimilarElements(typePoints[type], this.gameLevel);
            }
        }
        const clearCoordinates = (0, utils_2.filter)((coordinates) => coordinates.length > 0)(conversionPoints);
        for (let i in clearCoordinates) {
            if (constant_1.ordinaryElements.includes(i) && i !== randomType) {
                clearCoordinates[i] = clearCoordinates[i].map(e => Array.from(e).map((k) => k.split('-')));
            }
        }
        for (let i in clearCoordinates) {
            for (let j in clearCoordinates[i]) {
                clearCoordinates[i][j] = (0, utils_1.sortWith)([
                    (r1, r2) => r2[1] - r1[1],
                    (r1, r2) => r1[0] - r2[0]
                ])(clearCoordinates[i][j]);
            }
            clearCoordinates[i] = (0, utils_1.sortWith)([
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
        let windowTranscript = (0, utils_1.clone)(window);
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
                    const index = (0, utils_1.findLastIndex)(v => v !== 'del')(windowTranscript[i].slice(0, j));
                    if (index !== -1) {
                        [windowTranscript[i][j], windowTranscript[i][index]] =
                            [windowTranscript[i][index], windowTranscript[i][j]];
                    }
                }
            }
        }
        const completionWeights = Object.keys(weights_1.weights).map(element => {
            return constant_1.ordinaryElements.includes(element) ? { key: element, value: weights_1.weights[element].weight } :
                { key: element, value: 0 };
        });
        const newly = [];
        for (let i in windowTranscript) {
            const completionColumn = [];
            for (let j in windowTranscript) {
                if (windowTranscript[i][j] === 'del') {
                    windowTranscript[i][j] = (0, utils_1.selectElement)(completionWeights);
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
        if (this.controlState === 1) {
            this.needGenerateBigDetonator = Math.random() < 0.012;
        }
    }
    calculateClearElementProfit(clearCoordinates) {
        let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0 };
        for (let e in clearCoordinates) {
            if (e === constant_1.detonator) {
                result.detonatorCount = clearCoordinates[e][0].length;
            }
            else if (e === constant_1.bonus) {
                const bonusCount = clearCoordinates[e][0].length;
                const bonusAwards = BIG_AWARDS[bonusCount];
                const baseAwards = 7.5 * this.totalBet;
                const jackpotAwards = Math.ceil(this.jackpot * bonusAwards.ratio * (this.totalBet / 10));
                const allAwards = baseAwards + jackpotAwards;
                this.jackpot -= allAwards;
                result[e] = { bonusNum: bonusCount, award: allAwards, type: bonusAwards.name };
                this.winningDetails.push({ type: constant_1.bonus, num: bonusCount, win: 0 });
            }
            else if (constant_1.ordinaryElements.includes(e)) {
                result[e] = {};
                const elementOddsConfig = weights_1.weights[e].clearAward[this.gameLevel];
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
                    this.winningDetails.push({ type: e, num: len, win: odds * this.totalBet / 10 });
                    result.windowAward += odds;
                    result[e]['group' + i] = { award: odds };
                }
            }
        }
        result.jackpotMoney = this.jackpot;
        return result;
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
    return (0, utils_1.random)(1, 6);
}
exports.getThrowingCount = getThrowingCount;
function throwingDiceResult(totalBet, awardType, littleGameAccumulate, jackpot) {
    let award = [0, 0], littleGameWin = 0, throwNum = 0, select, selectType, jackPotGain = 0, bigPrizeType;
    if (constant_1.coinList.includes(awardType)) {
        award[0] += Math.floor(littleGameAccumulate * littleGame_1.awardOdds[awardType]);
        littleGameWin += award[0];
    }
    else if (awardType === constant_1.dice) {
        throwNum++;
    }
    else if (awardType === constant_1.littleBonus) {
        const awards = { r0: 'g', r1: 'king', r2: 'g', r3: 'diamond', r4: 'g', r5: 'platinum', r6: 'g', r7: 'gold' };
        const weight = [21, 6, 21, 5, 21, 3, 21, 2];
        if (totalBet * 7.5 > jackpot) {
            [1, 3, 5, 7].forEach(p => weight[p] = 0);
        }
        const weightArray = weight.map((e, i) => {
            return { ['r' + i]: e };
        });
        select = (0, utils_1.selectEle)(weightArray);
        selectType = awards[select];
        if (select.selectType === 'g') {
            award[0] += Math.floor(littleGameAccumulate * littleGame_1.awardOdds.gold);
        }
        else {
            bigPrizeType = selectType;
            const baseWin = totalBet * 7.5;
            let jackpotWin = (jackpot - baseWin) * (totalBet / 10) * littleGame_1.littleGameBonusOdds[selectType];
            if (jackpotWin < 0)
                jackpotWin = 0;
            awards[1] = Math.floor(baseWin + jackpotWin);
            jackPotGain = award[1];
        }
    }
    return { award, jackPotGain, select, selectType, throwNum, littleGameWin, bigPrizeType };
}
exports.throwingDiceResult = throwingDiceResult;
function randomSquare(n) {
    if (n < 2) {
        throw new Error(`参数有误 ${n}`);
    }
    const first = [(0, utils_1.random)(0, n - 1), (0, utils_1.random)(0, n - 1)];
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
    const coordinatesList = (0, utils_1.values)(mid);
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
function test() {
    const lottery = cratePharaohLottery(false, 0);
    return lottery.setTotalBet(3)
        .setDetonatorCount(5)
        .setSystemWinOrLoss(false)
        .result();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9waGFyYW9oL2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQWNxQjtBQUNyQiw2Q0FBMkc7QUFDM0csK0NBQTBDO0FBQzFDLDZDQUFpRDtBQUNqRCxxREFBb0U7QUFHcEUsTUFBTSxVQUFVLEdBQUc7SUFDZixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7SUFDcEMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO0lBQ3hDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtJQUN6QyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7Q0FDeEMsQ0FBQztBQXNFRixNQUFhLE9BQU87SUF3QmhCLFlBQVksS0FBYyxFQUFFLE9BQWU7UUFyQjNDLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFDM0IsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0Qiw2QkFBd0IsR0FBWSxLQUFLLENBQUM7UUFHMUMsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUVwQixpQkFBWSxHQUFVLEVBQUUsQ0FBQztRQUN6QixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixXQUFNLEdBQWEsRUFBRSxDQUFDO1FBQ3RCLG9CQUFlLEdBQWEsRUFBRSxDQUFDO1FBQy9CLG1CQUFjLEdBQWEsRUFBRSxDQUFDO1FBQzlCLHdCQUFtQixHQUFXLENBQUMsQ0FBQztRQUNoQyxpQkFBWSxHQUFjLENBQUMsQ0FBQztRQUM1QixtQkFBYyxHQUFvQixFQUFFLENBQUM7UUFDckMsa0JBQWEsR0FBVSxFQUFFLENBQUM7UUFHdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUVPLElBQUk7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQU9ELFdBQVcsQ0FBQyxRQUFnQjtRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBTUQsaUJBQWlCLENBQUMsY0FBc0I7UUFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQU1ELGtCQUFrQixDQUFDLEdBQVk7UUFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFLRCxNQUFNO1FBRUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFHekQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBR3BCLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3hCO2FBQU07WUFDSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDekI7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBS08sV0FBVztRQUNmLE9BQU87WUFDSCxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTtZQUNyQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQjtZQUM3QyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDM0IsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztZQUNuQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7U0FDcEMsQ0FBQztJQUNOLENBQUM7SUFLTyxhQUFhO1FBRWpCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdaLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1FBR3JDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUd0QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBS08sY0FBYztRQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUdyQixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDM0QsTUFBTTthQUNUO1lBR0QsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQzFELE1BQU07YUFDVDtTQUNKO0lBQ0wsQ0FBQztJQUtPLFlBQVk7UUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFPLENBQW1CLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFFbkUsSUFBSSwwQkFBZSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFFbkMsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEVBQUU7b0JBQy9CLE9BQU8sRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDO2lCQUN6QjtnQkFFRCxPQUFPLEVBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQzthQUMvRDtZQUVELE9BQU8sRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBS0QsY0FBYztRQUVWLElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO1lBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsb0JBQVMsQ0FBQztZQUNoQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1NBQ2hDO1FBR0QsTUFBTSxHQUFHLEdBQUcsc0NBQTJCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBR3hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRWQsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtnQkFFeEIsTUFBTSxPQUFPLEdBQUcsSUFBQSxpQkFBUyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHeEMsSUFBSSwwQkFBZSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFFbkMsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFO3dCQUNoRCxTQUFTO3FCQUNaO29CQUdELElBQUksT0FBTyxLQUFLLG9CQUFTLEVBQUU7d0JBQ3ZCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO3FCQUM5QjtvQkFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztpQkFDakM7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN0QjtZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFCO1FBR0QsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEVBQUU7WUFDL0IsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsb0JBQVMsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0wsQ0FBQztJQU1PLGlCQUFpQjtRQUVyQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1FBR2pELElBQUksRUFBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9FLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBRTNCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFHekIsT0FBTyxDQUFDLElBQUEsY0FBTSxFQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFFOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFcEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUcxQyxJQUFJLFFBQVEsQ0FBQyxnQkFBSyxDQUFDLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkQ7WUFHRCxJQUFJLENBQUMsYUFBYSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBR2hELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUc1RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFL0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN2QixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUM7U0FDNUU7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVyRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pFLENBQUM7SUFNTyx1QkFBdUIsQ0FBQyxNQUFjO1FBSTFDLElBQUksVUFBVSxHQUFnQyxFQUFFLENBQUM7UUFDakQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUMvQixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN0QixVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUM1QjtnQkFFRCxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUlILEtBQUssSUFBSSxPQUFPLElBQUksK0JBQW9CLEVBQUU7WUFFdEMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN2QixVQUFVLEdBQUcsRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDO2dCQUM5QyxNQUFNO2FBQ1Q7U0FDSjtRQUdELElBQUksZ0JBQWdCLEdBQWtDLEVBQUUsRUFFcEQsVUFBVSxDQUFDO1FBR2YsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFLLENBQUMsRUFBRTtZQUVyQixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLDJCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdGLFVBQVUsR0FBRyxZQUFZLENBQUMsSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5RCxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsRUFBRTtnQkFFekIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLFVBQVUsSUFBSSxDQUFDLDJCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM5RSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ25GO1NBQ0o7YUFBTTtZQUNILEtBQUssSUFBSSxJQUFJLElBQUksVUFBVSxFQUFFO2dCQUV6QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1RSxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzlEO1NBQ0o7UUFHRCxNQUFNLGdCQUFnQixHQUEyQixJQUFBLGNBQU0sRUFBQyxDQUFDLFdBQWdCLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUV4SCxLQUFLLElBQUksQ0FBQyxJQUFJLGdCQUFnQixFQUFFO1lBRTVCLElBQUksMkJBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEVBQUU7Z0JBQ2xELGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNuRztTQUNKO1FBR0QsS0FBSyxJQUFJLENBQUMsSUFBSSxnQkFBZ0IsRUFBRTtZQUM1QixLQUFLLElBQUksQ0FBQyxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMvQixnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFBLGdCQUFRLEVBQUM7b0JBQzlCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzVCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQzdCO1lBQ0QsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBQSxnQkFBUSxFQUFDO2dCQUMzQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzFCO1FBR0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxDQUFDO0lBRTVDLENBQUM7SUFLTyxpQkFBaUI7UUFDckIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hCLE9BQU8sRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDLENBQUE7WUFDcEIsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFPTyxnQkFBZ0IsQ0FBQyxNQUFlLEVBQUUsZ0JBQXdDO1FBRTlFLElBQUksZ0JBQWdCLEdBQUcsSUFBQSxhQUFLLEVBQUMsTUFBTSxDQUFDLENBQUM7UUFFckMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLEtBQUssSUFBSSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7WUFDNUIsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN0QyxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvRCxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQyxDQUFBO1NBQ0w7UUFHRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNmLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUlILEtBQUssSUFBSSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7WUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JELElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO29CQUNsQyxNQUFNLEtBQUssR0FBRyxJQUFBLHFCQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUUvRSxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDZCxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNqRCxDQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdEO2lCQUNKO2FBQ0o7U0FDSjtRQUdELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pELE9BQU8sMkJBQWdCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUEsQ0FBQztnQkFDekYsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUdILE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNqQixLQUFLLElBQUksQ0FBQyxJQUFJLGdCQUFnQixFQUFFO1lBQzVCLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzVCLEtBQUssSUFBSSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7Z0JBQzVCLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO29CQUNsQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFBLHFCQUFhLEVBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDMUQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDM0Q7cUJBQU07b0JBQ0gsTUFBTTtpQkFDVDthQUNKO1lBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUE7SUFDeEQsQ0FBQztJQU9PLDZCQUE2QjtRQUVqQyxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO1NBRXpEO0lBQ0wsQ0FBQztJQU1PLDJCQUEyQixDQUFDLGdCQUF3QztRQUN4RSxJQUFJLE1BQU0sR0FBRyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFDLENBQUM7UUFFdEUsS0FBSyxJQUFJLENBQUMsSUFBSSxnQkFBZ0IsRUFBRTtZQUU1QixJQUFJLENBQUMsS0FBSyxvQkFBUyxFQUFFO2dCQUNqQixNQUFNLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzthQUN6RDtpQkFBTSxJQUFJLENBQUMsS0FBSyxnQkFBSyxFQUFFO2dCQUVwQixNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBRWpELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFM0MsTUFBTSxVQUFVLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBRXZDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUV6RixNQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsYUFBYSxDQUFDO2dCQUM3QyxJQUFJLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQztnQkFFMUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLGdCQUFLLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQTthQUNuRTtpQkFBTSxJQUFJLDJCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFHckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFZixNQUFNLGlCQUFpQixHQUFHLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFaEUsS0FBSyxJQUFJLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDL0IsTUFBTSxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO29CQUMxQyxJQUFJLElBQVksQ0FBQztvQkFHakIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsSUFBSSxHQUFHLEdBQUcsc0NBQTJCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUMxRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO3FCQUNaO3lCQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDckQsSUFBSSxHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDMUQ7eUJBQU07d0JBQ0gsSUFBSSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUN0RDtvQkFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFnQixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUE7b0JBRzVGLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDO29CQUMzQixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDO2lCQUMxQzthQUNKO1NBQ0o7UUFFRCxNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFbkMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKO0FBL2VELDBCQStlQztBQVFELFNBQWdCLG1CQUFtQixDQUFDLEtBQWMsRUFBRSxjQUFzQjtJQUN0RSxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRkQsa0RBRUM7QUFPRCxTQUFnQixTQUFTLENBQUUsTUFBYyxFQUFFLE9BQWU7SUFDdEQsT0FBTyxzQkFBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0RSxDQUFDO0FBRkQsOEJBRUM7QUFPRCxTQUFnQixrQkFBa0IsQ0FBQyxjQUFzQjtJQUNyRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUZELGdEQUVDO0FBS0QsU0FBZ0IsZ0JBQWdCO0lBQzVCLE9BQU8sSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLENBQUM7QUFGRCw0Q0FFQztBQVVELFNBQWdCLGtCQUFrQixDQUFDLFFBQWdCLEVBQ2hCLFNBQWlCLEVBQ2pCLG9CQUE0QixFQUM1QixPQUFlO0lBRTlDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUVkLGFBQWEsR0FBRyxDQUFDLEVBRWpCLFFBQVEsR0FBRyxDQUFDLEVBRVosTUFBTSxFQUVOLFVBQVUsRUFFVixXQUFXLEdBQUcsQ0FBQyxFQUVmLFlBQVksQ0FBQztJQUdqQixJQUFJLG1CQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBRTlCLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixHQUFHLHNCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNwRSxhQUFhLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzdCO1NBQU0sSUFBSSxTQUFTLEtBQUssZUFBSSxFQUFFO1FBRTNCLFFBQVEsRUFBRSxDQUFDO0tBQ2Q7U0FBTSxJQUFJLFNBQVMsS0FBSyxzQkFBVyxFQUFFO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDN0csTUFBTSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFHNUMsSUFBSSxRQUFRLEdBQUcsR0FBRyxHQUFHLE9BQU8sRUFBRTtZQUMxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUM1QztRQUdELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsT0FBTyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxHQUFHLElBQUEsaUJBQVMsRUFBQyxXQUFXLENBQUMsQ0FBQztRQUNoQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRzVCLElBQUksTUFBTSxDQUFDLFVBQVUsS0FBSyxHQUFHLEVBQUU7WUFDM0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEdBQUcsc0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqRTthQUFNO1lBQ0gsWUFBWSxHQUFHLFVBQVUsQ0FBQztZQUUxQixNQUFNLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDO1lBRy9CLElBQUksVUFBVSxHQUFHLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxHQUFHLGdDQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRXpGLElBQUksVUFBVSxHQUFHLENBQUM7Z0JBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUduQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFFN0MsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQjtLQUNKO0lBRUQsT0FBTyxFQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBQyxDQUFDO0FBQzNGLENBQUM7QUFqRUQsZ0RBaUVDO0FBTUQsU0FBUyxZQUFZLENBQUMsQ0FBQztJQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDUCxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNoQztJQUNELE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFBLGNBQU0sRUFBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRzFDLENBQUM7UUFDRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbEQsT0FBTztxQkFDVjt5QkFBTTt3QkFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2xELE9BQU87cUJBQ1Y7aUJBQ0o7YUFDSjtTQUNKO0lBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNMLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFRRCxTQUFTLFVBQVUsQ0FBQyxRQUFrQixFQUFFLFFBQWtCO0lBQ3RELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVHLENBQUM7QUFPRCxTQUFTLG9CQUFvQixDQUFDLG9CQUFnQyxFQUFFLFNBQWlCO0lBQzdFLElBQUksR0FBRyxHQUFpQyxFQUFFLENBQUM7SUFDM0MsS0FBSyxJQUFJLENBQUMsSUFBSSxvQkFBb0IsRUFBRTtRQUNoQyxLQUFLLElBQUksQ0FBQyxJQUFJLG9CQUFvQixFQUFFO1lBRWhDLElBQUksVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlELE1BQU0sR0FBRyxHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNYLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO2lCQUN4QjtnQkFFRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ25EO1NBQ0o7S0FDSjtJQUVELEtBQUssSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3JCLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQTtLQUNMO0lBR0QsTUFBTSxlQUFlLEdBQVcsSUFBQSxjQUFNLEVBQUMsR0FBRyxDQUFDLENBQUM7SUFFNUMsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUNuQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzNDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDZCxPQUFPO1NBQ1Y7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFBRSxTQUFTO1lBR2xDLElBQUksVUFBVSxDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDN0MsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzthQUM3QjtTQUNKO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFHSCxNQUFNLEdBQUcsR0FBRyxzQ0FBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVuRCxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQU9ELFNBQVMsVUFBVSxDQUFDLE1BQW1CLEVBQUUsTUFBbUI7SUFDeEQsT0FBTyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUM3RCxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBO0FBQ2xFLENBQUM7QUFHRCxTQUFTLElBQUk7SUFDVCxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUcsQ0FBQyxDQUFDLENBQUM7SUFFL0MsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUN4QixpQkFBaUIsQ0FBQyxDQUFDLENBQUM7U0FDcEIsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1NBQ3pCLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLENBQUMifQ==