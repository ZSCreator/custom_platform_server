"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
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
function buildRecordResult(bet, betLine, winLines) {
    const linesCount = winLines.length;
    let lines = winLines.length === 0 ? '' : winLines.reduce(((str, line) => {
        return str + `${line.money}/${elementConversionConfig[line.type]}/${line.multiple}|`;
    }), '');
    if (lines.length)
        lines = lines.slice(0, lines.length - 1);
    return `${bet}|${betLine}|${linesCount}|${lines}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3Nsb3RzNzc3L2xpYi91dGlsL3JlY29yZFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBTSx1QkFBdUIsR0FBRztJQUM1QixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixRQUFRLEVBQUUsR0FBRztJQUNiLE1BQU0sRUFBRSxHQUFHO0NBQ2QsQ0FBQztBQVNGLFNBQWdCLGlCQUFpQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsUUFBZTtJQUUzRSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBRW5DLElBQUksS0FBSyxHQUFXLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUM1RSxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQztJQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVSLElBQUksS0FBSyxDQUFDLE1BQU07UUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUzRCxPQUFPLEdBQUcsR0FBRyxJQUFJLE9BQU8sSUFBSSxVQUFVLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdEQsQ0FBQztBQVhELDhDQVdDIn0=