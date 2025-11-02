"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../common/pojo/baseClass/BaseRobot");
const CommonUtil = require("../../../utils/lottery/commonUtil");
const constants_1 = require("../../../servers/andarBahar/lib/constants");
const robotUtil_1 = require("../../../servers/andarBahar/lib/util/robotUtil");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
var RequestRoute;
(function (RequestRoute) {
    RequestRoute["bet"] = "andarBahar.mainHandler.bet";
    RequestRoute["skip"] = "andarBahar.mainHandler.skip";
    RequestRoute["load"] = "andarBahar.mainHandler.load";
})(RequestRoute || (RequestRoute = {}));
class AndarBaharRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = CommonUtil.randomFromRange(10, 20);
        this.betGold = 0;
        this.betLowLimit = opts.betLowLimit;
    }
    async load() {
        const data = await this.requestByRoute(RequestRoute.load, {});
        if (data.state === constants_1.RoomState.BET) {
            this.bet(data);
        }
    }
    async destroy() {
        await this.leaveGameAndReset();
    }
    registerListener() {
        this.Emitter.on(constants_1.MsgRoute.START_BET_STATE, (data) => this.bet(data));
        this.Emitter.on(constants_1.MsgRoute.START_SECOND_BET_STATE, (data) => this.bet(data, true));
        this.Emitter.on(constants_1.MsgRoute.GO_OUT, (data) => this.destroy());
        this.Emitter.on(constants_1.MsgRoute.START_SETTLEMENT_STATE, (data) => this.settlement(data));
    }
    async bet(data, secondBet = false) {
        if (secondBet && Math.random() > 0.15) {
            if (this.betGold > 0) {
                let delayTime = CommonUtil.randomFromRange(1000, 3000);
                await this.delayRequest(RequestRoute.skip, {}, delayTime);
            }
            return;
        }
        this.betGold = 0;
        if ((this.playRound > this.leaveRound || this.playerGold < this.betLowLimit) && !secondBet) {
            return this.destroy();
        }
        const { betType, betGold } = (0, robotUtil_1.splitBetGold)(this.playerGold - this.betLowLimit, this.sceneId);
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        try {
            await this.delayRequest(RequestRoute.bet, { bets: { [betType]: betGold } }, delayTime);
            this.playerGold -= betGold;
            this.betGold = betGold;
        }
        catch (error) {
            robotlogger.info(`猜AB下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`, 'info');
        }
        this.playRound++;
    }
    settlement(data) {
        const me = data.gamePlayers.find(p => p.uid === this.uid);
        if (me) {
            this.playerGold = me.gold;
        }
    }
}
exports.default = AndarBaharRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5kYXJCYWhhclJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL3JvYm90U2VydmljZS9yb2JvdC9hbmRhckJhaGFyUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsZ0VBQWdFO0FBQ2hFLHlFQUE4RTtBQUM5RSw4RUFBOEU7QUFDOUUsK0NBQXlDO0FBRXpDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFJdkQsSUFBSyxZQUlKO0FBSkQsV0FBSyxZQUFZO0lBQ2Isa0RBQWtDLENBQUE7SUFDbEMsb0RBQW9DLENBQUE7SUFDcEMsb0RBQW9DLENBQUE7QUFDeEMsQ0FBQyxFQUpJLFlBQVksS0FBWixZQUFZLFFBSWhCO0FBS0QsTUFBcUIsZUFBZ0IsU0FBUSxxQkFBUztJQVNsRCxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFUaEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRXRCLGVBQVUsR0FBVyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV4RCxZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBSWhCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN4QyxDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU5RCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUsscUJBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsQjtJQUNMLENBQUM7SUFLRCxLQUFLLENB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