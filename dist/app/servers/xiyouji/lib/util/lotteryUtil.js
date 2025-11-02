"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crateXYJLottery = exports.getIconProbability = exports.personalInternalControl = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const weights_1 = require("../config/weights");
const winLines_1 = require("../config/winLines");
const award_1 = require("../config/award");
const WILD_MAX_NUM = 4;
const BONUS_MAX_NUM = 3;
const isHaveLine = (lineNum) => constant_1.linesNum.includes(lineNum);
exports.isHaveLine = isHaveLine;
class Lottery {
    constructor(newer, roulette, jackpot) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.jackpot = 0;
        this.bonusCount = 0;
        this.freeSpin = false;
        this.window = [];
        this.characterWindow = [];
        this.winLines = [];
        this.windowsAward = [];
        this.bigWin = false;
        this.luckyFiveLine = false;
        this.fiveLine = false;
        this.bonusGame = false;
        this.rounds = [];
        this.characters = [];
        this.originCharacters = [];
        this.hasAddCharacter = '';
        this.addCharacterProbability = 0;
        this.winPercentage = 0;
        this.totalMultiple = 0;
        this.peachCount = 0;
        this.controlState = 1;
        this.newer = newer;
        this.roulette = roulette;
        this.jackpot = jackpot;
    }
    init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.bonusCount = 0;
        this.peachCount = 0;
        this.luckyFiveLine = false;
        this.fiveLine = false;
        this.bonusGame = false;
        this.bigWin = false;
        this.windowsAward = [];
        this.characterWindow = [];
        this.hasAddCharacter = '';
        this.rounds = [];
        this.characters = [];
    }
    setBetAndLineNum(bet, lineNum) {
        this.bet = bet;
        this.lineNum = lineNum;
        return this;
    }
    setCharacterAndWinPercentage(characters, winPercentage) {
        this.originCharacters = [...characters];
        this.winPercentage = winPercentage;
        return this;
    }
    setFreeSpin(free) {
        this.freeSpin = free;
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
        this.addCharacterProbability = getIconProbability(this.winPercentage, this.lineNum);
        if (this.controlState === 1) {
            this.randomLottery();
        }
        else {
            this.controlLottery();
        }
        this.characters = [...this.originCharacters];
        if (this.hasAddCharacter) {
            this.characters.push(this.hasAddCharacter);
        }
        return this.stripResult();
    }
    stripResult() {
        return {
            window: this.window,
            luckyFiveLines: this.luckyFiveLine,
            fiveLines: this.fiveLine,
            roundsAward: this.windowsAward,
            allTotalWin: this.totalWin,
            jackpotWin: this.jackpotWin,
            multiple: this.totalMultiple,
            peachNum: this.peachCount,
            bonusGame: this.bonusGame,
            rounds: this.rounds,
            characters: this.characters,
            characterWindow: this.characterWindow
        };
    }
    freeResult() {
        this.setFreeSpin(true);
        this.selectWights();
        const freeSpinResult = {
            results: [],
            totalWin: 0,
            boom: false,
            jackpotWin: 0,
            multiple: 0,
        };
        for (let i = 0; i < 5; i++) {
            this.randomLottery();
            setFreeSpinResult(freeSpinResult, this.stripResult());
        }
        if (freeSpinResult.totalWin === 0) {
            this.randomLottery();
            let onceResult = this.stripResult();
            while (onceResult.allTotalWin === 0) {
                this.randomLottery();
                onceResult = this.stripResult();
            }
            freeSpinResult.results.pop();
            setFreeSpinResult(freeSpinResult, this.stripResult());
        }
        return freeSpinResult;
    }
    randomLottery() {
        this.init();
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
        const roulette = this.roulette;
        if (this.newer) {
            this.weights = (0, utils_1.clone)(weights_1.defaultWeights['1']);
        }
        else if (this.freeSpin) {
            this.weights = (0, utils_1.clone)(weights_1.freeSpinWeight);
        }
        else {
            this.weights = (0, utils_1.clone)(weights_1.defaultWeights[roulette]);
            if (this.overallControl) {
                this.weights.wild = this.weights.wild.map((element, index) => {
                    if (index !== 0 && index !== 4) {
                        return element - (roulette === '1' ? 23.5 : roulette === '2' ? 15 : 13.6);
                    }
                    return element;
                });
            }
            if (this.singleControlOne) {
                this.weights.wild = this.weights.wild.map((element, index) => {
                    if (index !== 0 && index !== 4) {
                        return element + (roulette === '2' ? 18.4 : 11.8);
                    }
                    return element;
                });
            }
            if (this.singleControlTwo) {
                this.weights.wild = this.weights.wild.map((element, index) => {
                    if (index !== 0 && index !== 4) {
                        return element + (roulette === '2' ? 9 : 19.9);
                    }
                    return element;
                });
            }
        }
        if (this.jackpot < this.bet * 70 * 2) {
            this.weights[constant_1.monkey][1] = 0;
            this.weights.wild[1] = 0;
        }
        else if (this.jackpot < this.bet * constant_1.maxAward) {
            this.weights[constant_1.monkey][4] = 0;
        }
    }
    generateWindow() {
        const elementKeys = Object.keys(this.weights);
        let wildCount = 0;
        for (let i = 0; i < constant_1.column; i++) {
            const elementSet = elementKeys.map(element => {
                return { [element]: this.weights[element][i] };
            });
            let line = [], characterLine = [];
            while (line.length < constant_1.row) {
                const element = (0, utils_1.selectEle)(elementSet);
                if (element === constant_1.wild) {
                    if (wildCount === WILD_MAX_NUM) {
                        continue;
                    }
                    wildCount++;
                }
                if (element === constant_1.bonus) {
                    if (this.bonusCount === BONUS_MAX_NUM) {
                        continue;
                    }
                    this.bonusCount++;
                }
                const characterElement = { id: element, scatter: null };
                if (!this.hasAddCharacter && this.isNeedAddCharacters() && element !== constant_1.bonus && element !== constant_1.wild) {
                    const differences = (0, utils_1.difference)(constant_1.characterIcon, this.originCharacters);
                    if (differences.length > 0) {
                        characterElement.scatter = differences[Math.floor((0, utils_1.random)(0, differences.length - 1))];
                        this.hasAddCharacter = characterElement.scatter;
                    }
                }
                characterLine.push(characterElement);
                line.push(element);
            }
            this.characterWindow.push(characterLine);
            this.window.push(line);
        }
    }
    calculateEarnings() {
        let windowResult = this.calculateWindowEarnings(this.window);
        this.bonusCount = 0;
        this.accumulateAwardResult(windowResult);
        let window = this.window;
        while (windowResult.dispears.size > 0) {
            this.peachCount++;
            const result = this.subsequentWindow(window, windowResult);
            this.rounds.push(result.clientClearPoints, result.completion);
            windowResult = this.calculateWindowEarnings(result.window);
            this.accumulateAwardResult(windowResult);
            window = result.window;
        }
    }
    subsequentWindow(window, lastWindowResult) {
        let windowTranscript = (0, utils_1.clone)(window);
        let clientClearPoints = [];
        lastWindowResult.dispears.forEach((point) => {
            windowTranscript[point[0]][point[1]] = null;
            clientClearPoints.push([Number(point[0]) + 1, Number(point[1]) + 1]);
        });
        elementsLanded(windowTranscript);
        const weights = weights_1.defaultWeights[this.roulette];
        const elementKeys = Object.keys(weights);
        const jackpotLimitOne = this.jackpot < this.bet * 300 * 2;
        let completion = [];
        for (let i = 0; i < windowTranscript.length; i++) {
            const elementSet = elementKeys.map((element) => {
                if (element === constant_1.bonus || element === constant_1.wild) {
                    return { [element]: 0 };
                }
                if (jackpotLimitOne && i === 4 && element === constant_1.monkey) {
                    return { [element]: 0 };
                }
                return { [element]: weights[element][i] };
            });
            for (let j = 0; j < windowTranscript[i].length; j++) {
                if (windowTranscript[i][j] == null) {
                    windowTranscript[i][j] = (0, utils_1.selectEle)(elementSet);
                    completion.push({ x: i + 1, y: j + 1, id: windowTranscript[i][j] });
                }
            }
        }
        return {
            window: windowTranscript,
            completion,
            clientClearPoints
        };
    }
    accumulateAwardResult(windowResult) {
        this.totalWin += windowResult.totalWin;
        this.jackpotWin += windowResult.jackpotWin;
        this.windowsAward.push(windowResult);
        this.totalMultiple += windowResult.multiple;
        if (windowResult.bonusGame) {
            this.bonusGame = true;
        }
        if (windowResult.luckyFiveLines) {
            this.luckyFiveLine = true;
        }
        if (windowResult.fiveLines) {
            this.fiveLine = true;
        }
    }
    calculateWindowEarnings(window) {
        const peachOdds = calculatePeachOdds(this.peachCount);
        const selectLines = winLines_1.winLines.slice(0, this.lineNum);
        const windowResult = {
            totalWin: 0,
            winLines: [],
            luckyFiveLines: false,
            bonusGame: false,
            jackpotWin: 0,
            dispears: new Set(),
            fiveLines: false,
            bigWin: false,
            multiple: 0
        };
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            elementLine.forEach((element, index) => {
                if (element === constant_1.wild && elementLine[index - 1] !== constant_1.bonus) {
                    elementLine[index] = elementLine[index - 1];
                }
            });
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                line.slice(0, lineResult.linkNum).forEach((num, i) => {
                    windowResult.dispears.add(i.toString() + (num - 1));
                });
                const odds = award_1.award[lineResult.elementType][lineResult.rewardType];
                windowResult.multiple += odds;
                const lineProfit = this.freeSpin ? odds * this.bet * 5 * peachOdds : odds * this.bet * peachOdds;
                windowResult.totalWin += lineProfit;
                if (lineResult.linkNum === 5) {
                    windowResult.fiveLines = true;
                    if (lineResult.elementType === constant_1.monkey && index === 0) {
                        windowResult.luckyFiveLines = true;
                    }
                }
                if (lineResult.elementType === constant_1.monkey) {
                    windowResult.jackpotWin += lineProfit;
                }
                const linkIds = transcript.slice(0, lineResult.linkNum);
                windowResult.winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType });
            }
        });
        if (this.bonusCount === BONUS_MAX_NUM) {
            windowResult.bonusGame = true;
            window.forEach((column, index) => {
                column.forEach((element, i) => {
                    if (element === constant_1.bonus) {
                        windowResult.dispears.add(index.toString() + i);
                    }
                });
            });
        }
        if (windowResult.totalWin >= this.bet * this.lineNum * 5) {
            windowResult.bigWin = true;
        }
        return windowResult;
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine[0];
        let result = { elementType: null, rewardType: 0, linkNum: 0 };
        switch (true) {
            case elementLine.every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = 3;
                result.linkNum = 5;
                break;
            }
            case elementLine.slice(0, 4).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = 2;
                result.linkNum = 4;
                break;
            }
            case elementLine.slice(0, 3).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = 1;
                result.linkNum = 3;
                break;
            }
            case constant_1.specialElements.includes(firstElement) &&
                elementLine.slice(0, 2).every(element => element === firstElement):
                {
                    result.elementType = firstElement;
                    result.rewardType = 0;
                    result.linkNum = 2;
                    break;
                }
        }
        return result;
    }
    isNeedAddCharacters() {
        if (this.freeSpin || this.controlState !== 1) {
            return false;
        }
        return Math.random() < this.addCharacterProbability;
    }
}
exports.Lottery = Lottery;
function calculatePeachOdds(peachNum) {
    const num = peachNum + 1;
    if (num > 6)
        return 6;
    return num;
}
function elementsLanded(window) {
    let wildCount = 0;
    for (let i = 0; i < window.length; i++) {
        for (let j = window[i].length - 1; j > 0; j--) {
            if (window[i][j] === null) {
                const index = (0, utils_1.findLastIndex)(p => p !== null)(window[i].slice(0, j));
                if (index !== -1) {
                    [window[i][j], window[i][index]] = [window[i][index], window[i][j]];
                }
            }
            if (window[i][j] === constant_1.wild) {
                wildCount++;
            }
        }
    }
    return wildCount;
}
function personalInternalControl(recordCount, roulette, winPercentage, overallControl) {
    if (!overallControl && recordCount >= 10) {
        if (roulette === '1') {
            return [false, false];
        }
        const rightValue = roulette === '2' ? 0.55 : 0.25;
        const leftValue = roulette == '2' ? 0.35 : 0.05;
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
function getIconProbability(winPercentage, lineNum) {
    if (lineNum === 25)
        return 0.0027;
    if (lineNum === 15)
        return 0.0035;
    if (lineNum === 9)
        return 0.0025;
    if (lineNum < 5)
        return 0.007;
    return winPercentage < 0.25 ? (0.25 - winPercentage) / 85 : 0.004;
}
exports.getIconProbability = getIconProbability;
function crateXYJLottery(newer, roulette, jackpotGoldNum) {
    return new Lottery(newer, roulette, jackpotGoldNum);
}
exports.crateXYJLottery = crateXYJLottery;
function setFreeSpinResult(freeSpinResult, onceResult) {
    freeSpinResult.jackpotWin += onceResult.allTotalWin;
    freeSpinResult.totalWin += onceResult.allTotalWin;
    freeSpinResult.multiple += onceResult.multiple;
    if (onceResult.luckyFiveLines) {
        freeSpinResult.boom = true;
    }
    const firstRound = Reflect.get(onceResult, 'window');
    Reflect.deleteProperty(onceResult, 'window');
    Reflect.deleteProperty(onceResult, 'characters');
    Reflect.deleteProperty(onceResult, 'characterWindow');
    freeSpinResult.results.push({ firstRound, oneFreeResult: onceResult });
}
function test() {
    const lottery = crateXYJLottery(false, '1', 0);
    const result = lottery.setBetAndLineNum(1, 3)
        .setTotalBet(3)
        .setCharacterAndWinPercentage(['1'], 0.3)
        .setInternalControl(false, false, false)
        .result();
    return result;
}
function test1() {
    const lottery = crateXYJLottery(false, '1', 0);
    const result = lottery.setBetAndLineNum(1, 3)
        .setTotalBet(3)
        .setCharacterAndWinPercentage(['1'], 0.3)
        .setInternalControl(false, false, false)
        .freeResult();
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy94aXlvdWppL2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQVdxQjtBQUNyQiw2Q0FBcUc7QUFDckcsK0NBQWlFO0FBQ2pFLGlEQUE4RDtBQUM5RCwyQ0FBc0M7QUFHdEMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBR3ZCLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQXdHakIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLG1CQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQTdELFFBQUEsVUFBVSxjQUFtRDtBQWtDMUUsTUFBYSxPQUFPO0lBa0NoQixZQUFZLEtBQWMsRUFBRSxRQUF5QixFQUFFLE9BQWU7UUEzQnRFLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLFdBQU0sR0FBb0IsRUFBRSxDQUFDO1FBQzdCLG9CQUFlLEdBQTJDLEVBQUUsQ0FBQztRQUM3RCxhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLGlCQUFZLEdBQW1CLEVBQUUsQ0FBQztRQUNsQyxXQUFNLEdBQVksS0FBSyxDQUFDO1FBQ3hCLGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBQy9CLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsY0FBUyxHQUFZLEtBQUssQ0FBQztRQUMzQixXQUFNLEdBQVUsRUFBRSxDQUFDO1FBQ25CLGVBQVUsR0FBYSxFQUFFLENBQUM7UUFDMUIscUJBQWdCLEdBQWEsRUFBRSxDQUFDO1FBQ2hDLG9C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