"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRanomByWeight = exports.random = exports.settle_zhuang = void 0;
const benzConst = require("./benzConst");
function settle_zhuang(roomInfo, Players) {
    try {
        for (const pl of Players) {
            if (pl.bet) {
                pl.profit = 0;
                for (const bet_e of pl.betList) {
                    bet_e.profit = 0;
                    if (roomInfo.lotterys == bet_e.area) {
                        bet_e.profit = bet_e.bet * (benzConst.points.find(c => c.area == bet_e.area).odds - 1);
                        pl.profit += bet_e.bet * (benzConst.points.find(c => c.area == bet_e.area).odds - 1);
                    }
                    else {
                        bet_e.profit = -bet_e.bet;
                        pl.profit -= bet_e.bet;
                    }
                }
            }
        }
        return;
    }
    catch (e) {
        console.error(`ttz_zhuangService.settle错误 ==> ${e}`);
        return;
    }
}
exports.settle_zhuang = settle_zhuang;
function random(min, max) {
    let count = Math.max(max - min, 0);
    return Math.round(Math.random() * count * 100) / 100;
}
exports.random = random;
;
function getRanomByWeight() {
    let weights = benzConst.points;
    let sum = 0;
    for (const c of weights) {
        sum = sum + c.prob;
    }
    let compareWeight = random(1, sum);
    let weightIndex = 0;
    while (sum > 0) {
        sum = sum - weights[weightIndex].prob;
        if (sum <= compareWeight) {
            let c = weights[weightIndex];
            return c;
        }
        weightIndex = weightIndex + 1;
    }
    return;
}
exports.getRanomByWeight = getRanomByWeight;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuemxvZ2ljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQmVuekJtdy9saWIvYmVuemxvZ2ljLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU9BLHlDQUEwQztBQUkxQyxTQUFnQixhQUFhLENBQUMsUUFBa0IsRUFBRSxPQUFxQjtJQUNuRSxJQUFJO1FBQ0EsS0FBSyxNQUFNLEVBQUUsSUFBSSxPQUFPLEVBQUU7WUFDdEIsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFO2dCQUNSLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLEtBQUssTUFBTSxLQUFLLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRTtvQkFDNUIsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ2pCLElBQUksUUFBUSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO3dCQUNqQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDdkYsRUFBRSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3hGO3lCQUFNO3dCQUNILEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO3dCQUMxQixFQUFFLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7cUJBQzFCO2lCQUNKO2FBQ0o7U0FDSjtRQUNELE9BQU87S0FDVjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRCxPQUFPO0tBQ1Y7QUFDTCxDQUFDO0FBdEJELHNDQXNCQztBQUNELFNBQWdCLE1BQU0sQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3pELENBQUM7QUFIRCx3QkFHQztBQUFBLENBQUM7QUFFRixTQUFnQixnQkFBZ0I7SUFDNUIsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUMvQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDWixLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRTtRQUNyQixHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDdEI7SUFFRCxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNwQixPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDWixHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFDckMsSUFBSSxHQUFHLElBQUksYUFBYSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3QixPQUFPLENBQUMsQ0FBQztTQUNaO1FBQ0QsV0FBVyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUM7S0FDakM7SUFDRCxPQUFPO0FBQ1gsQ0FBQztBQWxCRCw0Q0FrQkMifQ==