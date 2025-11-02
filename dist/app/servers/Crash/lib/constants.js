"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgRoute = exports.MIN_ODDS = exports.MAX_ODDS = exports.SPEED_UP = exports.RoomState = void 0;
var RoomState;
(function (RoomState) {
    RoomState["BET"] = "crashBet";
    RoomState["LOTTERY"] = "crashLottery";
    RoomState["SETTLEMENT"] = "crashSettlement";
})(RoomState = exports.RoomState || (exports.RoomState = {}));
exports.SPEED_UP = 1.063;
exports.MAX_ODDS = 450;
exports.MIN_ODDS = 0;
var MsgRoute;
(function (MsgRoute) {
    MsgRoute["START_BET_STATE"] = "startBetState";
    MsgRoute["START_LOTTERY_STATE"] = "startLotteryState";
    MsgRoute["START_SETTLEMENT_STATE"] = "startSettlementState";
    MsgRoute["TOOK_PROFIT"] = "tookProfit";
})(MsgRoute = exports.MsgRoute || (exports.MsgRoute = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ3Jhc2gvbGliL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFNQSxJQUFZLFNBSVg7QUFKRCxXQUFZLFNBQVM7SUFDakIsNkJBQWdCLENBQUE7SUFDaEIscUNBQXdCLENBQUE7SUFDeEIsMkNBQThCLENBQUE7QUFDbEMsQ0FBQyxFQUpXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBSXBCO0FBR1ksUUFBQSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBRWpCLFFBQUEsUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUVmLFFBQUEsUUFBUSxHQUFHLENBQUMsQ0FBQztBQVUxQixJQUFZLFFBS1g7QUFMRCxXQUFZLFFBQVE7SUFDaEIsNkNBQWlDLENBQUE7SUFDakMscURBQXlDLENBQUE7SUFDekMsMkRBQStDLENBQUE7SUFDL0Msc0NBQTBCLENBQUE7QUFDOUIsQ0FBQyxFQUxXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBS25CIn0=