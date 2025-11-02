"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlinePlayerInRedis = void 0;
const propExclude = ["uid", "nid", "isRobot", "entryHallTime", "sceneId", "roomId", "frontendServerId", "entryGameTime", "hallServerId"];
class OnlinePlayerInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.OnlinePlayerInRedis = OnlinePlayerInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25saW5lUGxheWVyLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL2VudGl0eS9PbmxpbmVQbGF5ZXIuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUtBLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBRXhJLE1BQWEsbUJBQW1CO0lBb0I1QixZQUFZLFlBQStDO1FBQ3ZELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixTQUFTO2FBQ1o7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztDQUNKO0FBNUJELGtEQTRCQyJ9