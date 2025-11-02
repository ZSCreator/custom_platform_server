"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgRoute = exports.white = exports.red = exports.RoomState = void 0;
var RoomState;
(function (RoomState) {
    RoomState["BET"] = "colorPlateBet";
    RoomState["LOTTERY"] = "colorPlateLottery";
    RoomState["SETTLEMENT"] = "colorPlateSettlement";
})(RoomState = exports.RoomState || (exports.RoomState = {}));
exports.red = '1';
exports.white = '2';
var MsgRoute;
(function (MsgRoute) {
    MsgRoute["PLAYERS_CHANGE"] = "playersChange";
    MsgRoute["START_BET_STATE"] = "startBetState";
    MsgRoute["START_LOTTERY_STATE"] = "startLotteryState";
    MsgRoute["START_SETTLEMENT_STATE"] = "startSettlementState";
    MsgRoute["PLAYER_BET"] = "playerBet";
})(MsgRoute = exports.MsgRoute || (exports.MsgRoute = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29sb3JQbGF0ZS9saWIvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU1BLElBQVksU0FJWDtBQUpELFdBQVksU0FBUztJQUNqQixrQ0FBcUIsQ0FBQTtJQUNyQiwwQ0FBNkIsQ0FBQTtJQUM3QixnREFBbUMsQ0FBQTtBQUN2QyxDQUFDLEVBSlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFJcEI7QUFHWSxRQUFBLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFHVixRQUFBLEtBQUssR0FBRyxHQUFHLENBQUM7QUFVekIsSUFBWSxRQU1YO0FBTkQsV0FBWSxRQUFRO0lBQ2hCLDRDQUFnQyxDQUFBO0lBQ2hDLDZDQUFpQyxDQUFBO0lBQ2pDLHFEQUF5QyxDQUFBO0lBQ3pDLDJEQUErQyxDQUFBO0lBQy9DLG9DQUF3QixDQUFBO0FBQzVCLENBQUMsRUFOVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQU1uQiJ9