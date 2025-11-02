"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitBetGold = void 0;
const commonUtil_1 = require("../../../../utils/lottery/commonUtil");
const betAreas_1 = require("../config/betAreas");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const utils_1 = require("../../../../utils");
function splitBetGold(playerGold, sceneId) {
    const scene = (0, JsonMgr_1.get)('scenes/andarBahar').datas.find(scene => scene.id === sceneId);
    let betType;
    if (Math.random() < 0.5) {
        betType = betAreas_1.BetAreasName.BAHAR;
    }
    else {
        betType = betAreas_1.BetAreasName.ANDAR;
    }
    let betCount;
    let temp1 = (0, commonUtil_1.getDateSpecifHMSAfterDays)(0, 3);
    let temp2 = (0, commonUtil_1.getDateSpecifHMSAfterDays)(0, 7);
    if (Date.now() > temp1 && Date.now() < temp2) {
        betCount = (0, utils_1.random)(1, 3);
    }
    else {
        betCount = (0, utils_1.random)(1, 5);
    }
    const betGold = factorial(scene.lowBet, betCount);
    return { betType, betGold };
}
exports.splitBetGold = splitBetGold;
function factorial(num, count) {
    if (count <= 0) {
        return num;
    }
    return factorial(num * 2, --count);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYW5kYXJCYWhhci9saWIvdXRpbC9yb2JvdFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQStFO0FBQy9FLGlEQUFnRDtBQUNoRCxnRUFBdUQ7QUFDdkQsNkNBQXlDO0FBT3pDLFNBQWdCLFlBQVksQ0FBQyxVQUFrQixFQUFFLE9BQWU7SUFDNUQsTUFBTSxLQUFLLEdBQUcsSUFBQSxhQUFHLEVBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztJQUVqRixJQUFJLE9BQXFCLENBQUM7SUFFMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFO1FBQ3JCLE9BQU8sR0FBRyx1QkFBWSxDQUFDLEtBQUssQ0FBQztLQUNoQztTQUFNO1FBQ0gsT0FBTyxHQUFHLHVCQUFZLENBQUMsS0FBSyxDQUFDO0tBQ2hDO0lBR0QsSUFBSSxRQUFRLENBQUM7SUFHYixJQUFJLEtBQUssR0FBRyxJQUFBLHNDQUF5QixFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QyxJQUFJLEtBQUssR0FBRyxJQUFBLHNDQUF5QixFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssRUFBRTtRQUMxQyxRQUFRLEdBQUcsSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzNCO1NBQU07UUFDSCxRQUFRLEdBQUcsSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzNCO0lBRUQsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFbEQsT0FBTyxFQUFFLE9BQU8sRUFBRyxPQUFPLEVBQUMsQ0FBQztBQUNoQyxDQUFDO0FBMUJELG9DQTBCQztBQUVELFNBQVMsU0FBUyxDQUFDLEdBQVcsRUFBRSxLQUFhO0lBQ3pDLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNaLE9BQU8sR0FBRyxDQUFDO0tBQ2Q7SUFFRCxPQUFPLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdkMsQ0FBQyJ9