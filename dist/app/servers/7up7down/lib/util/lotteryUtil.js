"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomLottery = exports.preSettle = exports.buildRecordResult = exports.settle = exports.lottery = void 0;
const util = require("../../../../utils");
const up7Const = require("../up7Const");
const commonConst_1 = require("../../../../domain/CommonControl/config/commonConst");
const up7Const_1 = require("../up7Const");
function lottery() {
    let diceNum = 3;
    const result = [];
    while (diceNum > 0) {
        result.push(util.random(1, 6));
        diceNum--;
    }
    return result;
}
exports.lottery = lottery;
;
function settle(lotteryResult, roomInfo) {
    const winAreas = winAreasJudge(lotteryResult);
    const odds = up7Const.odds;
    let totalProfit = 0;
    for (const pl of roomInfo.players) {
        pl.profit = 0;
        for (const area in pl.bets) {
            pl.bets[area].profit = 0;
            if (winAreas == area) {
                if (up7Const.points.includes(area)) {
                    let gold = pl.bets[area].bet * odds[area] - pl.bets[area].bet;
                    pl.bets[area].profit = gold;
                    pl.profit += gold;
                }
            }
            else {
                pl.bets[area].profit -= pl.bets[area].bet;
                pl.profit -= pl.bets[area].bet;
            }
        }
        totalProfit += pl.profit;
    }
    return { winAreas, totalProfit };
}
exports.settle = settle;
;
function winAreasJudge(result) {
    let winArea;
    const totalPiont = util.sum(result);
    if (totalPiont >= 2 && totalPiont <= 6) {
        winArea = up7Const_1.BetAreas.AA;
    }
    else if (totalPiont == 7) {
        winArea = up7Const_1.BetAreas.BB;
    }
    else if (totalPiont >= 8 && totalPiont <= 12) {
        winArea = up7Const_1.BetAreas.CC;
    }
    return winArea;
}
;
function buildRecordResult(lotteryResult, winAreas) {
}
exports.buildRecordResult = buildRecordResult;
function preSettle(totalBet, state, calculateWinMethod) {
    let result, win;
    for (let i = 0; i < 100; i++) {
        result = lottery();
        win = calculateWinMethod(result);
        if (state === commonConst_1.CommonControlState.WIN && win > totalBet ||
            state === commonConst_1.CommonControlState.LOSS && win <= totalBet) {
            break;
        }
    }
    return result;
}
exports.preSettle = preSettle;
function randomLottery(room) {
    let result;
    for (let i = 0; i < 100; i++) {
        result = lottery();
    }
    return result;
}
exports.randomLottery = randomLottery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy83dXA3ZG93bi9saWIvdXRpbC9sb3R0ZXJ5VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBMkM7QUFDM0Msd0NBQXlDO0FBR3pDLHFGQUF1RjtBQUN2RiwwQ0FBcUM7QUFHckMsU0FBZ0IsT0FBTztJQUNuQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEIsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBQzVCLE9BQU8sT0FBTyxHQUFHLENBQUMsRUFBRTtRQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFSRCwwQkFRQztBQUFBLENBQUM7QUFHRixTQUFnQixNQUFNLENBQUMsYUFBdUIsRUFBRSxRQUFpQjtJQUU3RCxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztJQUUzQixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsS0FBSyxNQUFNLEVBQUUsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFO1FBQy9CLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsS0FBSyxNQUFNLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFO1lBQ3hCLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBRWxCLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBZ0IsQ0FBQyxF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