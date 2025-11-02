"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThrowingCount = exports.calculateGameLevel = exports.isHaveBet = exports.cratePharaohLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
const utils = require("../../../../utils");
const weightsC = require("../config/weights");
const utils_1 = require("../../../../utils");
class Lottery {
    constructor(newer, jackpot) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpot = 0;
        this.detonatorCount = 0;
        this.gameLevel = 0;
        this.window = [];
        this.roundWindows = [];
        this.totalMultiple = 0;
        this.awards = [];
        this.controlState = 1;
        this.winningDetails = [];
        this.clearElements = [];
        this.freeSpinResult = [];
        this.moonRecharge = 0;
        this.newer = newer;
        this.jackpot = jackpot;
    }
    init() {
        this.totalWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.roundWindows = [];
        this.clearAll = undefined;
        this.specialElement = undefined;
        this.awards = [];
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
        this.selectWights();
        console.warn("this.....", this.weights);
        if (true) {
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
        const result = this.calculateEarnings(this.window);
        this.roundWindows = result.roundWindows;
        this.totalWin = result.totalWin;
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
            return { [element]: weightsC.weights[element].weight };
        });
    }
    generateWindow() {
        const window = [];
        const num = 5;
        for (let i = 0; i < num; i++) {
            let line = [];
            while (line.length !== num) {
                const element = (0, utils_1.selectEle)(this.weights);
                line.push(element);
            }
            window.push(line);
        }
        console.warn("window.........", window);
        return window;
    }
    calculateEarnings(window) {
        let roundWindows = [];
        roundWindows.push(this.changeFirstWindow());
        let { clearCoordinates } = this.eliminateWindowElements(window);
        let clearElements = [];
        let totalMultiple = 0;
        let awards = [];
        let winningDetails = [];
        let multiple = 1;
        while (!utils.isVoid(clearCoordinates)) {
            const { result: winAward, winningDetails: Tmp } = this.calculateClearElementProfit(clearCoordinates, this.window, multiple);
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
            clearElements,
            totalMultiple,
            awards,
            totalWin,
            window,
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
        console.warn(`元素数组坐标typePoints: ${JSON.stringify(typePoints)}`);
        let conversionPoints = {};
        for (let type in typePoints) {
            conversionPoints[type] = isLine(typePoints[type]);
        }
        let moon_wild_list = typePoints[weightsC.moon_wild];
        let list = [];
        for (let type in typePoints) {
            if (constant_1.moonElements.includes(type)) {
                list = list.concat(typePoints[type]);
            }
        }
        list = list.concat(moon_wild_list);
        conversionPoints[weightsC.moon_dif] = isLine(list);
        for (let type in typePoints) {
            if (constant_1.ordinaryElements.includes(type)) {
                let list_ = [];
                list_ = moon_wild_list.concat(typePoints[type]);
                conversionPoints[type] = isLine(list_);
            }
        }
        console.warn(`需要被消除的元素conversionPoints: ${JSON.stringify(conversionPoints)}`);
        const clearCoordinates = utils.filter((coordinates) => coordinates.length > 0)(conversionPoints);
        console.warn(`过滤掉的空数组保留空元素clearCoordinates: ${JSON.stringify(clearCoordinates)}`);
        for (let i in clearCoordinates) {
            if (constant_1.ordinaryElements.includes(i)) {
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
        console.warn(`过滤掉的空数组保留空元素clearCoordinates2222222222: ${JSON.stringify(clearCoordinates)}`);
        return { clearCoordinates };
    }
    statisticalFieldNumber_key(arr) {
        let list = arr.reduce(function (prev, next) {
            prev[next] = (prev[next] + 1) || 1;
            return prev;
        }, {});
        let resultList = [];
        for (let key in list) {
            resultList.push({ key: Number(key), value: list[key] });
        }
        return resultList;
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
    calculateClearElementProfit(clearCoordinates, windows, multiple) {
        let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0 };
        let winningDetails = [];
        for (let e in clearCoordinates) {
            if (constant_1.ordinaryElements.includes(e)) {
                result[e] = {};
                const elementOddsConfig = weightsC.weights[e].clearAward;
                console.warn("elementOddsConfig......", elementOddsConfig);
                for (let i in clearCoordinates[e]) {
                    let weights_index = clearCoordinates[e][i];
                    const len = weights_index.length;
                    let odds;
                    let length = len - 3;
                    let num = 0;
                    odds = elementOddsConfig[length];
                    let weights = [];
                    for (let m of weights_index) {
                        weights.push(findWeightInWindows(windows, m));
                    }
                    if (weightsC.moon_weights.includes(e)) {
                        if (weights.filter(x => x == e || x == weightsC.moon_wild).length !== weights.length) {
                            odds = weightsC.clearAward_princess[length];
                        }
                        if (weights.length == 3) {
                            num = 1;
                        }
                        else if (weights.length == 4) {
                            num = moon_recharge(weights);
                        }
                        else if (weights.length == 5) {
                            num = 3;
                        }
                        this.moonRecharge += num;
                    }
                    winningDetails.push({ type: e, num: num, win: odds * 100 * multiple, multiple: multiple, weights });
                }
            }
        }
        console.warn("winningDetails....", winningDetails);
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
function clearSimilarElements(similarElementPoints) {
    console.warn(`similarElementPoints:${JSON.stringify(similarElementPoints)}`);
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
    console.warn("mid11", mid);
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
    const num = 3;
    console.warn("222", coordinatesList.filter(e => e !== null && e.size >= num));
    return coordinatesList.filter(e => e !== null && e.size >= num);
}
function isEqualSet(setOne, setTwo) {
    return new Set([...setOne].filter(x => !setTwo.has(x))).size == 0 &&
        new Set([...setTwo].filter(x => !setOne.has(x))).size == 0;
}
function isLine(similarElementPoints) {
    let list_x = [];
    let list_y = [];
    for (let m of similarElementPoints) {
        list_x.push(m[0]);
        list_y.push(m[1]);
    }
    let list_x_ = this.statisticalFieldNumber_key(list_x);
    let list_y_ = this.statisticalFieldNumber_key(list_y);
    list_x_ = list_x_.filter(x => x.value >= 3);
    list_y_ = list_y_.filter(x => x.value >= 3);
    let list = [];
    if (list_x_.length > 0) {
        for (let x of list_x_) {
            let list_xx = [];
            for (let m of similarElementPoints) {
                if (m[0] == x.key) {
                    list_xx.push(m);
                }
            }
            if (list_xx.length >= 3) {
                list = list.concat(clearSimilarElements(list_xx));
            }
        }
    }
    if (list_y_.length > 0) {
        for (let y of list_y_) {
            let list_yy = [];
            for (let m of similarElementPoints) {
                if (m[1] == y.key) {
                    list_yy.push(m);
                }
            }
            if (list_yy.length >= 3) {
                list = list.concat(clearSimilarElements(list_yy));
            }
        }
    }
    return list;
}
function findWeightInWindows(windows, index) {
    let index_x = Number(index[0]);
    let index_y = Number(index[1]);
    return windows[index_x][index_y];
}
function statisticalFieldNumber_string(arr) {
    let list = arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});
    let resultList = [];
    for (let key in list) {
        resultList.push({ key: key, value: list[key] });
    }
    return resultList;
}
function moon_recharge(weights) {
    let ss = statisticalFieldNumber_string(weights);
    let z = ss.find(x => x.key == 'Z');
    if (ss.length == 1) {
        return 2;
    }
    else if (z && z.value == 2 && ss.length == 3) {
        return 3;
    }
    else if (ss.length == 2 && !z) {
        if (ss[0].value == 3 || ss[1].value == 3) {
            return 3;
        }
    }
    return 2;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Nb29uUHJpbmNlc3MvbGliL3V0aWwvbG90dGVyeVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBZXFCO0FBQ3JCLDJDQUEyQztBQUMzQyw4Q0FBOEM7QUFDOUMsNkNBQTRDO0FBNkQ1QyxNQUFhLE9BQU87SUEyQmhCLFlBQVksS0FBYyxFQUFFLE9BQWU7UUF4QjNDLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBRTNCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFJdEIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUdwQixpQkFBWSxHQUFpQyxFQUFFLENBQUM7UUFDaEQsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsV0FBTSxHQUFhLEVBQUUsQ0FBQztRQUN0QixpQkFBWSxHQUFjLENBQUMsQ0FBQztRQUM1QixtQkFBYyxHQUFvQixFQUFFLENBQUM7UUFDckMsa0JBQWEsR0FBVSxFQUFFLENBQUM7UUFFMUIsbUJBQWMsR0FBMkIsRUFBRSxDQUFDO1FBRTVDLGlCQUFZLEdBQVksQ0FBQyxDQUFDO1FBSXRCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFTyxJQUFJO1FBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENB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