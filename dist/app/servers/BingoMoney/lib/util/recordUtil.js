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
    'W': 'a',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JpbmdvTW9uZXkvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxNQUFNLHVCQUF1QixHQUFHO0lBQzVCLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0NBRVgsQ0FBQztBQVNGLFNBQWdCLGlCQUFpQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsUUFBZTtJQUUzRSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBRW5DLElBQUksS0FBSyxHQUFXLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUM1RSxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQztJQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVSLElBQUksS0FBSyxDQUFDLE1BQU07UUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUzRCxPQUFPLEdBQUcsR0FBRyxJQUFJLE9BQU8sSUFBSSxVQUFVLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdEQsQ0FBQztBQVhELDhDQVdDIn0=