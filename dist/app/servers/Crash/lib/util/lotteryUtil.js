"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genRandomResult = exports.calculateOdds = exports.LotteryUtil = void 0;
const constants_1 = require("../constants");
const probability_1 = require("../config/probability");
const utils_1 = require("../../../../utils");
const COUNT = probability_1.probabilityOfOdds.reduce((num, line) => num + line.probability, 0);
class LotteryUtil {
    constructor() {
        this.flyTime = 0;
    }
    lottery() {
        this.genLotteryResult();
        this.calculateLotteryTime();
    }
    getResult() {
        return this.result;
    }
    getFlyTime() {
        return this.flyTime;
    }
    genLotteryResult() {
        const randomNum = (0, utils_1.random)(0, COUNT);
        let count = 0;
        const interval = probability_1.probabilityOfOdds.find(p => {
            count += p.probability;
            if (count >= randomNum) {
                return true;
            }
        });
        if (interval.oddsMax === constants_1.MIN_ODDS) {
            this.result = constants_1.MIN_ODDS;
        }
        else {
            this.result = (0, utils_1.random)(interval.oddsMin * 100, interval.oddsMax * 100) / 100;
        }
    }
    getFlyTimeToOdds(odds) {
        this.result = odds;
        this.calculateLotteryTime();
        return this.flyTime;
    }
    calculateLotteryTime() {
        if (this.result === constants_1.MIN_ODDS) {
            this.flyTime = 0;
            return;
        }
        let num = 1, last;
        for (let i = 1; i <= 100; i++) {
            last = num;
            num *= constants_1.SPEED_UP;
            if (num > this.result) {
                const average = 1000 / ((num - last) * 100);
                const diff = (this.result - last) * 100 * average;
                this.flyTime = (i - 1) * 1000 + Math.floor(diff);
                break;
            }
            else if (num === this.result) {
                this.flyTime = i * 1000;
            }
        }
    }
}
exports.LotteryUtil = LotteryUtil;
function calculateOdds(flyTime) {
    const time = flyTime / 1000;
    const remain = Math.floor(time % 1 * 100) / 100;
    const seconds = Math.floor(time);
    let odds = 1;
    for (let i = 0; i < seconds; i++) {
        odds *= constants_1.SPEED_UP;
    }
    const num = ((odds * constants_1.SPEED_UP) - odds) * remain;
    return Math.floor((num + odds) * 100) / 100;
}
exports.calculateOdds = calculateOdds;
function genRandomResult() {
    const lotteryUtil = new LotteryUtil();
    const num = (0, utils_1.random)(10, 20);
    const result = [];
    for (let i = 0; i < num; i++) {
        lotteryUtil.lottery();
        result.push(lotteryUtil.getResult());
    }
    return result;
}
exports.genRandomResult = genRandomResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DcmFzaC9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0Q0FBZ0Q7QUFDaEQsdURBQXdEO0FBQ3hELDZDQUF5QztBQUV6QyxNQUFNLEtBQUssR0FBRywrQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVqRixNQUFhLFdBQVc7SUFBeEI7UUFDWSxZQUFPLEdBQVcsQ0FBQyxDQUFDO0lBZ0ZoQyxDQUFDO0lBMUVHLE9BQU87UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBS0QsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsVUFBVTtRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBS08sZ0JBQWdCO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLElBQUEsY0FBTSxFQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUduQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxNQUFNLFFBQVEsR0FBRywrQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEMsS0FBSyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFDdkIsSUFBSSxLQUFLLElBQUksU0FBUyxFQUFFO2dCQUNwQixPQUFPLElBQUksQ0FBQzthQUNmO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFHSCxJQUFJLFFBQVEsQ0FBQyxPQUFPLEtBQUssb0JBQVEsRUFBRTtZQUMvQixJQUFJLENBQUMsTUFBTSxH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