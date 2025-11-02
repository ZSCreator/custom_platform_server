'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const BET_COUNTDOWN = 25000;
class buyuRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.betLowLimit = opts.betLowLimit || 0;
        this.isBetState = false;
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(10, 50);
        this.isBanker = false;
        this.appliedBanker = false;
    }
    async baiJiaLeLoaded(param) {
        try {
            const dataFromLoaded = await this.requestByRoute("buyu.mainHandler.loaded", param);
            return Promise.resolve("");
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        this.isBetState = false;
        this.leaveGameAndReset();
    }
    registerListener() {
    }
}
exports.default = buyuRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV5dVJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYnV5dS9saWIvcm9ib3QvYnV5dVJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFJYiwyRUFBd0U7QUFHeEUsbUVBQW1FO0FBS25FLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQztBQUU1QixNQUFxQixTQUFVLFNBQVEscUJBQVM7SUFZNUMsWUFBWSxJQUFJO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBRS9CLENBQUM7SUFHRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUs7UUFDdEIsSUFBSTtZQUNBLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDOUI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNoQztJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsT0FBTztRQUNULElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFHRCxnQkFBZ0I7SUFFaEIsQ0FBQztDQUNKO0FBNUNELDRCQTRDQyJ9