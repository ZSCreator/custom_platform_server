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
        this.window = [];
        this.roundWindows = [];
        this.totalMultiple = 0;
        this.awards = [];
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
        this.roundWindows = [];
        this.awards = [];
        this.winningDetails = [];
        this.clearElements = [];
        this.freeSpinResult = [];
    }
    setTotalBet(totalBet) {
        this.totalBet = totalBet;
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
        this.scatterCount = this.calculatefreeSpin(this.window);
        const result = this.calculateEarnings(this.window);
        this.roundWindows = result.roundWindows;
        this.totalWin = result.totalWin;
        this.awards = result.awards;
        this.totalMultiple = result.totalMultiple;
        this.winningDetails = result.winningDetails;
        this.clearElements = result.clearElements;
        if (this.scatterCount >= 4) {
            this.freeSpinLottery();
        }
    }
    freeSpinLottery() {
        this.freeSpin = true;
        let len = 10;
        let Idx = 0;
        do {
            Idx++;
            const window = this.generateWindow(true);
            let scatterCount = this.calculatefreeSpin(window);
            const result = this.calculateEarnings(window);
            result.winningDetails;
            result.window = window;
            result.freeSpin = false;
            if (scatterCount >= 3 && len < 20) {
                len += 5;
                result.freeSpin = true;
            }
            this.freeSpinResult.push(result);
        } while (Idx < len);
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
    generateWindow(twoStrategy = false) {
        const window = [];
        for (let i = 0; i < 6; i++) {
            let line = [];
            while (line.length !== 5) {
                const element = utils.selectEle(this.weights);
                line.push(element);
            }
            window.push(line);
        }
        if (twoStrategy && utils.random(0, 100) <= 30) {
            window[utils.random(0, 5)][utils.random(0, 4)] = "BOW";
        }
        return window;
    }
    calculateEarnings(window) {
        let roundWindows = [];
        let conversionPoints = this.eliminateWindowElements(window);
        let clearElements = [];
        let totalMultiple = 0;
        let awards = [];
        let winningDetails = [];
        while (!utils.isVoid(conversionPoints)) {
            const { result: winAward, winningDetails: Tmp } = this.calculateClearElementProfit(conversionPoints);
            winningDetails.push(Tmp);
            clearElements.push([conversionPoints]);
            totalMultiple += winAward.windowAward;
            awards.push(winAward.windowAward * this.totalBet);
            const result = this.subsequentWindow(window, conversionPoints);
            roundWindows.push(result.position);
            roundWindows.push(result.newly);
            roundWindows.push(result.window);
            window = result.window;
            conversionPoints = this.eliminateWindowElements(window);
        }
        let odds = 1;
        if (this.IsHasBOW(window)) {
            odds = 2;
        }
        let totalWin = totalMultiple * this.totalBet * odds;
        let result = {
            clearElements,
            totalMultiple,
            awards,
            totalWin,
            window,
            winningDetails,
            roundWindows,
            odds: odds,
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
        let conversionPoints = {};
        for (let type in typePoints) {
            let Count = 8;
            if (type == "Scatter") {
                Count = 4;
            }
            if (typePoints[type].length >= Count) {
                conversionPoints[type] = typePoints[type];
            }
        }
        return conversionPoints;
    }
    subsequentWindow(window, clearCoordinates) {
        let windowTranscript = utils.clone(window);
        let clears = [];
        for (let e in clearCoordinates) {
            clearCoordinates[e].forEach(coordinates => {
                clears.push(coordinates);
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
        let completionWeights = Object.keys(weightsC.weights).map(element => {
            return { key: element, value: weightsC.weights[element].weight };
        });
        completionWeights = completionWeights.filter(c => c.key != "Scatter");
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
    calculatefreeSpin(window) {
        let Count = 0;
        for (const elements of window) {
            for (const element of elements) {
                if (element == "Scatter") {
                    Count++;
                }
            }
        }
        return Count;
    }
    IsHasBOW(window) {
        let Count = 0;
        for (const elements of window) {
            for (const element of elements) {
                if (element == "BOW") {
                    return true;
                }
            }
        }
        return false;
    }
    calculateClearElementProfit(clearCoordinates) {
        let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0 };
        let winningDetails = [];
        for (let e in clearCoordinates) {
            result[e] = {};
            const elementOddsConfig = weightsC.weights[e].clearAward;
            const len = clearCoordinates[e].length;
            let odds;
            if (e == "Scatter") {
                if (len == 4) {
                    odds = elementOddsConfig[0];
                }
                else if (len == 5) {
                    odds = elementOddsConfig[1];
                }
                else if (len >= 6) {
                    odds = elementOddsConfig[2];
                }
            }
            else {
                if (len == 8 || len == 9) {
                    odds = elementOddsConfig[0];
                }
                else if (len == 10 || len == 11) {
                    odds = elementOddsConfig[1];
                }
                else if (len >= 12) {
                    odds = elementOddsConfig[2];
                }
            }
            winningDetails.push({ type: e, num: len, odds, win: odds * this.totalBet });
            result.windowAward += odds;
            result[e]['group'] = { award: odds };
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
function isHaveBet(betNum) {
    return constant_1.baseBetList.includes(betNum);
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
function isEqualSet(setOne, setTwo) {
    return new Set([...setOne].filter(x => !setTwo.has(x))).size == 0 &&
        new Set([...setTwo].filter(x => !setOne.has(x))).size == 0;
}
function test(totalBet) {
    const lottery = cratePharaohLottery(false, 0);
    return lottery.setTotalBet(totalBet)
        .setTotalBet(10)
        .result();
}
console.time('1');
for (let i = 0; i < 1; i++) {
    let result = test(1);
    console.log(JSON.stringify(result));
}
console.timeEnd('1');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DYW5keU1vbmV5L2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQU9xQjtBQUNyQiwyQ0FBMkM7QUFDM0MsOENBQThDO0FBd0Q5QyxNQUFhLE9BQU87SUFzQmhCLFlBQVksS0FBYyxFQUFFLE9BQWU7UUFuQjNDLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBSXBCLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFDcEIsaUJBQVksR0FBaUMsRUFBRSxDQUFDO1FBQ2hELGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFFdEIsaUJBQVksR0FBYyxDQUFDLENBQUM7UUFDNUIsbUJBQWMsR0FBc0IsRUFBRSxDQUFDO1FBQ3ZDLGtCQUFhLEdBQVUsRUFBRSxDQUFDO1FBRTFCLG1CQUFjLEdBQTJCLEVBQUUsQ0FBQztRQUt4QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBRXZCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFj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