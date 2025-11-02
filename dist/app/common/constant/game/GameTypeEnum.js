"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameTypeNameEnum = exports.GameTypeEnumList = exports.InteriorGameType = exports.GameTypeEnum = void 0;
var GameTypeEnum;
(function (GameTypeEnum) {
    GameTypeEnum[GameTypeEnum["ALL_GAME"] = 1] = "ALL_GAME";
    GameTypeEnum[GameTypeEnum["COMMON_GAME"] = 2] = "COMMON_GAME";
    GameTypeEnum[GameTypeEnum["QIPAI_GAME"] = 3] = "QIPAI_GAME";
    GameTypeEnum[GameTypeEnum["CIJI_GAME"] = 4] = "CIJI_GAME";
    GameTypeEnum[GameTypeEnum["ZHENREN_GAME"] = 5] = "ZHENREN_GAME";
    GameTypeEnum[GameTypeEnum["CAIPIAO_GAME"] = 6] = "CAIPIAO_GAME";
    GameTypeEnum[GameTypeEnum["SLOTS_GAME"] = 7] = "SLOTS_GAME";
})(GameTypeEnum = exports.GameTypeEnum || (exports.GameTypeEnum = {}));
var InteriorGameType;
(function (InteriorGameType) {
    InteriorGameType[InteriorGameType["None"] = 0] = "None";
    InteriorGameType[InteriorGameType["Br"] = 1] = "Br";
    InteriorGameType[InteriorGameType["Battle"] = 2] = "Battle";
    InteriorGameType[InteriorGameType["Slots"] = 3] = "Slots";
})(InteriorGameType = exports.InteriorGameType || (exports.InteriorGameType = {}));
exports.GameTypeEnumList = [
    { name: '全部游戏', typeId: 1 },
    { name: '常用游戏', typeId: 2 },
    { name: '棋牌游戏', typeId: 3 },
    { name: '刺激游戏', typeId: 4 },
    { name: '真人视讯', typeId: 5 },
    { name: '彩票足球', typeId: 6 },
    { name: '街机电玩', typeId: 7 },
];
var GameTypeNameEnum;
(function (GameTypeNameEnum) {
    GameTypeNameEnum["ALL_GAME"] = "\u5168\u90E8\u6E38\u620F";
    GameTypeNameEnum["COMMON_GAME"] = "\u5E38\u7528\u6E38\u620F";
    GameTypeNameEnum["QIPAI_GAME"] = "\u68CB\u724C\u6E38\u620F";
    GameTypeNameEnum["CIJI_GAME"] = "\u523A\u6FC0\u6E38\u620F";
    GameTypeNameEnum["ZHENREN_GAME"] = "\u771F\u4EBA\u89C6\u8BAF";
    GameTypeNameEnum["CAIPIAO_GAME"] = "\u5F69\u7968\u8DB3\u7403";
    GameTypeNameEnum["SLOTS_GAME"] = "\u8857\u673A\u7535\u73A9";
})(GameTypeNameEnum = exports.GameTypeNameEnum || (exports.GameTypeNameEnum = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVR5cGVFbnVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9jb25zdGFudC9nYW1lL0dhbWVUeXBlRW51bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxJQUFZLFlBZVg7QUFmRCxXQUFZLFlBQVk7SUFFcEIsdURBQVksQ0FBQTtJQUVaLDZEQUFlLENBQUE7SUFFZiwyREFBYyxDQUFBO0lBRWQseURBQWEsQ0FBQTtJQUViLCtEQUFnQixDQUFBO0lBRWhCLCtEQUFnQixDQUFBO0lBRWhCLDJEQUFjLENBQUE7QUFDbEIsQ0FBQyxFQWZXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBZXZCO0FBS0QsSUFBWSxnQkFRWDtBQVJELFdBQVksZ0JBQWdCO0lBQ3hCLHVEQUFJLENBQUE7SUFFSixtREFBRSxDQUFBO0lBRUYsMkRBQU0sQ0FBQTtJQUVOLHlEQUFLLENBQUE7QUFDVCxDQUFDLEVBUlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFRM0I7QUFFWSxRQUFBLGdCQUFnQixHQUFHO0lBQzVCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFDO0lBQ3hCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFDO0lBQ3hCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFDO0lBQ3hCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFDO0lBQ3hCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFDO0lBQ3hCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFDO0lBQ3hCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFDO0NBQzNCLENBQUM7QUFFRixJQUFZLGdCQWlCWDtBQWpCRCxXQUFZLGdCQUFnQjtJQUd4Qix5REFBaUIsQ0FBQTtJQUVqQiw0REFBb0IsQ0FBQTtJQUVwQiwyREFBbUIsQ0FBQTtJQUVuQiwwREFBa0IsQ0FBQTtJQUVsQiw2REFBcUIsQ0FBQTtJQUVyQiw2REFBcUIsQ0FBQTtJQUVyQiwyREFBbUIsQ0FBQTtBQUV2QixDQUFDLEVBakJXLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBaUIzQiJ9