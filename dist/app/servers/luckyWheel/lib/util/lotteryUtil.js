"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLWLottery = exports.Lottery = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
class Lottery {
    constructor(bet) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.controlState = 1;
        this.totalBet = bet;
    }
    init() {
        this.totalWin = 0;
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
            result: this.value,
            profit: this.totalWin,
        };
    }
    randomLottery() {
        this.init();
        this.genResult();
        this.calculateEarnings();
    }
    genResult() {
        let num = 0, randomNum = (0, utils_1.random)(0, 10000), item;
        for (let value in constant_1.probability) {
            num += constant_1.probability[value];
            if (randomNum <= num) {
                item = value;
                break;
            }
        }
        this.value = parseInt(item);
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
    calculateEarnings() {
        this.totalWin = constant_1.ELEMENT_ODDS[this.value] * this.totalBet;
    }
}
exports.Lottery = Lottery;
function createLWLottery(bet) {
    return new Lottery(bet);
}
exports.createLWLottery = createLWLottery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9sdWNreVdoZWVsL2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQUF1RTtBQUN2RSw2Q0FBeUM7QUFtQnpDLE1BQWEsT0FBTztJQU9oQixZQUFZLEdBQVc7UUFOdkIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBSXhCLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBRXhCLENBQUM7SUFFTyxJQUFJO1FBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQU9ELGtCQUFrQixDQUFDLEdBQVk7UUFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFLRCxNQUFNO1FBQ0YsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDeEI7YUFBTTtZQUNILElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUN6QjtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFLTyxXQUFXO1FBQ2YsT0FBTztZQUNILE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSztZQUNsQixNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDeEIsQ0FBQztJQUNOLENBQUM7SUFNTyxhQUFhO1FBRWpCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdaLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUdqQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRU8sU0FBUztRQUNiLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQztRQUNoRCxLQUFLLElBQUksS0FBSyxJQUFJLHNCQUFXLEVBQUU7WUFDM0IsR0FBRyxJQUFJLHNCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUIsSUFBSSxTQUFTLElBQUksR0FBRyxFQUFFO2dCQUNsQixJQUFJLEdBQUcsS0FBSyxDQUFDO2dCQUNiLE1BQU07YUFDVDtTQUNKO1FBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUtPLGNBQWM7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFckIsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQzNELE1BQU07YUFDVDtZQUVELElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUMxRCxNQUFNO2FBQ1Q7U0FDSjtJQUNMLENBQUM7SUFPTyxpQkFBaUI7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyx1QkFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQzVELENBQUM7Q0FDSjtBQXZHRCwwQkF1R0M7QUFNRCxTQUFnQixlQUFlLENBQUMsR0FBVztJQUN2QyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFGRCwwQ0FFQyJ9