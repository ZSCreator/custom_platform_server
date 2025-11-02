"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pump = exports.HistoryMAXLength = exports.settleTime = exports.sangongProbability = exports.Odds = exports.leaveTimer = exports.leaveCountNum = exports.maxCount = exports.route = exports.COUNTDOWN = void 0;
var COUNTDOWN;
(function (COUNTDOWN) {
    COUNTDOWN[COUNTDOWN["LICENS"] = 5] = "LICENS";
    COUNTDOWN[COUNTDOWN["LOOK"] = 3] = "LOOK";
    COUNTDOWN[COUNTDOWN["BIPAI"] = 5] = "BIPAI";
    COUNTDOWN[COUNTDOWN["SETTLEMENT"] = 2] = "SETTLEMENT";
})(COUNTDOWN = exports.COUNTDOWN || (exports.COUNTDOWN = {}));
;
var route;
(function (route) {
    route["InitGame"] = "baicao_initGame";
    route["OnExit"] = "baicao_onExit";
    route["KickPlayer"] = "baicao_KickPlayer";
    route["Add"] = "baicao_addPlayer";
    route["ReadyState"] = "baicao_IntoTheReadyState";
    route["Licens"] = "baicao_LicensState";
    route["LookState"] = "baicao_lookState";
    route["BipaiState"] = "baicao_BipaiState";
    route["SettleResult"] = "baicao_settleResult";
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
exports.HistoryMAXLength = 20;
exports.pump = 4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFpY2FvQ29uc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWljYW8vbGliL2JhaWNhb0NvbnN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLElBQVksU0FNWDtBQU5ELFdBQVksU0FBUztJQUVqQiw2Q0FBVSxDQUFBO0lBQ1YseUNBQVEsQ0FBQTtJQUNSLDJDQUFTLENBQUE7SUFDVCxxREFBYyxDQUFBO0FBQ2xCLENBQUMsRUFOVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQU1wQjtBQUFBLENBQUM7QUFLRixJQUFZLEtBVVg7QUFWRCxXQUFZLEtBQUs7SUFDYixxQ0FBNEIsQ0FBQTtJQUM1QixpQ0FBd0IsQ0FBQTtJQUN4Qix5Q0FBZ0MsQ0FBQTtJQUNoQyxpQ0FBd0IsQ0FBQTtJQUN4QixnREFBdUMsQ0FBQTtJQUN2QyxzQ0FBNkIsQ0FBQTtJQUM3Qix1Q0FBOEIsQ0FBQTtJQUM5Qix5Q0FBZ0MsQ0FBQTtJQUNoQyw2Q0FBb0MsQ0FBQTtBQUN4QyxDQUFDLEVBVlcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBVWhCO0FBQUEsQ0FBQztBQUdXLFFBQUEsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUdiLFFBQUEsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUdsQixRQUFBLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFHakIsUUFBQSxJQUFJLEdBQUc7SUFDaEIsSUFBSSxFQUFFLENBQUM7SUFDUCxJQUFJLEVBQUUsQ0FBQztJQUNQLElBQUksRUFBRSxDQUFDO0lBQ1AsR0FBRyxFQUFFLENBQUM7SUFDTixHQUFHLEVBQUUsQ0FBQztJQUNOLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLENBQUM7SUFDTixHQUFHLEVBQUUsQ0FBQztJQUNOLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLENBQUM7SUFDTixHQUFHLEVBQUUsQ0FBQztJQUNOLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLENBQUM7Q0FDVCxDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFHekIsUUFBQSxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBSWpCLFFBQUEsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBRXRCLFFBQUEsSUFBSSxHQUFHLENBQUMsQ0FBQyJ9