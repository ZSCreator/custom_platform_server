'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DTControlState = exports.notValidBetArea = exports.LimitRed = exports.leaveCount = exports.bankerProfitProportion = exports.bankerRoundLimit = exports.bankerGoldLimit = exports.scrolling = exports.mapping = exports.LogInfo = exports.MAX_History_LENGTH = exports.cardsLength = exports.route = exports.status = exports.statusTimer = exports.mostNumberPlayer = exports.draw = exports.ordinaryArea = exports.area = exports.odds = exports.sideGates = exports.mainGates = void 0;
exports.mainGates = ['d', 't', 'f'];
exports.sideGates = ['db', 'dr', 'dd', 'ds', 'tb', 'tr', 'td', 'ts'];
var odds;
(function (odds) {
    odds[odds["d"] = 1] = "d";
    odds[odds["t"] = 1] = "t";
    odds[odds["f"] = 8] = "f";
    odds[odds["db"] = 0.9] = "db";
    odds[odds["dr"] = 0.9] = "dr";
    odds[odds["dd"] = 1.05] = "dd";
    odds[odds["td"] = 1.05] = "td";
    odds[odds["ds"] = 0.75] = "ds";
    odds[odds["ts"] = 0.75] = "ts";
    odds[odds["tb"] = 0.9] = "tb";
    odds[odds["tr"] = 0.9] = "tr";
})(odds = exports.odds || (exports.odds = {}));
;
exports.area = [
    "d",
    "t",
    "f",
    "db",
    "dr",
    "dd",
    "ds",
    "tb",
    "tr",
    "td",
    "ts"
];
exports.ordinaryArea = ['d', 't', 'f'];
exports.draw = 'f';
exports.mostNumberPlayer = 100;
var statusTimer;
(function (statusTimer) {
    statusTimer[statusTimer["LICENS"] = 3000] = "LICENS";
    statusTimer[statusTimer["BETTING"] = 15000] = "BETTING";
    statusTimer[statusTimer["OPENAWARD"] = 7000] = "OPENAWARD";
    statusTimer[statusTimer["SETTLEING"] = 5000] = "SETTLEING";
})(statusTimer = exports.statusTimer || (exports.statusTimer = {}));
;
var status;
(function (status) {
    status["NONE"] = "NONE";
    status["LICENS"] = "LICENS";
    status["BET"] = "BETTING";
    status["OPENAWARD"] = "OPENAWARD";
    status["SETTLEING"] = "SETTLEING";
})(status = exports.status || (exports.status = {}));
;
var route;
(function (route) {
    route["plChange"] = "playersChange";
    route["Start"] = "DragonTigerStart";
    route["StartBet"] = "DragonTigerBet";
    route["Lottery"] = "DragonTigerLottery";
    route["Settle"] = "DragonTigerSettle";
    route["OtherBet"] = "DragonTigerOtherBets";
    route["topUp"] = "topUpPlayer";
    route["dt_zj_info"] = "dt_zj_info";
    route["dt_msg"] = "dt_msg";
})(route = exports.route || (exports.route = {}));
;
exports.cardsLength = 416;
exports.MAX_History_LENGTH = 50;
var LogInfo;
(function (LogInfo) {
    LogInfo["scene"] = "\u4ECE\u573A";
    LogInfo["room"] = "\u623F\u95F4";
    LogInfo["delete"] = "\u5220\u9664\u73A9\u5BB6";
    LogInfo["reason"] = "\u672A\u5728\u73A9\u5BB6\u901A\u9053\u4E2D\u627E\u5230\u73A9\u5BB6";
    LogInfo["reason1"] = "\u672A\u5728\u73A9\u5BB6\u5217\u8868\u4E2D\u627E\u5230\u73A9\u5BB6";
})(LogInfo = exports.LogInfo || (exports.LogInfo = {}));
;
var mapping;
(function (mapping) {
    mapping["d"] = "t";
    mapping["t"] = "d";
    mapping["db"] = "dr";
    mapping["dr"] = "db";
    mapping["tb"] = "tr";
    mapping["tr"] = "tb";
    mapping["dd"] = "ds";
    mapping["ds"] = "dd";
    mapping["td"] = "ts";
    mapping["ts"] = "td";
})(mapping = exports.mapping || (exports.mapping = {}));
;
exports.scrolling = 1e5;
exports.bankerGoldLimit = {
    0: 2000 * 100,
    1: 10000 * 100,
    2: 20000 * 100,
    4: 2e6,
};
exports.bankerRoundLimit = 6;
exports.bankerProfitProportion = 0.4;
exports.leaveCount = 1;
var LimitRed;
(function (LimitRed) {
    LimitRed["personal"] = "personal";
    LimitRed["total"] = "total";
})(LimitRed = exports.LimitRed || (exports.LimitRed = {}));
;
exports.notValidBetArea = ['f'];
var DTControlState;
(function (DTControlState) {
    DTControlState[DTControlState["WIN"] = 0] = "WIN";
    DTControlState[DTControlState["LOSS"] = 1] = "LOSS";
    DTControlState[DTControlState["RANDOM"] = 2] = "RANDOM";
})(DTControlState = exports.DTControlState || (exports.DTControlState = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhZ29uVGlnZXJDb25zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RyYWdvblRpZ2VyL2xpYi9EcmFnb25UaWdlckNvbnN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7O0FBS0MsUUFBQSxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRzVCLFFBQUEsU0FBUyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRzFFLElBQVksSUFnQlg7QUFoQkQsV0FBWSxJQUFJO0lBQ1oseUJBQU8sQ0FBQTtJQUNQLHlCQUFPLENBQUE7SUFDUCx5QkFBTyxDQUFBO0lBRVAsNkJBQVUsQ0FBQTtJQUNWLDZCQUFVLENBQUE7SUFFViw4QkFBVyxDQUFBO0lBQ1gsOEJBQVcsQ0FBQTtJQUVYLDhCQUFXLENBQUE7SUFDWCw4QkFBVyxDQUFBO0lBRVgsNkJBQVUsQ0FBQTtJQUNWLDZCQUFVLENBQUE7QUFDZCxDQUFDLEVBaEJXLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQWdCZjtBQUFBLENBQUM7QUFHVyxRQUFBLElBQUksR0FBRztJQUNoQixHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtDQUNQLENBQUM7QUFNVyxRQUFBLFlBQVksR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFHL0IsUUFBQSxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBR1gsUUFBQSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7QUFHcEMsSUFBWSxXQUtYO0FBTEQsV0FB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