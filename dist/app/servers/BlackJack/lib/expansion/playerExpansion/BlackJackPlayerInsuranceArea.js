"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackPlayerInsuranceArea = void 0;
class BlackJackPlayerInsuranceArea {
    constructor() {
        this.hadBuyInsurance = false;
        this.bet = 0;
    }
    setBet(bet) {
        this.bet = Math.ceil(bet / 2);
        return this.bet;
    }
    getBet() {
        return this.bet;
    }
    checkBuyInsurance() {
        return this.hadBuyInsurance;
    }
    buyInsurance() {
        if (!this.hadBuyInsurance) {
            this.hadBuyInsurance = true;
        }
    }
}
exports.BlackJackPlayerInsuranceArea = BlackJackPlayerInsuranceArea;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUGxheWVySW5zdXJhbmNlQXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvZXhwYW5zaW9uL3BsYXllckV4cGFuc2lvbi9CbGFja0phY2tQbGF5ZXJJbnN1cmFuY2VBcmVhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLE1BQWEsNEJBQTRCO0lBQXpDO1FBR1ksb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFHakMsUUFBRyxHQUFXLENBQUMsQ0FBQztJQXlCNUIsQ0FBQztJQXZCVSxNQUFNLENBQUMsR0FBVztRQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBS00sTUFBTTtRQUNULE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBRU0sWUFBWTtRQUVmLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1NBQy9CO0lBRUwsQ0FBQztDQUNKO0FBL0JELG9FQStCQyJ9