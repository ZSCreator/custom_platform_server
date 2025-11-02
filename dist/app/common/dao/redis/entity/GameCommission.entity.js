"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCommissionInRedis = void 0;
const propExclude = ["nid", "way", "targetCharacter", "bet", "win", "settle", "open"];
class GameCommissionInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.GameCommissionInRedis = GameCommissionInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUNvbW1pc3Npb24uZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvZW50aXR5L0dhbWVDb21taXNzaW9uLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsTUFBTSxDQUFDLENBQUM7QUFFckYsTUFBYSxxQkFBcUI7SUFtQzlCLFlBQVksWUFBaUQ7UUFDekQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDbkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLFNBQVM7YUFDWjtZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7U0FDbkI7SUFDTCxDQUFDO0NBQ0o7QUEzQ0Qsc0RBMkNDIn0=