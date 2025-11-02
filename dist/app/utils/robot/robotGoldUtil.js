'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBetGold = exports.getBetLowLimit = exports.getRanomByWeight = void 0;
const gamesBetAstrict_1 = require("../../../config/data/gamesBetAstrict");
const utils = require("../../utils/index");
const gold_config_1 = require("../../../config/data/robot/gold_config");
function getRanomByWeight(nid, sceneId) {
    let weights = gold_config_1.gold_config.find(c => c.nid == nid).config_arr[sceneId];
    let sum = 0;
    for (const c of weights) {
        sum = sum + c.prob;
    }
    let compareWeight = utils.random(1, sum);
    let weightIndex = 0;
    while (sum > 0) {
        sum = sum - weights[weightIndex].prob;
        if (sum < compareWeight) {
            let c = weights[weightIndex];
            return utils.random(c.min, c.max) + utils.random(0, 100) / 100;
        }
        weightIndex = weightIndex + 1;
    }
    return;
}
exports.getRanomByWeight = getRanomByWeight;
const oneMillion = 100000;
function getBetLowLimit(nid, sceneId) {
    try {
        let sceneId_ = sceneId + '';
        if (gamesBetAstrict_1.betAstrict[`nid_${nid}`] && gamesBetAstrict_1.betAstrict[`nid_${nid}`][`sceneId_${sceneId}`]) {
            return gamesBetAstrict_1.betAstrict[`nid_${nid}`][`sceneId_${sceneId}`];
        }
        return 0;
    }
    catch (error) {
        return 0;
    }
}
exports.getBetLowLimit = getBetLowLimit;
;
function randomBetGold(ChipList, playerGold, ranFactor) {
    if (playerGold < ChipList[0])
        return 0;
    let betSelectionIdx = ranFactor % ChipList.length;
    betSelectionIdx = betSelectionIdx >= 3 ? betSelectionIdx : 3;
    let index = betSelectionIdx;
    let betGold = 0;
    do {
        if (playerGold < (betGold + ChipList[betSelectionIdx])) {
            betSelectionIdx--;
        }
        betGold += ChipList[betSelectionIdx];
        --index;
    } while (index > 0);
    return betGold;
}
exports.randomBetGold = randomBetGold;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RHb2xkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC91dGlscy9yb2JvdC9yb2JvdEdvbGRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBT2IsMEVBQWtFO0FBQ2xFLDJDQUE0QztBQUM1Qyx3RUFBcUU7QUFLckUsU0FBZ0IsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWU7SUFFM0QsSUFBSSxPQUFPLEdBQUcseUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDWixLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRTtRQUN2QixHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDcEI7SUFFRCxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN6QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxFQUFFO1FBQ2QsR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFBO1FBQ3JDLElBQUksR0FBRyxHQUFHLGFBQWEsRUFBRTtZQUN2QixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0IsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUNoRTtRQUNELFdBQVcsR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0tBQy9CO0lBQ0QsT0FBTztBQUNULENBQUM7QUFuQkQsNENBbUJDO0FBS0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBSTFCLFNBQWdCLGNBQWMsQ0FBQyxHQUFXLEVBQUUsT0FBZTtJQUN6RCxJQUFJO1FBRUYsSUFBSSxRQUFRLEdBQVcsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNwQyxJQUFJLDRCQUFVLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLDRCQUFVLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFdBQVcsT0FBTyxFQUFFLENBQUMsRUFBRTtZQUM5RSxPQUFPLDRCQUFVLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFdBQVcsT0FBTyxFQUFFLENBQUMsQ0FBQTtTQUN0RDtRQUNELE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7QUFDSCxDQUFDO0FBWEQsd0NBV0M7QUFBQSxDQUFDO0FBTUYsU0FBZ0IsYUFBYSxDQUFDLFFBQWtCLEVBQUUsVUFBa0IsRUFBRSxTQUFpQjtJQUNyRixJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFFdkMsSUFBSSxlQUFlLEdBQUcsU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDbEQsZUFBZSxHQUFHLGVBQWUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELElBQUksS0FBSyxHQUFHLGVBQWUsQ0FBQztJQUM1QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEIsR0FBRztRQUNELElBQUksVUFBVSxHQUFHLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO1lBQ3RELGVBQWUsRUFBRSxDQUFDO1NBQ25CO1FBQ0QsT0FBTyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyQyxFQUFFLEtBQUssQ0FBQztLQUNULFFBQVEsS0FBSyxHQUFHLENBQUMsRUFBRTtJQUNwQixPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBZkQsc0NBZUM7QUFBQSxDQUFDIn0=