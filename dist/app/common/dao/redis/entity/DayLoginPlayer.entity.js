"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayLoginPlayerInRedis = void 0;
const propExclude = ["uid", "loginTime", "loginNum"];
class DayLoginPlayerInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.DayLoginPlayerInRedis = DayLoginPlayerInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF5TG9naW5QbGF5ZXIuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvZW50aXR5L0RheUxvZ2luUGxheWVyLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFcEQsTUFBYSxxQkFBcUI7SUFROUIsWUFBWSxZQUFpRDtRQUN6RCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsU0FBUzthQUNaO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUNuQjtJQUNMLENBQUM7Q0FDSjtBQWhCRCxzREFnQkMifQ==