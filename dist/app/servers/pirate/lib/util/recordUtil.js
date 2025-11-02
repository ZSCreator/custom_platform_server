"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLittleGameResult = exports.buildRecordResult = void 0;
var RecordType;
(function (RecordType) {
    RecordType[RecordType["SPIN"] = 0] = "SPIN";
    RecordType[RecordType["LITTER"] = 1] = "LITTER";
})(RecordType || (RecordType = {}));
function buildRecordResult(betOdds, result, totalBet) {
    let prefix = `${RecordType.SPIN.toString()}|${totalBet / 100}|${betOdds}|${result.winLines.length}|`;
    const types = {};
    result.winLines.forEach(once => {
        const str = `${once.type}${once.count}/${once.win}`;
        if (!types[str]) {
            types[str] = 1;
        }
        else {
            types[str] += 1;
        }
    });
    for (let str in types) {
        prefix += `${str}/${types[str]}|`;
    }
    return prefix;
}
exports.buildRecordResult = buildRecordResult;
function buildLittleGameResult(totalBet, odds) {
    return `${RecordType.LITTER.toString()}|${totalBet}|${odds}|`;
}
exports.buildLittleGameResult = buildLittleGameResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3BpcmF0ZS9saWIvdXRpbC9yZWNvcmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU9BLElBQUssVUFHSjtBQUhELFdBQUssVUFBVTtJQUNYLDJDQUFJLENBQUE7SUFDSiwrQ0FBTSxDQUFBO0FBQ1YsQ0FBQyxFQUhJLFVBQVUsS0FBVixVQUFVLFFBR2Q7QUFRRCxTQUFnQixpQkFBaUIsQ0FBQyxPQUFlLEVBQUUsTUFBb0IsRUFBRSxRQUFnQjtJQUNyRixJQUFJLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksUUFBUSxHQUFDLEdBQUcsSUFBSSxPQUFPLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztJQUVuRyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFakIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDM0IsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXBELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2xCO2FBQU07WUFDSCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRTtRQUNuQixNQUFNLElBQUksR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUE7S0FDcEM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBcEJELDhDQW9CQztBQU9ELFNBQWdCLHFCQUFxQixDQUFDLFFBQWdCLEVBQUUsSUFBWTtJQUNoRSxPQUFPLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxRQUFRLElBQUksSUFBSSxHQUFHLENBQUM7QUFDbEUsQ0FBQztBQUZELHNEQUVDIn0=