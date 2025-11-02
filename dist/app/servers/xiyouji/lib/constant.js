"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxAward = exports.bets = exports.linesNum = exports.element = exports.mappingElement = exports.betNums = exports.characterIcon = exports.specialElements = exports.bonus = exports.wild = exports.monkey = exports.column = exports.row = void 0;
exports.row = 3;
exports.column = 5;
exports.monkey = 'i';
exports.wild = 'wild';
exports.bonus = 'bonus';
exports.specialElements = ['g', 'h', 'i'];
exports.characterIcon = ['1', '2', '3', '4', '5'];
exports.betNums = [2, 10, 40, 100, 400, 2000];
exports.mappingElement = {
    'a': '捆仙索',
    'b': '铃铛',
    'c': '宝塔',
    'd': '铜锣',
    'e': '琵琶',
    'f': '芭蕉扇',
    'g': '乾坤袋',
    'h': '葫芦',
    'i': '猴子',
    'wild': 'wild',
    'bonus': 'bonus',
};
exports.element = {
    general: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
    special: ['wild', 'bonus'],
};
exports.linesNum = [9, 15, 25];
exports.bets = [2, 10, 40, 100, 400, 2000];
exports.maxAward = 23;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy94aXlvdWppL2xpYi9jb25zdGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDYSxRQUFBLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFHUixRQUFBLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFHWCxRQUFBLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFHYixRQUFBLElBQUksR0FBRyxNQUFNLENBQUM7QUFHZCxRQUFBLEtBQUssR0FBRyxPQUFPLENBQUM7QUFNaEIsUUFBQSxlQUFlLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBR2xDLFFBQUEsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRzFDLFFBQUEsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUt0QyxRQUFBLGNBQWMsR0FBRztJQUMxQixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxNQUFNLEVBQUUsTUFBTTtJQUNkLE9BQU8sRUFBRSxPQUFPO0NBQ25CLENBQUM7QUFHVyxRQUFBLE9BQU8sR0FBRztJQUNuQixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUN0RCxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0NBQzdCLENBQUM7QUFHVyxRQUFBLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsUUFBQSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBR25DLFFBQUEsUUFBUSxHQUFHLEVBQUUsQ0FBQyJ9