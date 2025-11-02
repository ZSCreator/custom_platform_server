"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackBetArea = void 0;
const GameUtil_1 = require("../../../../utils/GameUtil");
class BlackJackBetArea {
    constructor(maxBet) {
        this.bet = 0;
        this.maxBet = 1000000;
        this.mulriple = 1;
        this.basePokerList = [];
        this.baseCount = [];
        this.canSeparate = false;
        this.hadSeparate = false;
        this.beAddPokerAction = false;
        this.playerHadAction = false;
        this.continueAction = false;
        this.actionComplete = false;
        this.maxBet = maxBet;
    }
    getFirstPoker() {
        return this.basePokerList[0];
    }
    addPoker(poker) {
        this.basePokerList.push(poker);
        this.baseCount = (0, GameUtil_1.calculateDot)(this.basePokerList);
    }
    reserveOnePoker() {
        this.basePokerList = this.basePokerList.slice(0, 1);
        this.baseCount = (0, GameUtil_1.calculateDot)(this.basePokerList);
    }
    reserveTwoPoker() {
        this.basePokerList = this.basePokerList.slice(0, 2);
        this.baseCount = (0, GameUtil_1.calculateDot)(this.basePokerList);
    }
    getResidualPoker() {
        return this.basePokerList.slice(2);
    }
    getCount() {
        return Math.max(...this.baseCount);
    }
    checkPlayerCanBet(bet) {
        if (this.bet + bet > this.maxBet) {
            return false;
        }
        return true;
    }
    add(bet) {
        if (this.bet === 0) {
            this.continueAction = true;
        }
        this.bet += bet;
    }
    getCurrentBet() {
        return this.bet;
    }
    getPokerList() {
        const { basePokerList, baseCount } = this;
        return {
            basePokerList,
            baseCount
        };
    }
    setPokerList(basePokerList, baseCount) {
        this.basePokerList = basePokerList;
        this.baseCount = baseCount;
    }
    getPokerAndCount() {
        return {
            pokerList: this.basePokerList,
            countList: this.baseCount
        };
    }
    getSettlementAmount() {
        return this.bet * this.mulriple;
    }
    addMulriple(mulriple) {
        if (mulriple < 0) {
            throw new Error(`新增倍率必须为正数`);
        }
        this.mulriple += mulriple;
    }
    canPlayerSeparate() {
        const firstPokerCount = (0, GameUtil_1.calculateDot)([this.basePokerList[0]]);
        const secondPokerCount = (0, GameUtil_1.calculateDot)([this.basePokerList[1]]);
        if (firstPokerCount.length === 0 || secondPokerCount.length === 0) {
            return false;
        }
        const canSeparate = Math.max(...firstPokerCount) === Math.max(...secondPokerCount);
        this.setCanSeparate(canSeparate);
        return this.canSeparate;
    }
    setCanSeparate(separate) {
        this.canSeparate = separate;
    }
    checkSeparate() {
        return this.canSeparate;
    }
    checkHadSeparate() {
        return this.hadSeparate;
    }
    setHadSeparate(separate) {
        this.hadSeparate = separate;
    }
}
exports.BlackJackBetArea = BlackJackBetArea;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrQmV0QXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvZXhwYW5zaW9uL0JsYWNrSmFja0JldEFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseURBQTBEO0FBSTFELE1BQWEsZ0JBQWdCO0lBME16QixZQUFZLE1BQWM7UUF4TWxCLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFHeEIsV0FBTSxHQUFXLE9BQU8sQ0FBQztRQUdqQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR3JCLGtCQUFhLEdBQWtCLEVBQUUsQ0FBQztRQUdsQyxjQUFTLEdBQWtCLEVBQUUsQ0FBQztRQUU5QixnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUU3QixnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUdyQyxxQkFBZ0IsR0FBWSxLQUFLLENBQUM7UUFHbEMsb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFHakMsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFHaEMsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUE2SzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUE1S00sYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFhO1FBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBQSx1QkFBWSxFQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBS00sZUFBZTtRQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsU0FBUyxHQUFHLElB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