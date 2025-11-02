"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitBetGold = void 0;
const robotBetUtil_1 = require("../../../../utils/robot/robotBetUtil");
const commonUtil_1 = require("../../../../utils/lottery/commonUtil");
const robotGoldUtil_1 = require("../../../../utils/robot/robotGoldUtil");
const betAreas_1 = require("../config/betAreas");
const utils_1 = require("../../../../utils");
function splitBetGold(playerGold, sceneId, ChipList) {
    const ran = (0, commonUtil_1.randomFromRange)(1, 100);
    let betGold = (0, robotGoldUtil_1.randomBetGold)(ChipList, playerGold, ran);
    if (!betGold) {
        return { 'betType': null, 'betArr': [] };
    }
    let betType;
    switch (true) {
        case (ran < 25):
            betType = betAreas_1.singleAreas[(0, utils_1.random)(0, betAreas_1.singleAreas.length - 1)];
            break;
        case (ran < 35):
            betType = betAreas_1.jointAreas[(0, utils_1.random)(0, betAreas_1.jointAreas.length - 1)];
            break;
        case (ran < 55):
            betType = betAreas_1.doubleAreas[(0, utils_1.random)(0, betAreas_1.doubleAreas.length - 1)];
            break;
        case (ran < 80):
            betType = Math.random() < 0.5 ? betAreas_1.BetAreasName.SINGLE : betAreas_1.BetAreasName.DOUBLE;
            break;
        case (ran <= 100):
            betType = betAreas_1.threeAreas[(0, utils_1.random)(0, betAreas_1.threeAreas.length - 1)];
            break;
        default:
            throw new Error('番摊机器人拆分下注错误');
    }
    let betArr = (0, robotBetUtil_1.divideBetGold)(ChipList, betGold);
    let temp1 = (0, commonUtil_1.getDateSpecifHMSAfterDays)(0, 3);
    let temp2 = (0, commonUtil_1.getDateSpecifHMSAfterDays)(0, 7);
    if (Date.now() > temp1 && Date.now() < temp2 && betArr.length > 3) {
        betArr = betArr.slice(0, 2);
    }
    return { betType, betArr };
}
exports.splitBetGold = splitBetGold;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmFuVGFuL2xpYi91dGlsL3JvYm90VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1RUFBcUU7QUFFckUscUVBQWtHO0FBQ2xHLHlFQUFzRTtBQUN0RSxpREFBb0c7QUFDcEcsNkNBQTJDO0FBTzNDLFNBQWdCLFlBQVksQ0FBQyxVQUFrQixFQUFFLE9BQWUsRUFBRSxRQUFrQjtJQUVoRixNQUFNLEdBQUcsR0FBRyxJQUFBLDRCQUFlLEVBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXBDLElBQUksT0FBTyxHQUFHLElBQUEsNkJBQWEsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7S0FDNUM7SUFFRCxJQUFJLE9BQXFCLENBQUM7SUFFMUIsUUFBUSxJQUFJLEVBQUU7UUFFVixLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNYLE9BQU8sR0FBRyxzQkFBVyxDQUFDLElBQUEsY0FBTSxFQUFDLENBQUMsRUFBRSxzQkFBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE1BQU07UUFHVixLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNYLE9BQU8sR0FBRyxxQkFBVSxDQUFDLElBQUEsY0FBTSxFQUFDLENBQUMsRUFBRSxxQkFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU07UUFHVixLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNYLE9BQU8sR0FBRyxzQkFBVyxDQUFDLElBQUEsY0FBTSxFQUFDLENBQUMsRUFBRSxzQkFBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE1BQU07UUFHVixLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNYLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyx1QkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsdUJBQVksQ0FBQyxNQUFNLENBQUM7WUFDMUUsTUFBTTtRQUdWLEtBQUssQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO1lBQ2IsT0FBTyxHQUFHLHFCQUFVLENBQUMsSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLHFCQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsTUFBTTtRQUNWO1lBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUN0QztJQUVELElBQUksTUFBTSxHQUFHLElBQUEsNEJBQWEsRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFOUMsSUFBSSxLQUFLLEdBQUcsSUFBQSxzQ0FBeUIsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUMsSUFBSSxLQUFLLEdBQUcsSUFBQSxzQ0FBeUIsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDL0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQy9CO0lBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUMvQixDQUFDO0FBbERELG9DQWtEQztBQUFBLENBQUMifQ==