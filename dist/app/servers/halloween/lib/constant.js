"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchardGameElementType = exports.TURNTABLE_BONUS = exports.DICE_GAME_BONUS = exports.AWARD_LINE_COUNT = exports.ClayPotGameElementType = void 0;
const award_1 = require("./config/award");
const winLines_1 = require("./config/winLines");
const weights_1 = require("./config/weights");
const elemenets_1 = require("./config/elemenets");
const Constant = {
    winLines: winLines_1.winLines,
    weights: weights_1.weights,
    award: award_1.award,
    awardRow: award_1.awardRow,
    row: 3,
    column: 5,
    overallControlSetting: {
        '1': -30,
        '2': -8,
        '3': 0,
    },
    singleControlSetting: {
        '1': [0, 0],
        '2': [2, 8],
        '3': [3, 14],
    },
    littleGameElements: [
        elemenets_1.ElementsEnum.Vampire,
        elemenets_1.ElementsEnum.ClayPot,
        elemenets_1.ElementsEnum.Witch,
        elemenets_1.ElementsEnum.Wizard,
    ]
};
var ClayPotGameElementType;
(function (ClayPotGameElementType) {
    ClayPotGameElementType[ClayPotGameElementType["Fifty"] = 50] = "Fifty";
    ClayPotGameElementType[ClayPotGameElementType["SevenTyFive"] = 75] = "SevenTyFive";
    ClayPotGameElementType[ClayPotGameElementType["OneHundred"] = 100] = "OneHundred";
    ClayPotGameElementType[ClayPotGameElementType["OneHundredFifty"] = 150] = "OneHundredFifty";
    ClayPotGameElementType[ClayPotGameElementType["Bonus"] = 2] = "Bonus";
})(ClayPotGameElementType = exports.ClayPotGameElementType || (exports.ClayPotGameElementType = {}));
exports.AWARD_LINE_COUNT = 25;
exports.DICE_GAME_BONUS = 50;
exports.TURNTABLE_BONUS = 70;
var OrchardGameElementType;
(function (OrchardGameElementType) {
    OrchardGameElementType[OrchardGameElementType["None"] = 0] = "None";
    OrchardGameElementType[OrchardGameElementType["Two"] = 2] = "Two";
    OrchardGameElementType[OrchardGameElementType["Five"] = 5] = "Five";
    OrchardGameElementType[OrchardGameElementType["Ten"] = 10] = "Ten";
    OrchardGameElementType[OrchardGameElementType["Twenty"] = 20] = "Twenty";
    OrchardGameElementType[OrchardGameElementType["Fifty"] = 50] = "Fifty";
    OrchardGameElementType[OrchardGameElementType["OneHundred"] = 100] = "OneHundred";
})(OrchardGameElementType = exports.OrchardGameElementType || (exports.OrchardGameElementType = {}));
exports.default = Constant;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsb3dlZW4vbGliL2NvbnN0YW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQUErQztBQUMvQyxnREFBMkM7QUFDM0MsOENBQXlDO0FBQ3pDLGtEQUFnRDtBQUdoRCxNQUFNLFFBQVEsR0FBRztJQUVoQixRQUFRLEVBQUUsbUJBQVE7SUFHbEIsT0FBTyxFQUFFLGlCQUFPO0lBR2hCLEtBQUssRUFBRSxhQUFLO0lBRVosUUFBUSxFQUFFLGdCQUFRO0lBR2xCLEdBQUcsRUFBRSxDQUFDO0lBR04sTUFBTSxFQUFFLENBQUM7SUFHVCxxQkFBcUIsRUFBRTtRQUN0QixHQUFHLEVBQUUsQ0FBQyxFQUFFO1FBQ1IsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNQLEdBQUcsRUFBRSxDQUFDO0tBQ047SUFHRCxvQkFBb0IsRUFBRTtRQUNyQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7S0FDWjtJQUtELGtCQUFrQixFQUFFO1FBQ25CLHdCQUFZLENBQUMsT0FBTztRQUNwQix3QkFBWSxDQUFDLE9BQU87UUFDcEIsd0JBQVksQ0FBQyxLQUFLO1FBQ2xCLHdCQUFZLENBQUMsTUFBTTtLQUNuQjtDQUNELENBQUM7QUFRRixJQUFZLHNCQU1YO0FBTkQsV0FBWSxzQkFBc0I7SUFDakMsc0VBQVUsQ0FBQTtJQUNWLGtGQUFnQixDQUFBO0lBQ2hCLGlGQUFnQixDQUFBO0lBQ2hCLDJGQUFxQixDQUFBO0lBQ3JCLHFFQUFTLENBQUE7QUFDVixDQUFDLEVBTlcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFNakM7QUFJWSxRQUFBLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztBQUd0QixRQUFBLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFHckIsUUFBQSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBS2xDLElBQVksc0JBU1g7QUFURCxXQUFZLHNCQUFzQjtJQUVqQyxtRUFBUyxDQUFBO0lBQ1QsaUVBQU8sQ0FBQTtJQUNQLG1FQUFRLENBQUE7SUFDUixrRUFBUyxDQUFBO0lBQ1Qsd0VBQVksQ0FBQTtJQUNaLHNFQUFVLENBQUE7SUFDVixpRkFBZ0IsQ0FBQTtBQUNqQixDQUFDLEVBVFcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFTakM7QUFFRCxrQkFBZSxRQUFRLENBQUMifQ==