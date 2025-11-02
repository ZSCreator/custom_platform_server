"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePool = void 0;
class BasePool {
    constructor(opt) {
        this.nid = opt['nid'];
        this.gameName = opt['zname'];
        this.serverName = opt['serverName'];
    }
    changeAmountFromControlPoolToBonusPool(changeAmountValue) {
        if (typeof changeAmountValue !== 'number')
            throw new Error('改变调控池金额进公共奖池，传入参数应为 number 类型');
        if (this.controlPool.amount < changeAmountValue) {
        }
        this.controlPool.amount -= changeAmountValue;
        this.bonusPool.amount += changeAmountValue;
        this.bonusPool.changeCorrectedValueAfterAdd();
    }
}
exports.BasePool = BasePool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVBvb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvYm9udXNQb29scy9iZWFuL0Jhc2VQb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVdBLE1BQXNCLFFBQVE7SUFhNUIsWUFBc0IsR0FBYztRQUNsQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsc0NBQXNDLENBQUMsaUJBQXlCO1FBQzlELElBQUksT0FBTyxpQkFBaUIsS0FBSyxRQUFRO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzVGLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLEVBQUU7U0FFaEQ7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQztRQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQztRQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLDRCQUE0QixFQUFFLENBQUM7SUFDaEQsQ0FBQztDQUNGO0FBNUJELDRCQTRCQyJ9