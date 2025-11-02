"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function buildRecordResult(gameLevel, winningDetails, odds) {
    let prefix = `SPIN|${gameLevel.toString()}|${winningDetails.length.toString()}|${odds}|`;
    winningDetails.forEach(once => {
        prefix += `${once.type}${once.num}/${once.win}|`;
    });
    return prefix;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0NhbmR5UGFydHkvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFPQSxTQUFnQixpQkFBaUIsQ0FBQyxTQUFpQixFQUFFLGNBQStCLEVBQUUsSUFBWTtJQUM5RixJQUFJLE1BQU0sR0FBRyxRQUFRLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksR0FBRyxDQUFDO0lBRXpGLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDMUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNyRCxDQUFDLENBQUMsQ0FBQTtJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFSRCw4Q0FRQyJ9