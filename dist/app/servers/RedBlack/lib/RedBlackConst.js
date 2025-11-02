"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankerRoundLimit = exports.bankerGoldLimit = exports.bankerProfitProportion = exports.mapping = exports.LimitRed = exports.leaveRound = exports.scrolling = exports.odds2 = exports.otherPair = exports.pair = exports.MAX_HISTORY_LENGTH = exports.route = exports.MAXCOUNT = exports.statusTime = exports.DIFFERENCE = exports.MAX = exports.areas = exports.betArea = exports.area = void 0;
var area;
(function (area) {
    area["red"] = "red";
    area["black"] = "black";
    area["draw"] = "draw";
})(area = exports.area || (exports.area = {}));
;
var betArea;
(function (betArea) {
    betArea["red"] = "red";
    betArea["black"] = "black";
    betArea["luck"] = "luck";
})(betArea = exports.betArea || (exports.betArea = {}));
;
exports.areas = ['red', "black", "luck"];
exports.MAX = 500000;
exports.DIFFERENCE = 500000;
var statusTime;
(function (statusTime) {
    statusTime[statusTime["LICENS"] = 3000] = "LICENS";
    statusTime[statusTime["BETTING"] = 15000] = "BETTING";
    statusTime[statusTime["OPENAWARD"] = 7000] = "OPENAWARD";
    statusTime[statusTime["SETTLEING"] = 6000] = "SETTLEING";
})(statusTime = exports.statusTime || (exports.statusTime = {}));
;
exports.MAXCOUNT = 100;
var route;
(function (route) {
    route["ListChange"] = "RedBlack_playersChange";
    route["Start"] = "RedBlack_Start";
    route["StartBet"] = "RedBlack_Bet";
    route["Lottery"] = "RedBlack_Lottery";
    route["Settle"] = "RedBlack_Settle";
    route["NoTiceBet"] = "RedBlack_OtherBets";
    route["topUp"] = "tRedBlack_opUpPlayer";
    route["queueLength"] = "RedBlack_bankerQueueLength";
})(route = exports.route || (exports.route = {}));
;
exports.MAX_HISTORY_LENGTH = 20;
exports.pair = {
    0: 14,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 9,
    9: 10,
    10: 11,
    11: 12,
    12: 13,
};
var otherPair;
(function (otherPair) {
    otherPair[otherPair["singular"] = 1] = "singular";
    otherPair[otherPair["shunza"] = 15] = "shunza";
    otherPair[otherPair["flower"] = 16] = "flower";
    otherPair[otherPair["flush"] = 17] = "flush";
    otherPair[otherPair["leopard"] = 18] = "leopard";
})(otherPair = exports.otherPair || (exports.otherPair = {}));
;
exports.odds2 = {
    red: 1.97,
    black: 1.97,
    18: 15,
    17: 10,
    16: 4,
    15: 3,
    14: 2, 13: 2, 12: 2, 11: 2, 10: 2, 9: 2, 8: 2
};
exports.scrolling = 1e5;
exports.leaveRound = 1;
var LimitRed;
(function (LimitRed) {
    LimitRed["personal"] = "personal";
    LimitRed["total"] = "total";
})(LimitRed = exports.LimitRed || (exports.LimitRed = {}));
;
var mapping;
(function (mapping) {
    mapping["black"] = "red";
    mapping["red"] = "black";
})(mapping = exports.mapping || (exports.mapping = {}));
;
exports.bankerProfitProportion = 0.4;
exports.bankerGoldLimit = {
    0: 2e5,
    1: 2e6,
    2: 2e6,
};
exports.bankerRoundLimit = 3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkQmxhY2tDb25zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1JlZEJsYWNrL2xpYi9SZWRCbGFja0NvbnN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLElBQVksSUFBb0Q7QUFBaEUsV0FBWSxJQUFJO0lBQUcsbUJBQVcsQ0FBQTtJQUFFLHVCQUFlLENBQUE7SUFBRSxxQkFBYSxDQUFBO0FBQUMsQ0FBQyxFQUFwRCxJQUFJLEdBQUosWUFBSSxLQUFKLFlBQUksUUFBZ0Q7QUFBQSxDQUFDO0FBR2pFLElBQVksT0FBdUQ7QUFBbkUsV0FBWSxPQUFPO0lBQUcsc0JBQVcsQ0FBQTtJQUFFLDBCQUFlLENBQUE7SUFBRSx3QkFBYSxDQUFBO0FBQUMsQ0FBQyxFQUF2RCxPQUFPLEdBQVAsZUFBTyxLQUFQLGVBQU8sUUFBZ0Q7QUFBQSxDQUFDO0FBRXZELFFBQUEsS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUdqQyxRQUFBLEdBQUcsR0FBRyxNQUFNLENBQUM7QUFHYixRQUFBLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFHakMsSUFBWSxVQUtYO0FBTEQsV0FBWSxVQUFVO0lBQ2xCLGtEQUFZLENBQUE7SUFDWixxREFBYyxDQUFBO0lBQ2Qsd0RBQWUsQ0FBQTtJQUNmLHdEQUFlLENBQUE7QUFDbkIsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0FBQUEsQ0FBQztBQUdXLFFBQUEsUUFBUSxHQUFHLEdBQUcsQ0FBQztBQVk1QixJQUFZLEtBU1g7QUFURCxXQUFZLEtBQUs7SUFDYiw4Q0FBcUMsQ0FBQTtJQUNyQyxpQ0FBd0IsQ0FBQTtJQUN4QixrQ0FBeUIsQ0FBQTtJQUN6QixxQ0FBNEIsQ0FBQTtJQUM1QixtQ0FBMEIsQ0FBQTtJQUMxQix5Q0FBZ0MsQ0FBQTtJQUNoQyx1Q0FBOEIsQ0FBQTtJQUM5QixtREFBMEMsQ0FBQTtBQUM5QyxDQUFDLEVBVFcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBU2hCO0FBQUEsQ0FBQztBQUdXLFFBQUEsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0FBR3hCLFFBQUEsSUFBSSxHQUFHO0lBQ2hCLENBQUMsRUFBRSxFQUFFO0lBQ0wsQ0FBQyxFQUFFLENBQUM7SUFDSixDQUFDLEVBQUUsQ0FBQztJQUNKLENBQUMsRUFBRSxDQUFDO0lBQ0osQ0FBQyxFQUFFLENBQUM7SUFDSixDQUFDLEVBQUUsQ0FBQztJQUNKLENBQUMsRUFBRSxDQUFDO0lBQ0osQ0FBQyxFQUFFLENBQUM7SUFDSixDQUFDLEVBQUUsQ0FBQztJQUNKLENBQUMsRUFBRSxFQUFFO0lBQ0wsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxFQUFFO0NBQ1QsQ0FBQztBQUdGLElBQVksU0FNWDtBQU5ELFdBQVksU0FBUztJQUNqQixpREFBWSxDQUFBO0lBQ1osOENBQVcsQ0FBQTtJQUNYLDhDQUFXLENBQUE7SUFDWCw0Q0FBVSxDQUFBO0lBQ1YsZ0RBQVksQ0FBQTtBQUNoQixDQUFDLEVBTlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFNcEI7QUFBQSxDQUFDO0FBR1csUUFBQSxLQUFLLEdBQUc7SUFDakIsR0FBRyxFQUFFLElBQUk7SUFDVCxLQUFLLEVBQUUsSUFBSTtJQUNYLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsQ0FBQztJQUNMLEVBQUUsRUFBRSxDQUFDO0lBQ0wsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDaEQsQ0FBQztBQUdXLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUdoQixRQUFBLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFHNUIsSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ2hCLGlDQUFxQixDQUFBO0lBQ3JCLDJCQUFlLENBQUE7QUFDbkIsQ0FBQyxFQUhXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBR25CO0FBQUEsQ0FBQztBQUVGLElBQVksT0FHWDtBQUhELFdBQVksT0FBTztJQUNmLHdCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0FBQ2pCLENBQUMsRUFIVyxPQUFPLEdBQVAsZUFBTyxLQUFQLGVBQU8sUUFHbEI7QUFBQSxDQUFDO0FBR1csUUFBQSxzQkFBc0IsR0FBRyxHQUFHLENBQUM7QUFHN0IsUUFBQSxlQUFlLEdBQUc7SUFDM0IsQ0FBQyxFQUFFLEdBQUc7SUFDTixDQUFDLEVBQUUsR0FBRztJQUNOLENBQUMsRUFBRSxHQUFHO0NBQ1QsQ0FBQztBQUdXLFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDIn0=