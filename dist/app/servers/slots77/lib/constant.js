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
    golds: weights_1.golds,
    weight_golds: weights_1.weight_golds,
    award: award_1.award,
    freeSpin: 3,
    row: 3,
    column: 3,
    gold: 'W',
    oneSeven: 'G',
    twoSeven: 'H',
    threeSeven: 'I',
    anyBar: 'anyBar',
    anySeven: 'any7',
    maxAward: 750,
    overallControlSetting: {
        '1': -30,
        '2': -8,
        '3': 0,
    },
    freeSpinMapping: {
        '3': 5,
        '4': 10,
        '5': 20,
    },
    singleControlSetting: {
        '1': [0, 0],
        '2': [2, 8],
        '3': [3, 14],
    },
    sevenElementGroup: ['G', 'H', 'I'],
    barElementGroup: ['D', 'E', 'F']
};
exports.default = Constant;
exports.type = {
    'A': { name: '樱桃' },
    'B': { name: '铃铛' },
    'C': { name: '西瓜' },
    'D': { name: 'BAR' },
    'E': { name: '双星' },
    'F': { name: '葡萄' },
    'G': { name: '蓝莓' },
    'H': { name: '77' },
    'I': { name: '橙子' },
    'W': { name: '金币' },
};
exports.maxAward = 750;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9zbG90czc3L2xpYi9jb25zdGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBcUM7QUFDckMsZ0RBQTJDO0FBQzNDLHNEQUFpRDtBQUNqRCw4Q0FBK0Q7QUFHL0QsTUFBTSxRQUFRLEdBQUc7SUFFaEIsUUFBUSxFQUFFLG1CQUFRO0lBR2xCLFdBQVcsRUFBRSx5QkFBVztJQUd4QixPQUFPLEVBQUUsaUJBQU87SUFHaEIsS0FBSyxFQUFFLGVBQUs7SUFFVCxZQUFZLEVBQUUsc0JBQVk7SUFHN0IsS0FBSyxFQUFFLGFBQUs7SUFHWixRQUFRLEVBQUUsQ0FBQztJQUdYLEdBQUcsRUFBRSxDQUFDO0lBR04sTUFBTSxFQUFFLENBQUM7SUFHVCxJQUFJLEVBQUUsR0FBRztJQU1ULFFBQVEsRUFBRSxHQUFHO0lBR2IsUUFBUSxFQUFFLEdBQUc7SUFHYixVQUFVLEVBQUUsR0FBRztJQUdmLE1BQU0sRUFBRSxRQUFRO0lBR2hCLFFBQVEsRUFBRSxNQUFNO0lBR2hCLFFBQVEsRUFBRSxHQUFHO0lBR2IscUJBQXFCLEVBQUU7UUFDdEIsR0FBRyxFQUFFLENBQUMsRUFBRTtRQUNSLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQztLQUNOO0lBR0QsZUFBZSxFQUFFO1FBQ2hCLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLEVBQUU7UUFDUCxHQUFHLEVBQUUsRUFBRTtLQUNQO0lBR0Qsb0JBQW9CLEVBQUU7UUFDckIsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUdYLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWCxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0tBQ1o7SUFHRCxpQkFBaUIsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBR2xDLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBRWhDLENBQUM7QUFTRixrQkFBZSxRQUFRLENBQUM7QUFLWCxRQUFBLElBQUksR0FBRztJQUNuQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDO0lBQ2hCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUM7SUFDaEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQztJQUNoQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDO0lBQ2pCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUM7SUFDaEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQztJQUNoQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDO0lBQ2hCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUM7SUFDaEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQztJQUNoQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDO0NBQ2hCLENBQUM7QUFHVyxRQUFBLFFBQVEsR0FBRyxHQUFHLENBQUMifQ==