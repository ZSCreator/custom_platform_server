"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneInRedis = void 0;
const propExclude = ["nid", "sceneId", "name", "entryCond", "lowBet", "capBet", "allinMaxNum", "room_count", "canCarryGold", "blindBet", "ante", "bullet_value"];
class SceneInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            this[key] = val;
        }
    }
}
exports.SceneInRedis = SceneInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvZW50aXR5L1NjZW5lLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFFakssTUFBYSxZQUFZO0lBeUJyQixZQUFZLFlBQXdDO1FBQ2hELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBSW5ELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7U0FDbkI7SUFDTCxDQUFDO0NBRUo7QUFsQ0Qsb0NBa0NDIn0=