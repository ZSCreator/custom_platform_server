"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxAward = exports.type = void 0;
const award_1 = require("./config/award");
const winLines_1 = require("./config/winLines");
const elementType_1 = require("./config/elementType");
const weights_1 = require("./config/weights");
const Constant = {
    winLines: winLines_1.winLines,
    elementType: elementType_1.elementType,
    weights: weights_1.weights,
    award: award_1.award,
    row: 3,
    column: 3,
    maxAward: 750,
    overallControlSetting: {
        '1': -30,
        '2': -8,
        '3': 0,
    },
    freeSpinMapping: 9,
    singleControlSetting: {
        '1': [0, 0],
        '2': [2, 8],
        '3': [3, 14],
    },
};
exports.default = Constant;
exports.type = {
    'A': { name: '宝箱' },
    'B': { name: '金砖' },
    'C': { name: '树' },
    'D': { name: '老虎机' },
    'E': { name: '钻石' },
    'F': { name: '皇冠' },
    'G': { name: '钞票' },
    'H': { name: '猪' },
    'I': { name: '草' },
    'W': { name: '保险箱' },
};
exports.maxAward = 750;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nZW1zL2xpYi9jb25zdGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBdUM7QUFDdkMsZ0RBQTZDO0FBQzdDLHNEQUFtRDtBQUNuRCw4Q0FBMkM7QUFHM0MsTUFBTSxRQUFRLEdBQUc7SUFFaEIsUUFBUSxFQUFFLG1CQUFRO0lBR2xCLFdBQVcsRUFBRSx5QkFBVztJQUd4QixPQUFPLEVBQUUsaUJBQU87SUFHaEIsS0FBSyxFQUFFLGFBQUs7SUFHWixHQUFHLEVBQUUsQ0FBQztJQUdOLE1BQU0sRUFBRSxDQUFDO0lBSVQsUUFBUSxFQUFFLEdBQUc7SUFHYixxQkFBcUIsRUFBRTtRQUN0QixHQUFHLEVBQUUsQ0FBQyxFQUFFO1FBQ1IsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNQLEdBQUcsRUFBRSxDQUFDO0tBQ047SUFHRCxlQUFlLEVBQUUsQ0FBQztJQUdsQixvQkFBb0IsRUFBRTtRQUNyQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBR1gsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7S0FDWjtDQUNELENBQUM7QUFTRixrQkFBZSxRQUFRLENBQUM7QUFLWCxRQUFBLElBQUksR0FBRztJQUNuQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0lBQ25CLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7SUFDbkIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtJQUNsQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ3BCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7SUFDbkIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtJQUNuQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0lBQ25CLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7SUFDbEIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtJQUNsQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0NBRXBCLENBQUM7QUFHVyxRQUFBLFFBQVEsR0FBRyxHQUFHLENBQUMifQ==