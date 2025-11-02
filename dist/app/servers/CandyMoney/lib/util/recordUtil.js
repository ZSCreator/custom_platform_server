"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function buildRecordResult(RecordType, winningDetails, odds) {
    let prefix = `${RecordType}|${winningDetails.length.toString()}|${odds}|`;
    let result = [];
    result = result.concat.apply([], winningDetails);
    result.forEach(once => {
        prefix += `${once.type}${once.num}/${once.odds}/${once.win}|`;
    });
    return prefix;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0NhbmR5TW9uZXkvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFPQSxTQUFnQixpQkFBaUIsQ0FBQyxVQUEyQixFQUFFLGNBQWlDLEVBQUUsSUFBWTtJQUMxRyxJQUFJLE1BQU0sR0FBRyxHQUFHLFVBQVUsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksR0FBRyxDQUFDO0lBQzFFLElBQUksTUFBTSxHQUFvQixFQUFFLENBQUM7SUFDakMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNqRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2xCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNsRSxDQUFDLENBQUMsQ0FBQTtJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFURCw4Q0FTQyJ9