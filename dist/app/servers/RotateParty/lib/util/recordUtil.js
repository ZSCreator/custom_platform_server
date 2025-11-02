"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function buildRecordResult(bet, betLine, winLines) {
    const linesCount = winLines.length;
    let lines = winLines.length === 0 ? '' : winLines.reduce(((str, line) => {
        return str + `${line.money}/${line.type}/${line.multiple}|`;
    }), '');
    if (lines.length)
        lines = lines.slice(0, lines.length - 1);
    return `${bet}|${betLine}|${linesCount}|${lines}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1JvdGF0ZVBhcnR5L2xpYi91dGlsL3JlY29yZFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBTUEsU0FBZ0IsaUJBQWlCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxRQUFlO0lBRTNFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFFbkMsSUFBSSxLQUFLLEdBQVcsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQzVFLE9BQU8sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQztJQUNoRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVSLElBQUksS0FBSyxDQUFDLE1BQU07UUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUzRCxPQUFPLEdBQUcsR0FBRyxJQUFJLE9BQU8sSUFBSSxVQUFVLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdEQsQ0FBQztBQVhELDhDQVdDIn0=