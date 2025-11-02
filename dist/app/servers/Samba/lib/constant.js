"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyOddsMap = exports.type = exports.ColorType = exports.BoTimes = exports.PlayerGameState = exports.anyList = exports.ElementEnum = exports.DEFAULT_LINE_NUM = exports.COLUMN_NUM = exports.ROW_NUM = void 0;
exports.ROW_NUM = 3;
exports.COLUMN_NUM = 5;
exports.DEFAULT_LINE_NUM = 15;
;
var ElementEnum;
(function (ElementEnum) {
    ElementEnum["LEMON"] = "A";
    ElementEnum["ORANGE"] = "B";
    ElementEnum["WATERMELON"] = "C";
    ElementEnum["PINEAPPLE"] = "D";
    ElementEnum["GREEN"] = "E";
    ElementEnum["BLUE"] = "F";
    ElementEnum["PINK"] = "G";
    ElementEnum["ANY_TWO"] = "H";
    ElementEnum["ANY_THREE"] = "I";
    ElementEnum["ANY_FOUR"] = "J";
    ElementEnum["ANY_FIVE"] = "K";
    ElementEnum["SAMBA"] = "L";
})(ElementEnum = exports.ElementEnum || (exports.ElementEnum = {}));
exports.anyList = [ElementEnum.ANY_FIVE, ElementEnum.ANY_FOUR, ElementEnum.ANY_THREE, ElementEnum.ANY_TWO];
var PlayerGameState;
(function (PlayerGameState) {
    PlayerGameState[PlayerGameState["NORMAL"] = 0] = "NORMAL";
    PlayerGameState[PlayerGameState["FREE"] = 1] = "FREE";
    PlayerGameState[PlayerGameState["BO"] = 2] = "BO";
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
exports.type = {
    'A': { name: '柠檬' },
    'B': { name: '橘子' },
    'C': { name: '西瓜' },
    'D': { name: '菠萝' },
    'E': { name: '绿色桑巴女郎' },
    'F': { name: '蓝色桑巴女郎' },
    'G': { name: '粉色桑巴女郎' },
    'H': { name: 'ANY*2' },
    'I': { name: 'ANY*3' },
    'J': { name: 'ANY*4' },
    'K': { name: 'ANY*5' },
    'L': { name: 'SAMBA' },
};
exports.anyOddsMap = {
    [ElementEnum.ANY_TWO]: 2,
    [ElementEnum.ANY_THREE]: 3,
    [ElementEnum.ANY_FOUR]: 4,
    [ElementEnum.ANY_FIVE]: 5,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TYW1iYS9saWIvY29uc3RhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR2EsUUFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBRVosUUFBQSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBR2YsUUFBQSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDbkMsQ0FBQztBQUVELElBQVksV0FhWDtBQWJELFdBQVksV0FBVztJQUN0QiwwQkFBVyxDQUFBO0lBQ1gsMkJBQVksQ0FBQTtJQUNaLCtCQUFnQixDQUFBO0lBQ2hCLDhCQUFlLENBQUE7SUFDZiwwQkFBVyxDQUFBO0lBQ1gseUJBQVUsQ0FBQTtJQUNWLHlCQUFVLENBQUE7SUFDViw0QkFBYSxDQUFBO0lBQ2IsOEJBQWUsQ0FBQTtJQUNmLDZCQUFjLENBQUE7SUFDZCw2QkFBYyxDQUFBO0lBQ2QsMEJBQVcsQ0FBQTtBQUNaLENBQUMsRUFiVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQWF0QjtBQUdZLFFBQUEsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBTWhILElBQVksZUFPWDtBQVBELFdBQVksZUFBZTtJQUUxQix5REFBTSxDQUFBO0lBRU4scURBQUksQ0FBQTtJQUVKLGlEQUFFLENBQUE7QUFDSCxDQUFDLEVBUFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFPMUI7QUFHWSxRQUFBLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFHekIsSUFBWSxTQWFYO0FBYkQsV0FBWSxTQUFTO0lBRXBCLDJDQUFTLENBQUE7SUFFVCwyQ0FBUyxDQUFBO0lBRVQseUNBQVEsQ0FBQTtJQUVSLCtDQUFXLENBQUE7SUFFWCw0Q0FBVSxDQUFBO0lBRVYsd0NBQVEsQ0FBQTtBQUNULENBQUMsRUFiVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQWFwQjtBQUtZLFFBQUEsSUFBSSxHQUFHO0lBQ25CLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUM7SUFDaEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQztJQUNoQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDO0lBQ2hCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUM7SUFDaEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBQztJQUNwQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFDO0lBQ3BCLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUM7SUFDcEIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLE9BQU8sRUFBQztJQUNuQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFDO0lBQ25CLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUM7SUFDbkIsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFDLE9BQU8sRUFBQztJQUNuQixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFDO0NBQ25CLENBQUM7QUFFVyxRQUFBLFVBQVUsR0FBRztJQUN6QixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQ3hCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7SUFDMUIsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztJQUN6QixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0NBQ3pCLENBQUEifQ==