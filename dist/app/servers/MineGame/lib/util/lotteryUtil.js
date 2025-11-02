"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHaveBet = exports.cratePharaohLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
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
            odds: 1
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
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
    generateWindow(twoStrategy = false) {
        const window = [];
        for (let i = 0; i < 4; i++) {
            let line = [];
            while (line.length !== 4) {
                line.push("A");
            }
            window.push(line);
        }
        return window;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9NaW5lR2FtZS9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FHcUI7QUF1RHJCLE1BQWEsT0FBTztJQWlCaEIsWUFBWSxLQUFjLEVBQUUsT0FBZTtRQWQzQyxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUVwQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLGlCQUFZLEdBQWlDLEVBQUUsQ0FBQztRQUNoRCxrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixXQUFNLEdBQWEsRUFBRSxDQUFDO1FBRXRCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBQzVCLG1CQUFjLEdBQW9CLEVBQUUsQ0FBQztRQUNyQyxrQkFBYSxHQUFVLEVBQUUsQ0FBQztRQUl0QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFPRCxXQUFXLENBQUMsUUFBZ0I7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsT0FB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