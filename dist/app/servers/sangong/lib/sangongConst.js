"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pump = exports.HistoryMAXLength = exports.maxWinCount = exports.settleTime = exports.sangongProbability = exports.Odds = exports.leaveTimer = exports.leaveCountNum = exports.maxCount = exports.route = exports.COUNTDOWN = void 0;
var COUNTDOWN;
(function (COUNTDOWN) {
    COUNTDOWN[COUNTDOWN["READY"] = 10000] = "READY";
    COUNTDOWN[COUNTDOWN["ROB"] = 10000] = "ROB";
    COUNTDOWN[COUNTDOWN["ROBANIMATION"] = 3000] = "ROBANIMATION";
    COUNTDOWN[COUNTDOWN["BET"] = 10000] = "BET";
    COUNTDOWN[COUNTDOWN["LOOK"] = 10000] = "LOOK";
    COUNTDOWN[COUNTDOWN["SETTLEMENT"] = 8000] = "SETTLEMENT";
    COUNTDOWN[COUNTDOWN["LICENS"] = 3000] = "LICENS";
    COUNTDOWN[COUNTDOWN["SETTLEMENT_O"] = 2000] = "SETTLEMENT_O";
})(COUNTDOWN = exports.COUNTDOWN || (exports.COUNTDOWN = {}));
;
var route;
(function (route) {
    route["InitGame"] = "initGame";
    route["OnExit"] = "onExit";
    route["Offline"] = "onOffline";
    route["KickPlayer"] = "KickPlayer";
    route["Add"] = "addPlayer";
    route["Reconnect"] = "onPlayerReconnect";
    route["ReadyState"] = "IntoTheReadyState";
    route["RobState"] = "RobState";
    route["BetState"] = "BetState";
    route["RobAnimation"] = "RobAnimationState";
    route["Licens"] = "LicensState";
    route["LookState"] = "lookState";
    route["SettleResult"] = "settleResult";
    route["playerReady"] = "playerReady";
    route["playerRob"] = "playerRob";
    route["playerBet"] = "playerBet";
    route["lookCards"] = "lookCards";
    route["liangpai"] = "liangpai";
    route["topUp"] = "topUpPlayer";
    route["kickEveryone"] = "kickEveryone";
})(route = exports.route || (exports.route = {}));
;
exports.maxCount = 6;
exports.leaveCountNum = 3;
exports.leaveTimer = 6e4;
exports.Odds = {
    "12": 9,
    "11": 7,
    "10": 5,
    "9": 3,
    "8": 3,
    "7": 1,
    "6": 1,
    "5": 1,
    "4": 1,
    "3": 1,
    "2": 1,
    "1": 1,
    "0": 1,
};
exports.sangongProbability = 0.2;
exports.settleTime = 1e5;
exports.maxWinCount = 8;
exports.HistoryMAXLength = 20;
exports.pump = 4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuZ29uZ0NvbnN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvc2FuZ29uZy9saWIvc2FuZ29uZ0NvbnN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLElBQVksU0FTWDtBQVRELFdBQVksU0FBUztJQUNqQiwrQ0FBWSxDQUFBO0lBQ1osMkNBQVMsQ0FBQTtJQUNULDREQUFrQixDQUFBO0lBQ2xCLDJDQUFTLENBQUE7SUFDVCw2Q0FBVSxDQUFBO0lBQ1Ysd0RBQWdCLENBQUE7SUFDaEIsZ0RBQVksQ0FBQTtJQUNaLDREQUFrQixDQUFBO0FBQ3RCLENBQUMsRUFUVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVNwQjtBQUFBLENBQUM7QUFLRixJQUFZLEtBMEJYO0FBMUJELFdBQVksS0FBSztJQUNiLDhCQUFxQixDQUFBO0lBQ3JCLDBCQUFpQixDQUFBO0lBQ2pCLDhCQUFxQixDQUFBO0lBQ3JCLGtDQUF5QixDQUFBO0lBQ3pCLDBCQUFpQixDQUFBO0lBQ2pCLHdDQUErQixDQUFBO0lBRS9CLHlDQUFnQyxDQUFBO0lBRWhDLDhCQUFxQixDQUFBO0lBRXJCLDhCQUFxQixDQUFBO0lBQ3JCLDJDQUFrQyxDQUFBO0lBQ2xDLCtCQUFzQixDQUFBO0lBRXRCLGdDQUF1QixDQUFBO0lBQ3ZCLHNDQUE2QixDQUFBO0lBRTdCLG9DQUEyQixDQUFBO0lBQzNCLGdDQUF1QixDQUFBO0lBQ3ZCLGdDQUF1QixDQUFBO0lBQ3ZCLGdDQUF1QixDQUFBO0lBQ3ZCLDhCQUFxQixDQUFBO0lBQ3JCLDhCQUFxQixDQUFBO0lBQ3JCLHNDQUE2QixDQUFBO0FBQ2pDLENBQUMsRUExQlcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBMEJoQjtBQUFBLENBQUM7QUFHVyxRQUFBLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFHYixRQUFBLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFHbEIsUUFBQSxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBR2pCLFFBQUEsSUFBSSxHQUFHO0lBQ2hCLElBQUksRUFBRSxDQUFDO0lBQ1AsSUFBSSxFQUFFLENBQUM7SUFDUCxJQUFJLEVBQUUsQ0FBQztJQUNQLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLENBQUM7SUFDTixHQUFHLEVBQUUsQ0FBQztJQUNOLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLENBQUM7SUFDTixHQUFHLEVBQUUsQ0FBQztJQUNOLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLENBQUM7SUFDTixHQUFHLEVBQUUsQ0FBQztJQUNOLEdBQUcsRUFBRSxDQUFDO0NBQ1QsQ0FBQztBQUVXLFFBQUEsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO0FBR3pCLFFBQUEsVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUdqQixRQUFBLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFHaEIsUUFBQSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFFdEIsUUFBQSxJQUFJLEdBQUcsQ0FBQyxDQUFDIn0=