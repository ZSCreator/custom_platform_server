"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitBetGold = void 0;
const robotBetUtil_1 = require("../../../../utils/robot/robotBetUtil");
const commonUtil_1 = require("../../../../utils/lottery/commonUtil");
const robotGoldUtil_1 = require("../../../../utils/robot/robotGoldUtil");
const betAreas_1 = require("../config/betAreas");
function splitBetGold(playerGold, sceneId, ChipList) {
    const ran = (0, commonUtil_1.randomFromRange)(1, 100);
    let betGold = (0, robotGoldUtil_1.randomBetGold)(ChipList, playerGold, ran);
    if (!betGold) {
        return { 'betType': null, 'betArr': [] };
    }
    let betType;
    if (ran < 32) {
        betType = betAreas_1.BetAreasName.SINGLE;
    }
    else if (ran < 64) {
        betType = betAreas_1.BetAreasName.DOUBLE;
    }
    else if (ran < 79) {
        betType = betAreas_1.BetAreasName.THREE_RED;
    }
    else if (ran < 94) {
        betType = betAreas_1.BetAreasName.THREE_WHITE;
    }
    else if (ran < 97) {
        betType = betAreas_1.BetAreasName.FOUR_WHITE;
    }
    else {
        betType = betAreas_1.BetAreasName.FOUR_RED;
    }
    if (betType === betAreas_1.BetAreasName.FOUR_RED || betType === betAreas_1.BetAreasName.FOUR_WHITE) {
        betGold = Math.min(betGold, (0, commonUtil_1.randomFromRange)(5000, 25000));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29sb3JQbGF0ZS9saWIvdXRpbC9yb2JvdFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUVBQXFFO0FBRXJFLHFFQUFrRztBQUNsRyx5RUFBc0U7QUFDdEUsaURBQWtEO0FBT2xELFNBQWdCLFlBQVksQ0FBQyxVQUFrQixFQUFFLE9BQWUsRUFBRSxRQUFrQjtJQUVoRixNQUFNLEdBQUcsR0FBRyxJQUFBLDRCQUFlLEVBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXBDLElBQUksT0FBTyxHQUFHLElBQUEsNkJBQWEsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7S0FDNUM7SUFFRCxJQUFJLE9BQXFCLENBQUM7SUFFMUIsSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFO1FBQ1YsT0FBTyxHQUFHLHVCQUFZLENBQUMsTUFBTSxDQUFDO0tBQ2pDO1NBQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFO1FBQ2pCLE9BQU8sR0FBRyx1QkFBWSxDQUFDLE1BQU0sQ0FBQztLQUNqQztTQUFNLElBQUksR0FBRyxHQUFHLEVBQUUsRUFBRTtRQUNqQixPQUFPLEdBQUcsdUJBQVksQ0FBQyxTQUFTLENBQUM7S0FDcEM7U0FBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLEVBQUU7UUFDakIsT0FBTyxHQUFHLHVCQUFZLENBQUMsV0FBVyxDQUFDO0tBQ3RDO1NBQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFO1FBQ2pCLE9BQU8sR0FBRyx1QkFBWSxDQUFDLFVBQVUsQ0FBQztLQUNyQztTQUFNO1FBQ0gsT0FBTyxHQUFHLHVCQUFZLENBQUMsUUFBUSxDQUFDO0tBQ25DO0lBRUQsSUFBSSxPQUFPLEtBQUssdUJBQVksQ0FBQyxRQUFRLElBQUksT0FBTyxLQUFLLHVCQUFZLENBQUMsVUFBVSxFQUFFO1FBRTFFLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFBLDRCQUFlLEVBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDN0Q7SUFFRCxJQUFJLE1BQU0sR0FBRyxJQUFBLDRCQUFhLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTlDLElBQUksS0FBSyxHQUFHLElBQUEsc0NBQXlCLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVDLElBQUksS0FBSyxHQUFHLElBQUEsc0NBQXlCLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVDLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQy9ELE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMvQjtJQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDL0IsQ0FBQztBQXhDRCxvQ0F3Q0M7QUFBQSxDQUFDIn0=