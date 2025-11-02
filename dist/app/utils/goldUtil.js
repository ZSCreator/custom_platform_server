'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductGold = void 0;
const commonUtil = require("../utils/lottery/commonUtil");
function deductGold(player, profit) {
    if (!player) {
        return { err: '玩家不存在', result: [''] };
    }
    if (typeof profit !== 'number') {
        return { err: `金币不是数字${profit}`, result: null };
    }
    if (profit < 0) {
        return { err: `扣除的金币不能为负：${profit}`, result: null };
    }
    if (commonUtil.isNullOrUndefined(player.gold)) {
        return { err: '玩家金币字段不存在', result: null };
    }
    if (player.gold >= profit) {
        player.gold -= profit;
        return { err: null, result: ['gold'] };
    }
    else {
        player.gold = 0;
        return { err: `金币不足`, result: ['gold'] };
    }
}
exports.deductGold = deductGold;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbHMvZ29sZFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiwwREFBMkQ7QUFPM0QsU0FBZ0IsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFjO0lBQzdDLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ3pDO0lBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7UUFDNUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztLQUNuRDtJQUNELElBQUksTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNaLE9BQU8sRUFBRSxHQUFHLEVBQUUsYUFBYSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7S0FDdkQ7SUFDRCxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDM0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0tBQzdDO0lBRUQsSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sRUFBRTtRQUN2QixNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQztRQUN0QixPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0tBQzFDO1NBQU07UUFDSCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNoQixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0tBQzVDO0FBQ0wsQ0FBQztBQXJCRCxnQ0FxQkM7QUFBQSxDQUFDIn0=