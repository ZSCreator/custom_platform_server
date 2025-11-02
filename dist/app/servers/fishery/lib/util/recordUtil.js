"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
const fisheryConst_1 = require("../fisheryConst");
function buildRecordResult(lotteryResult) {
    let result = '';
    if (lotteryResult === 'B') {
        return '014';
    }
    result += parseInt(lotteryResult).toString(16);
    const types = fisheryConst_1.FISHTYPE[lotteryResult];
    switch (true) {
        case types.brine:
            result += '0';
            break;
        case types.fightFlood:
            result += '2';
            break;
    }
    switch (true) {
        case types.shoalSater:
            result += '0';
            break;
        case types.deepwater:
            result += '1';
            break;
        case types.watch:
            result += '2';
            break;
        case types.rare:
            result += '3';
            break;
    }
    return result;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Zpc2hlcnkvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFBeUM7QUFTekMsU0FBZ0IsaUJBQWlCLENBQUMsYUFBcUI7SUFDbkQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBR2hCLElBQUksYUFBYSxLQUFLLEdBQUcsRUFBRTtRQUN2QixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUdELE1BQU0sSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRy9DLE1BQU0sS0FBSyxHQUFHLHVCQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFdEMsUUFBUSxJQUFJLEVBQUU7UUFDVixLQUFLLEtBQUssQ0FBQyxLQUFLO1lBQUUsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUFDLE1BQU07UUFDdkMsS0FBSyxLQUFLLENBQUMsVUFBVTtZQUFFLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFBQyxNQUFNO0tBQy9DO0lBR0QsUUFBUSxJQUFJLEVBQUU7UUFDVixLQUFLLEtBQUssQ0FBQyxVQUFVO1lBQUUsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUFDLE1BQU07UUFDNUMsS0FBSyxLQUFLLENBQUMsU0FBUztZQUFFLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFBQyxNQUFNO1FBQzNDLEtBQUssS0FBSyxDQUFDLEtBQUs7WUFBRSxNQUFNLElBQUksR0FBRyxDQUFDO1lBQUMsTUFBTTtRQUN2QyxLQUFLLEtBQUssQ0FBQyxJQUFJO1lBQUUsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUFDLE1BQU07S0FDekM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBNUJELDhDQTRCQyJ9