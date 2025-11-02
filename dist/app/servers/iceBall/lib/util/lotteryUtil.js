"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHaveBet = exports.crateIceBallLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const weights_1 = require("../config/weights");
const winLines_1 = require("../config/winLines");
class Lottery {
    constructor(newer, jackpot) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.jackpot = 0;
        this.splitElementsCount = 0;
        this.window = [];
        this.roundWindows = [];
        this.totalMultiple = 0;
        this.controlState = 1;
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.lineNum = 0;
        this.assist = false;
        this.yAxis = 0;
        this.newer = newer;
        this.jackpot = jackpot;
    }
    init() {
        this.totalWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.splitElementsCount = 0;
        this.roundWindows = [];
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.assist = false;
        this.yAxis = 0;
    }
    setTotalBet(bet, lineNum) {
        this.bet = bet;
        this.lineNum = lineNum;
        this.totalBet = bet * lineNum;
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
            roundWindows: this.roundWindows,
            totalMultiple: this.totalMultiple,
            assist: this.assist,
            yAxis: this.yAxis,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        const result = this.calculateEarnings(this.window);
        this.roundWindows = result.roundWindows;
        this.totalWin = result.totalWin;
        this.totalMultiple = result.totalMultiple;
        if (this.freeSpin) {
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
    freeSpinLottery() {
        let overly = 1;
        for (let i = 0; i < constant_1.FREE_SPIN_COUNT; i++) {
            const window = this.generateWindow();
            const _window = JSON.parse(JSON.stringify(window));
            const result = this.calculateEarnings(window);
            result.window = _window;
            result.overly = overly;
            this.freeSpinResult.push(result);
        }
    }
    selectWights() {
        this.weights = Object.keys(weights_1.weights).map((element) => {
            return { [element]: weights_1.weights[element].weight };
        });
    }
    generateWindow() {
        const num = 5;
        const window = [];
        this.needAssist();
        for (let i = 0; i < num; i++) {
            let line = [];
            while (line.length !== num) {
                const element = (0, utils_1.selectEle)(this.weights);
                if (element === constant_1.anyElement && (i === 0 || (!this.freeSpin && i === 1))) {
                    continue;
                }
                if (element === constant_1.specialElement) {
                    if (this.controlState !== 1 || this.freeSpin || this.splitElementsCount >= constant_1.MAX_SPECIAL_COUNT ||
                        this.assist) {
                        continue;
                    }
                    this.splitElementsCount++;
                }
                line.push(element);
            }
            window.push(line);
        }
        if (this.assist && !this.freeSpin) {
            window[this.yAxis] = window[this.yAxis].map(v => constant_1.anyElement);
            const selectLines = winLines_1.winLines.slice(0, this.lineNum);
            const result = selectLines.find((line) => {
                const elementLine = line.map((l, i) => window[i][l - 1]);
                elementLine.forEach((element, index) => {
                    if (element === constant_1.anyElement) {
                        elementLine[index] = elementLine[0];
                    }
                });
                const lineResult = this.calculateLineResult(elementLine);
                return !!lineResult.elementType;
            });
            if (!result) {
                this.assist = false;
                this.yAxis = 0;
                return this.generateWindow();
            }
        }
        return window;
    }
    needAssist() {
        if (!this.freeSpin && Math.random() < 0.01 && this.controlState === 1) {
            this.assist = true;
            this.yAxis = [2, 3, 4][(0, utils_1.random)(0, 2)];
        }
    }
    calculateEarnings(window) {
        const selectLines = winLines_1.winLines.slice(0, this.lineNum);
        const roundWindows = [];
        let { winLines, profit, clearPositions, totalMultiple } = this.eliminateWindowElements(window, selectLines, roundWindows.length);
        const oneRound = {
            window,
            clearPositions,
            winLines,
            profit,
        };
        roundWindows.push(oneRound);
        while (winLines.length) {
            const { newly, window: newWindow } = this.subsequentWindow(window, clearPositions);
            window = newWindow;
            const result = this.eliminateWindowElements(window, selectLines, roundWindows.length);
            const oneRound = {
                window: newWindow,
                clearPositions: result.clearPositions,
                winLines: result.winLines,
                profit: result.profit,
                newly,
            };
            profit += result.profit;
            winLines = result.winLines;
            clearPositions = result.clearPositions;
            totalMultiple += result.totalMultiple;
            roundWindows.push(oneRound);
        }
        const lastWinLines = roundWindows[roundWindows.length - 1].winLines;
        const scatterProfit = this.judgeFreeSpin(lastWinLines);
        roundWindows[roundWindows.length - 1].profit = roundWindows[roundWindows.length - 1].profit + scatterProfit;
        profit += scatterProfit;
        return { totalWin: profit, roundWindows, totalMultiple };
    }
    eliminateWindowElements(window, selectLines, roundCount) {
        let winLines = [], profit = 0, clearPositions = [], totalMultiple = 0;
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            elementLine.forEach((element, index) => {
                if (element === constant_1.anyElement) {
                    elementLine[index] = elementLine[0];
                }
            });
            const lineResult = this.calculateLineResult(elementLine);
            if (lineResult.elementType) {
                const odds = weights_1.weights[lineResult.elementType].clearAward[lineResult.rewardType];
                const lineProfit = this.bet * odds;
                profit += lineProfit;
                totalMultiple += odds;
                const linkIds = transcript.slice(0, lineResult.linkNum);
                line.slice(0, lineResult.linkNum).map((l, i) => clearPositions.push({ x: i, y: l - 1 }));
                winLines.push({ index, linkNum: lineResult.linkNum,
                    linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });
        if (this.freeSpin) {
            let odds = roundCount + 1;
            if (roundCount >= 5) {
                odds = 8;
            }
            profit *= odds;
        }
        return { winLines, profit, clearPositions: this.deduplication(clearPositions), totalMultiple };
    }
    deduplication(arr) {
        const strSet = new Set();
        return arr.filter(c => {
            const s = `${c.x}${c.y}`;
            if (!strSet.has(s)) {
                strSet.add(s);
                return true;
            }
            return false;
        });
    }
    judgeFreeSpin(winLines) {
        let profit = 0;
        if (this.splitElementsCount >= 3 && !this.freeSpin) {
            this.freeSpin = true;
            const odds = weights_1.weights[constant_1.specialElement].clearAward[this.splitElementsCount - 3];
            profit = odds * this.bet;
            winLines.push({ index: 89, linkNum: this.splitElementsCount,
                linkIds: (new Array(this.splitElementsCount)).fill(constant_1.specialElement), money: profit, type: constant_1.specialElement, multiple: odds });
        }
        return profit;
    }
    subsequentWindow(window, clearPositions) {
        const tag = 'del';
        let windowTranscript = (0, utils_1.clone)(window);
        clearPositions.forEach(c => windowTranscript[c.x][c.y] = tag);
        for (let i in windowTranscript) {
            for (let j = windowTranscript[i].length - 1; j > 0; j--) {
                if (windowTranscript[i][j] === tag) {
                    const index = (0, utils_1.findLastIndex)(v => v !== tag)(windowTranscript[i].slice(0, j));
                    if (index !== -1) {
                        [windowTranscript[i][j], windowTranscript[i][index]] =
                            [windowTranscript[i][index], windowTranscript[i][j]];
                    }
                }
            }
        }
        const completionWeights = Object.keys(weights_1.weights).map(element => {
            return (element === constant_1.specialElement && (this.freeSpin || this.assist)) ? { key: element, value: 0 } :
                { key: element, value: weights_1.weights[element].weight };
        });
        const newly = [];
        for (let i in windowTranscript) {
            const completionColumn = [];
            for (let j = windowTranscript[i].length - 1; j >= 0; j--) {
                if (windowTranscript[i][j] !== tag) {
                    continue;
                }
                let element = (this.assist && this.yAxis === parseInt(i)) ? constant_1.anyElement :
                    (0, utils_1.selectElement)(completionWeights);
                if (element === constant_1.anyElement && (parseInt(i) === 0 || (!this.freeSpin && parseInt(i) === 1))) {
                    while (element === constant_1.anyElement) {
                        element = (0, utils_1.selectElement)(completionWeights);
                    }
                }
                if (element === constant_1.specialElement) {
                    if (this.splitElementsCount === 5) {
                        while (element === constant_1.specialElement) {
                            element = (0, utils_1.selectElement)(completionWeights);
                        }
                    }
                    else {
                        this.splitElementsCount++;
                    }
                }
                windowTranscript[i][j] = element;
                completionColumn.push(windowTranscript[i][j]);
            }
            newly.push(completionColumn);
        }
        return { window: windowTranscript, newly };
    }
    calculateLineResult(elementLine) {
        const firstElement = elementLine[0];
        let result = { elementType: null, rewardType: 0, linkNum: 0 };
        if (firstElement === constant_1.specialElement) {
            return result;
        }
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
}
exports.Lottery = Lottery;
function crateIceBallLottery(newer, jackpotGoldNum) {
    return new Lottery(newer, jackpotGoldNum);
}
exports.crateIceBallLottery = crateIceBallLottery;
function isHaveBet(betNum, lineNum) {
    return constant_1.oddsList.includes(betNum) && constant_1.lineNumList.includes(lineNum);
}
exports.isHaveBet = isHaveBet;
function test() {
    const lottery = crateIceBallLottery(false, 0);
    return lottery.setTotalBet(10, 18)
        .result();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9pY2VCYWxsL2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQUlxQjtBQUNyQiw2Q0FBeUY7QUFDekYsK0NBQTBDO0FBQzFDLGlEQUE4RDtBQTJFOUQsTUFBYSxPQUFPO0lBbUJoQixZQUFZLEtBQWMsRUFBRSxPQUFlO1FBaEIzQyxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQix1QkFBa0IsR0FBRyxDQUFDLENBQUM7UUFFdkIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixpQkFBWSxHQUFVLEVBQUUsQ0FBQztRQUN6QixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixpQkFBWSxHQUFjLENBQUMsQ0FBQztRQUM1QixhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLG1CQUFjLEdBQVUsRUFBRSxDQUFDO1FBQzNCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUN4QixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBSWQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUVPLElBQUk7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFRRCxXQUFXLENBQUMsR0FBVyxFQUFFLE9BQWU7UUFDcEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUM7UUFDOUIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQVFELGtCQUFrQixDQUFDLEdBQVk7UUFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFLRCxNQUFNO1FBRUYsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBR3BCLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3hCO2FBQU07WUFDSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDekI7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBS08sV0FBVztRQUNmLE9BQU87WUFDSCxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDakMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO1NBQ3RDLENBQUM7SUFDTixDQUFDO0lBS08sYUFBYTtRQUVqQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHWixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUdwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBRzFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFLTyxjQUFjO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBR3JCLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUMzRCxNQUFNO2FBQ1Q7WUFHRCxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUQsTUFBTTthQUNUO1NBQ0o7SUFDTCxDQUFDO0lBTU8sZUFBZTtRQUNuQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFHZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsMEJBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUV0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFHbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBUSxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxNQUFNLEdBQUksT0FBTyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBRXZCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3BDO0lBQ0wsQ0FBQztJQUtPLFlBQVk7UUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFPLENBQW1CLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbkUsT0FBTyxFQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFLRCxjQUFjO1FBRVYsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBR2xCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUdsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVkLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0JBRXhCLE1BQU0sT0FBTyxHQUFHLElBQUEsaUJBQVMsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBR3hDLElBQUksT0FBTyxLQUFLLHFCQUFVLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNwRSxTQUFTO2lCQUNaO2dCQUdELElBQUksT0FBTyxLQUFLLHlCQUFjLEVBQUU7b0JBQzVCLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksNEJBQWlCO3dCQUN4RixJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNiLFNBQVM7cUJBQ1o7b0JBQ0QsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7aUJBQzdCO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdEI7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCO1FBR0QsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQVUsQ0FBQyxDQUFDO1lBRzdELE1BQU0sV0FBVyxHQUFlLG1CQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEUsTUFBTSxNQUFNLEdBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUV0QyxNQUFNLFdBQVcsR0FBa0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDbkMsSUFBSSxPQUFPLEtBQUsscUJBQVUsRUFBRTt3QkFDeEIsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDdkM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBR0gsTUFBTSxVQUFVLEdBQWUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUVyRSxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDVCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ2YsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDaEM7U0FDSjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFLRCxVQUFVO1FBRU4sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsRUFBRTtZQUVuRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQU0sRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7SUFLTyxpQkFBaUIsQ0FBQyxNQUF1QjtRQUU3QyxNQUFNLFdBQVcsR0FBZSxtQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBR3RFLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFDLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9ILE1BQU0sUUFBUSxHQUFHO1lBQ2IsTUFBTTtZQUNOLGNBQWM7WUFDZCxRQUFRO1lBQ1IsTUFBTTtTQUNULENBQUM7UUFHRixZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRzVCLE9BQU8sUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUVwQixNQUFNLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRWpGLE1BQU0sR0FBRyxTQUFTLENBQUM7WUFDbkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sUUFBUSxHQUFHO2dCQUNiLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixjQUFjLEVBQUUsTUFBTSxDQUFDLGNBQWM7Z0JBQ3JDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtnQkFDekIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO2dCQUNyQixLQUFLO2FBQ1IsQ0FBQztZQUVGLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3hCLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzNCLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO1lBQ3ZDLGFBQWEsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDO1lBRXRDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0I7UUFFRCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDcEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2RCxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztRQUM1RyxNQUFNLElBQUksYUFBYSxDQUFDO1FBRXhCLE9BQU8sRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUMsQ0FBQztJQUMzRCxDQUFDO0lBUU8sdUJBQXVCLENBQUMsTUFBYyxFQUFFLFdBQXVCLEVBQUUsVUFBa0I7UUFJdkYsSUFBSSxRQUFRLEdBQWMsRUFBRSxFQUV4QixNQUFNLEdBQUcsQ0FBQyxFQUVWLGNBQWMsR0FBRyxFQUFFLEVBQ25CLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFFdEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUVoQyxNQUFNLFdBQVcsR0FBa0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RSxNQUFNLFVBQVUsR0FBRyxJQUFBLGFBQUssRUFBQyxXQUFXLENBQUMsQ0FBQztZQUd0QyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNuQyxJQUFJLE9BQU8sS0FBSyxxQkFBVSxFQUFFO29CQUN4QixXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN2QztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBR0gsTUFBTSxVQUFVLEdBQWUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBR3JFLElBQUksVUFBVSxDQUFDLFdBQVcsRUFBRTtnQkFFeEIsTUFBTSxJQUFJLEdBQUcsaUJBQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7Z0JBQ25DLE1BQU0sSUFBSSxVQUFVLENBQUM7Z0JBR3JCLGFBQWEsSUFBSSxJQUFJLENBQUM7Z0JBQ3RCLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV2RixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTztvQkFDOUMsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDbkY7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksSUFBSSxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDMUIsSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUNqQixJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQ1o7WUFFRCxNQUFNLElBQUksSUFBSSxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsYUFBYSxFQUFDLENBQUM7SUFDakcsQ0FBQztJQU1PLGFBQWEsQ0FBQyxHQUE2QjtRQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNsQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNkLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFNRCxhQUFhLENBQUMsUUFBbUI7UUFDN0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRWYsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNoRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixNQUFNLElBQUksR0FBRyxpQkFBTyxDQUFDLHlCQUFjLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sR0FBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUMxQixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtnQkFDdkQsT0FBTyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQWMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLHlCQUFjLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDbEk7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBT08sZ0JBQWdCLENBQUMsTUFBZSxFQUFFLGNBQXdDO1FBRTlFLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQztRQUNsQixJQUFJLGdCQUFnQixHQUFHLElBQUEsYUFBSyxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBRzlELEtBQUssSUFBSSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7WUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JELElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO29CQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFBLHFCQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3RSxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDZCxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNqRCxDQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdEO2lCQUNKO2FBQ0o7U0FDSjtRQUdELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pELE9BQU8sQ0FBQyxPQUFPLEtBQUsseUJBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDaEcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO1FBSUgsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLEtBQUssSUFBSSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7WUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7WUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RELElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO29CQUNoQyxTQUFTO2lCQUNaO2dCQUdELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBVSxDQUFDLENBQUM7b0JBQ3BFLElBQUEscUJBQWEsRUFBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUVyQyxJQUFJLE9BQU8sS0FBSyxxQkFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDeEYsT0FBTyxPQUFPLEtBQUsscUJBQVUsRUFBRTt3QkFDM0IsT0FBTyxHQUFHLElBQUEscUJBQWEsRUFBQyxpQkFBaUIsQ0FBQyxDQUFDO3FCQUM5QztpQkFDSjtnQkFFRCxJQUFJLE9BQU8sS0FBSyx5QkFBYyxFQUFFO29CQUM1QixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sT0FBTyxLQUFLLHlCQUFjLEVBQUU7NEJBQy9CLE9BQU8sR0FBRyxJQUFBLHFCQUFhLEVBQUMsaUJBQWlCLENBQUMsQ0FBQzt5QkFDOUM7cUJBQ0o7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7cUJBQzdCO2lCQUNKO2dCQUVELGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDakMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakQ7WUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDaEM7UUFFRCxPQUFPLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBQyxDQUFBO0lBQzdDLENBQUM7SUFNTyxtQkFBbUIsQ0FBQyxXQUEwQjtRQUVsRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxNQUFNLEdBQWUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDO1FBR3hFLElBQUksWUFBWSxLQUFLLHlCQUFjLEVBQUU7WUFDakMsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFHRCxJQUFJLFlBQVksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDakMsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFFRCxRQUFRLElBQUksRUFBRTtZQUVWLEtBQUssV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixNQUFNO2FBQ1Q7WUFHRCxLQUFLLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sS0FBSyxZQUFZLENBQUUsQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztnQkFDbEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixNQUFNO2FBQ1Q7WUFHRCxLQUFLLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztnQkFDbEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUVuQixNQUFNO2FBQ1Q7WUFFRDtnQkFFSSxNQUFNO1NBQ2I7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUF2Z0JELDBCQXVnQkM7QUFRRCxTQUFnQixtQkFBbUIsQ0FBQyxLQUFjLEVBQUUsY0FBc0I7SUFDdEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUZELGtEQUVDO0FBT0QsU0FBZ0IsU0FBUyxDQUFFLE1BQWMsRUFBRSxPQUFlO0lBQ3RELE9BQU8sbUJBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksc0JBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUZELDhCQUVDO0FBSUQsU0FBUyxJQUFJO0lBQ1QsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxFQUFHLENBQUMsQ0FBQyxDQUFDO0lBRS9DLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBRTdCLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLENBQUMifQ==