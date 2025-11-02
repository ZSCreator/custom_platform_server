"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgRoute = exports.RoomState = void 0;
var RoomState;
(function (RoomState) {
    RoomState["DEAL"] = "andarBaharDeal";
    RoomState["BET"] = "andarBaharBet";
    RoomState["LOTTERY"] = "andarBaharLottery";
    RoomState["SECOND_BET"] = "andarBaharSecondBet";
    RoomState["SECOND_LOTTERY"] = "andarBaharSecondLottery";
    RoomState["SETTLEMENT"] = "andarBaharSettlement";
})(RoomState = exports.RoomState || (exports.RoomState = {}));
var MsgRoute;
(function (MsgRoute) {
    MsgRoute["PLAYERS_CHANGE"] = "playersChange";
    MsgRoute["START_BET_STATE"] = "startBetState";
    MsgRoute["START_DEAL_STATE"] = "startDealState";
    MsgRoute["START_LOTTERY_STATE"] = "startLotteryState";
    MsgRoute["START_SECOND_BET_STATE"] = "startSecondBetState";
    MsgRoute["START_SECOND_LOTTERY_STATE"] = "startSecondLotteryState";
    MsgRoute["START_SETTLEMENT_STATE"] = "startSettlementState";
    MsgRoute["PLAYER_BET"] = "playerBet";
    MsgRoute["PLAYER_SKIP"] = "playerSkip";
    MsgRoute["GO_OUT"] = "goOut";
})(MsgRoute = exports.MsgRoute || (exports.MsgRoute = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYW5kYXJCYWhhci9saWIvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVNBLElBQVksU0FPWDtBQVBELFdBQVksU0FBUztJQUNqQixvQ0FBdUIsQ0FBQTtJQUN2QixrQ0FBcUIsQ0FBQTtJQUNyQiwwQ0FBNkIsQ0FBQTtJQUM3QiwrQ0FBa0MsQ0FBQTtJQUNsQyx1REFBMEMsQ0FBQTtJQUMxQyxnREFBbUMsQ0FBQTtBQUN2QyxDQUFDLEVBUFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFPcEI7QUFlRCxJQUFZLFFBV1g7QUFYRCxXQUFZLFFBQVE7SUFDaEIsNENBQWdDLENBQUE7SUFDaEMsNkNBQWlDLENBQUE7SUFDakMsK0NBQW1DLENBQUE7SUFDbkMscURBQXlDLENBQUE7SUFDekMsMERBQThDLENBQUE7SUFDOUMsa0VBQXNELENBQUE7SUFDdEQsMkRBQStDLENBQUE7SUFDL0Msb0NBQXdCLENBQUE7SUFDeEIsc0NBQTBCLENBQUE7SUFDMUIsNEJBQWdCLENBQUE7QUFDcEIsQ0FBQyxFQVhXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBV25CIn0=