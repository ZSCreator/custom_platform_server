"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayCreatePlayerInRedis = void 0;
const propExclude = ["uid", "createTime"];
class DayCreatePlayerInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.DayCreatePlayerInRedis = DayCreatePlayerInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF5Q3JlYXRlUGxheWVyLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL2VudGl0eS9EYXlDcmVhdGVQbGF5ZXIuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUtBLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXpDLE1BQWEsc0JBQXNCO0lBTS9CLFlBQVksWUFBa0Q7UUFDMUQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDbkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLFNBQVM7YUFDWjtZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7U0FDbkI7SUFDTCxDQUFDO0NBQ0o7QUFkRCx3REFjQyJ9