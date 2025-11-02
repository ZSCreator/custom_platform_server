"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLineNum = exports.type = exports.ColorType = exports.BoTimes = exports.PlayerGameState = exports.specialAward = exports.baseElements = exports.specialElements = void 0;
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
    wild: 'W',
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
    }
};
exports.specialElements = ['A', 'B', 'C', 'D'];
exports.baseElements = ['A', 'B', 'C', 'D', "E", "F", "G", "H", "I"];
exports.specialAward = {
    '3': 2,
    '4': 20,
    '5': 200,
};
var PlayerGameState;
(function (PlayerGameState) {
    PlayerGameState[PlayerGameState["NORMAL"] = 0] = "NORMAL";
    PlayerGameState[PlayerGameState["BO"] = 1] = "BO";
})(PlayerGameState = exports.PlayerGameState || (exports.PlayerGameState = {}));
exports.BoTimes = 5;
var ColorType;
(function (ColorType) {
    ColorType[ColorType["Spade"] = 0] = "Spade";
    ColorType[ColorType["Heart"] = 1] = "Heart";
    ColorType[ColorType["Club"] = 2] = "Club";
    ColorType[ColorType["Diamond"] = 3] = "Diamond";
    ColorType[ColorType["Black"] = 22] = "Black";
    ColorType[ColorType["Red"] = 11] = "Red";
})(ColorType = exports.ColorType || (exports.ColorType = {}));
exports.default = Constant;
exports.type = {
    'A': { name: '探险家' },
    'B': { name: '法老' },
    'C': { name: '阿努比斯' },
    'D': { name: '贝努' },
    'E': { name: 'A' },
    'F': { name: 'K' },
    'G': { name: 'Q' },
    'H': { name: 'J' },
    'I': { name: '10' },
    'W': { name: 'WILD' },
};
exports.defaultLineNum = 10;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EZWFkQm9vay9saWIvY29uc3RhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBQXFDO0FBQ3JDLGdEQUEyQztBQUMzQyxzREFBaUQ7QUFDakQsOENBQXlDO0FBR3pDLE1BQU0sUUFBUSxHQUFHO0lBRWhCLFFBQVEsRUFBRSxtQkFBUTtJQUdsQixXQUFXLEVBQUUseUJBQVc7SUFHeEIsT0FBTyxFQUFFLGlCQUFPO0lBR2hCLEtBQUssRUFBRSxhQUFLO0lBR1osR0FBRyxFQUFFLENBQUM7SUFHTixNQUFNLEVBQUUsQ0FBQztJQUdULElBQUksRUFBRSxHQUFHO0lBR1QscUJBQXFCLEVBQUU7UUFDdEIsR0FBRyxFQUFFLENBQUMsRUFBRTtRQUNSLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQztLQUNOO0lBR0QsZUFBZSxFQUFFO1FBQ2hCLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLEVBQUU7UUFDUCxHQUFHLEVBQUUsRUFBRTtLQUNQO0lBR0Qsb0JBQW9CLEVBQUU7UUFDckIsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUdYLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWCxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0tBQ1o7Q0FDRCxDQUFDO0FBR1csUUFBQSxlQUFlLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUd2QyxRQUFBLFlBQVksR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUcsR0FBRyxFQUFHLEdBQUcsRUFBRyxHQUFHLEVBQUcsR0FBRyxDQUFDLENBQUM7QUFHakUsUUFBQSxZQUFZLEdBQUc7SUFDM0IsR0FBRyxFQUFFLENBQUM7SUFDTixHQUFHLEVBQUUsRUFBRTtJQUNQLEdBQUcsRUFBRSxHQUFHO0NBQ1IsQ0FBQTtBQUtELElBQVksZUFLWDtBQUxELFdBQVksZUFBZTtJQUUxQix5REFBTSxDQUFBO0lBRU4saURBQUUsQ0FBQTtBQUNILENBQUMsRUFMVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUsxQjtBQUdZLFFBQUEsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUd6QixJQUFZLFNBYVg7QUFiRCxXQUFZLFNBQVM7SUFFcEIsMkNBQVMsQ0FBQTtJQUVULDJDQUFTLENBQUE7SUFFVCx5Q0FBUSxDQUFBO0lBRVIsK0NBQVcsQ0FBQTtJQUVYLDRDQUFVLENBQUE7SUFFVix3Q0FBUSxDQUFBO0FBQ1QsQ0FBQyxFQWJXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBYXBCO0FBS0Qsa0JBQWUsUUFBUSxDQUFDO0FBS1gsUUFBQSxJQUFJLEdBQUc7SUFDbkIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQztJQUNqQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDO0lBQ2hCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUM7SUFDbEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQztJQUNoQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFDO0lBQ2YsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQztJQUNmLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUM7SUFDZixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFDO0lBQ2YsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQztJQUNoQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDO0NBQ2xCLENBQUM7QUFHVyxRQUFBLGNBQWMsR0FBRyxFQUFFLENBQUMifQ==