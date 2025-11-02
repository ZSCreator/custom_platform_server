"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxAward = exports.type = exports.baseBetList = void 0;
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
exports.baseBetList = [20, 40, 100, 400, 1000, 2000, 4000];
exports.type = {
    'A': { name: '一根竹子' },
    'B': { name: '二根竹子' },
    'C': { name: '三根竹子' },
    'D': { name: '橙子' },
    'E': { name: '茶壶' },
    'F': { name: '鱼' },
    'G': { name: '熊' },
    'H': { name: '熊猫' },
};
exports.maxAward = 750;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9UcmlwbGVQYW5kYS9saWIvY29uc3RhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBQXVDO0FBQ3ZDLGdEQUE2QztBQUM3QyxzREFBbUQ7QUFDbkQsOENBQTJDO0FBRzNDLE1BQU0sUUFBUSxHQUFHO0lBRWhCLFFBQVEsRUFBRSxtQkFBUTtJQUdsQixXQUFXLEVBQUUseUJBQVc7SUFHeEIsT0FBTyxFQUFFLGlCQUFPO0lBR2hCLEtBQUssRUFBRSxhQUFLO0lBR1osR0FBRyxFQUFFLENBQUM7SUFHTixNQUFNLEVBQUUsQ0FBQztJQUlULFFBQVEsRUFBRSxHQUFHO0lBR2IscUJBQXFCLEVBQUU7UUFDdEIsR0FBRyxFQUFFLENBQUMsRUFBRTtRQUNSLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQztLQUNOO0lBR0QsZUFBZSxFQUFFLENBQUM7SUFHbEIsb0JBQW9CLEVBQUU7UUFDckIsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWCxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0tBQ1o7Q0FDRCxDQUFDO0FBU0Ysa0JBQWUsUUFBUSxDQUFDO0FBRVgsUUFBQSxXQUFXLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQztBQUlqRCxRQUFBLElBQUksR0FBRztJQUNuQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO0lBQ3JCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7SUFDckIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtJQUNyQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0lBQ25CLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7SUFDbkIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtJQUNsQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7Q0FDbkIsQ0FBQztBQUdXLFFBQUEsUUFBUSxHQUFHLEdBQUcsQ0FBQyJ9