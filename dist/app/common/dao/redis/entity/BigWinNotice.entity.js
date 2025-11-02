"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigWinNoticeInRedis = void 0;
const propExclude = ["messageID", "isRobot", "params"];
class BigWinNoticeInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.BigWinNoticeInRedis = BigWinNoticeInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmlnV2luTm90aWNlLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL2VudGl0eS9CaWdXaW5Ob3RpY2UuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUtBLE1BQU0sV0FBVyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUV2RCxNQUFhLG1CQUFtQjtJQVE1QixZQUFZLFlBQStDO1FBQ3ZELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixTQUFTO2FBQ1o7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztDQUVKO0FBakJELGtEQWlCQyJ9