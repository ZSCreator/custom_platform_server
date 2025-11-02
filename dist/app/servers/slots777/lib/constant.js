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
    column: 5,
    scatter: 'S',
    wild: 'W',
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
    'C': { name: '钻石' },
    'D': { name: 'BAR' },
    'E': { name: '双BAR' },
    'F': { name: '三BAR' },
    'G': { name: '7' },
    'H': { name: '77' },
    'I': { name: '777' },
    'S': { name: 'SCATTER' },
    'W': { name: 'WILD' },
};
exports.maxAward = 750;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9zbG90czc3Ny9saWIvY29uc3RhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBQXFDO0FBQ3JDLGdEQUEyQztBQUMzQyxzREFBaUQ7QUFDakQsOENBQXlDO0FBR3pDLE1BQU0sUUFBUSxHQUFHO0lBRWhCLFFBQVEsRUFBRSxtQkFBUTtJQUdsQixXQUFXLEVBQUUseUJBQVc7SUFHeEIsT0FBTyxFQUFFLGlCQUFPO0lBR2hCLEtBQUssRUFBRSxhQUFLO0lBR1osR0FBRyxFQUFFLENBQUM7SUFHTixNQUFNLEVBQUUsQ0FBQztJQUdULE9BQU8sRUFBRSxHQUFHO0lBR1osSUFBSSxFQUFFLEdBQUc7SUFHVCxRQUFRLEVBQUUsR0FBRztJQUdiLFFBQVEsRUFBRSxHQUFHO0lBR2IsVUFBVSxFQUFFLEdBQUc7SUFHZixNQUFNLEVBQUUsUUFBUTtJQUdoQixRQUFRLEVBQUUsTUFBTTtJQUdoQixRQUFRLEVBQUUsR0FBRztJQUdiLHFCQUFxQixFQUFFO1FBQ3RCLEdBQUcsRUFBRSxDQUFDLEVBQUU7UUFDUixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsR0FBRyxFQUFFLENBQUM7S0FDTjtJQUdELGVBQWUsRUFBRTtRQUNoQixHQUFHLEVBQUUsQ0FBQztRQUNOLEdBQUcsRUFBRSxFQUFFO1FBQ1AsR0FBRyxFQUFFLEVBQUU7S0FDUDtJQUdELG9CQUFvQixFQUFFO1FBQ3JCLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFHWCxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztLQUNaO0lBR0QsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUdsQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUVoQyxDQUFDO0FBU0Ysa0JBQWUsUUFBUSxDQUFDO0FBS1gsUUFBQSxJQUFJLEdBQUc7SUFDbkIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQztJQUNoQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDO0lBQ2hCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUM7SUFDaEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQztJQUNqQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDO0lBQ2xCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUM7SUFDbEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQztJQUNmLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUM7SUFDaEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQztJQUNqQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFDO0lBQ3JCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUM7Q0FDbEIsQ0FBQztBQUdXLFFBQUEsUUFBUSxHQUFHLEdBQUcsQ0FBQyJ9