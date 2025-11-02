"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function buildRecordResult(player, data) {
    let prefix = `${player.bet / 100}|`;
    let suffix = data.rebate.toString();
    if (suffix.length === 2) {
        suffix = `0${suffix}`;
    }
    else if (suffix.length === 1) {
        suffix = `00${suffix}`;
    }
    prefix += suffix;
    return data.result.reduce((prefix, s) => prefix += s.toString(), prefix);
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NjcmF0Y2gvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFPQSxTQUFnQixpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsSUFBUztJQUN2RCxJQUFJLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDcEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUVwQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0tBQ3pCO1NBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM1QixNQUFNLEdBQUcsS0FBSyxNQUFNLEVBQUUsQ0FBQztLQUMxQjtJQUVELE1BQU0sSUFBSSxNQUFNLENBQUM7SUFFakIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0UsQ0FBQztBQWJELDhDQWFDIn0=