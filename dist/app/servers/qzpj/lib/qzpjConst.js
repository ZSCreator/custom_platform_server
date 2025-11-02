"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = exports.RoomState = exports.xj_bet_arr = exports.robzhuang_arr = exports.RESULT_NUM = exports.CHANNEL_NAME = void 0;
exports.CHANNEL_NAME = 'qzpj';
exports.RESULT_NUM = 10;
exports.robzhuang_arr = [0, 1, 2, 3, 4];
exports.xj_bet_arr = [0, 1, 2, 4];
var RoomState;
(function (RoomState) {
    RoomState["NONE"] = "NONE";
    RoomState["INWAIT"] = "INWAIT";
    RoomState["ROBZHUANG"] = "ROBZHUANG";
    RoomState["READYBET"] = "READYBET";
    RoomState["DICE"] = "DICE";
    RoomState["DEAL"] = "DEAL";
    RoomState["LOOK"] = "LOOK";
    RoomState["SETTLEMENT"] = "SETTLEMENT";
})(RoomState = exports.RoomState || (exports.RoomState = {}));
var route;
(function (route) {
    route["qzpj_onExit"] = "qzpj.onExit";
    route["qzpj_onEntry"] = "qzpj.onEntry";
    route["qzpj_bet"] = "qzpj.OperBet";
    route["qzpj_robzhuang"] = "qzpj.OperRobzhuang";
    route["qzpj_onStart"] = "qzpj.onStart";
    route["qzpj_onSetBanker"] = "qzpj.onSetBanker";
    route["qzpj_onReadybet"] = "qzpj.onReadybet";
    route["qzpj_setSice"] = "qzpj.setSice";
    route["qzpj_onDeal"] = "qzpj.onDeal";
    route["qzpj_liangpai"] = "qzpj.liangpai";
    route["qzpj_onSettlement"] = "qzpj.onSettlement";
})(route = exports.route || (exports.route = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpwakNvbnN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcXpwai9saWIvcXpwakNvbnN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFhLFFBQUEsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUN0QixRQUFBLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFVaEIsUUFBQSxhQUFhLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFaEMsUUFBQSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxJQUFZLFNBWVg7QUFaRCxXQUFZLFNBQVM7SUFDakIsMEJBQWEsQ0FBQTtJQUNiLDhCQUFpQixDQUFBO0lBRWpCLG9DQUF1QixDQUFBO0lBRXZCLGtDQUFxQixDQUFBO0lBRXJCLDBCQUFhLENBQUE7SUFDYiwwQkFBYSxDQUFBO0lBQ2IsMEJBQWEsQ0FBQTtJQUNiLHNDQUF5QixDQUFBO0FBQzdCLENBQUMsRUFaVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVlwQjtBQUNELElBQVksS0FnQlg7QUFoQkQsV0FBWSxLQUFLO0lBQ2Isb0NBQTJCLENBQUE7SUFDM0Isc0NBQTZCLENBQUE7SUFDN0Isa0NBQXlCLENBQUE7SUFFekIsOENBQXFDLENBQUE7SUFFckMsc0NBQTZCLENBQUE7SUFFN0IsOENBQXFDLENBQUE7SUFFckMsNENBQW1DLENBQUE7SUFDbkMsc0NBQTZCLENBQUE7SUFDN0Isb0NBQTJCLENBQUE7SUFDM0Isd0NBQStCLENBQUE7SUFDL0IsZ0RBQXVDLENBQUE7QUFDM0MsQ0FBQyxFQWhCVyxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFnQmhCIn0=