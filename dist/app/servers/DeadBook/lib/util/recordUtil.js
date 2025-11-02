"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNormalRecord = exports.buildRecordResult = void 0;
const GameUtil_1 = require("../../../../utils/GameUtil");
const elementConversionConfig = {
    'A': '1',
    'B': '2',
    'C': '3',
    'D': '4',
    'E': '5',
    'F': '6',
    'G': '7',
    'H': '8',
    'I': '9',
    'anyBar': 'a',
    'any7': 'b',
};
function buildRecordResult(bet, winLines) {
    const linesCount = winLines.length;
    let lines = winLines.length === 0 ? '' : winLines.reduce(((str, line) => {
        return str + `${line.money}/${elementConversionConfig[line.type]}/${line.multiple}|`;
    }), '');
    if (lines.length)
        lines = lines.slice(0, lines.length - 1);
    return `${bet}|${linesCount}|${lines}`;
}
exports.buildRecordResult = buildRecordResult;
function buildNormalRecord(player, normal, bet, winLines) {
    if (normal) {
        return `1|${buildRecordResult(bet, winLines)}`;
    }
    const openStr = player.disCards.reduce((s, card) => {
        return s + (0, GameUtil_1.conversionCards)(card);
    }, '');
    return `0|${player.boTimes < 5 ? 1 : 0}/${player.boTimes}/${player.boProfit}/${openStr}|${buildRecordResult(bet, winLines)}`;
}
exports.buildNormalRecord = buildNormalRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RlYWRCb29rL2xpYi91dGlsL3JlY29yZFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EseURBQTJEO0FBRTNELE1BQU0sdUJBQXVCLEdBQUc7SUFDNUIsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsUUFBUSxFQUFFLEdBQUc7SUFDYixNQUFNLEVBQUUsR0FBRztDQUNkLENBQUM7QUFRRixTQUFnQixpQkFBaUIsQ0FBQyxHQUFXLEVBQUUsUUFBZTtJQUUxRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBRW5DLElBQUksS0FBSyxHQUFXLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUM1RSxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQztJQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVSLElBQUksS0FBSyxDQUFDLE1BQU07UUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUzRCxPQUFPLEdBQUcsR0FBRyxJQUFJLFVBQVUsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUMzQyxDQUFDO0FBWEQsOENBV0M7QUFTRCxTQUFnQixpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsTUFBZSxFQUFFLEdBQVcsRUFBRSxRQUFlO0lBQzNGLElBQUksTUFBTSxFQUFFO1FBRVIsT0FBTyxLQUFLLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO0tBQ2xEO0lBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDL0MsT0FBTyxDQUFDLEdBQUcsSUFBQSwwQkFBZSxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUlQLE9BQU8sS0FBSyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztBQUNqSSxDQUFDO0FBYkQsOENBYUMifQ==