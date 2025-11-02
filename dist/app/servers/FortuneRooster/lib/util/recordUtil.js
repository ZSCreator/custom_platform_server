"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function buildRecordResult(bet, betLine, winLines) {
    const linesCount = winLines.length;
    const bill = [];
    let lines = '';
    winLines.forEach(line => {
        bill.push(`${line.money}/${line.type}/${line.multiple}|`);
    });
    if (bill.length) {
        while (bill.length) {
            const first = bill[0];
            const others = bill.filter(detail => detail === first);
            lines += `${others.length}/${first}`;
            others.forEach(o => {
                const index = bill.findIndex(detail => detail === o);
                if (index !== -1) {
                    bill.splice(index, 1);
                }
            });
        }
    }
    if (lines.length)
        lines = lines.slice(0, lines.length - 1);
    return `${bet}|${betLine}|${linesCount}|${lines}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0ZvcnR1bmVSb29zdGVyL2xpYi91dGlsL3JlY29yZFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBU0EsU0FBZ0IsaUJBQWlCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxRQUFtQjtJQUUvRSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ25DLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNoQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7SUFFZCxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUM7WUFDdkQsS0FBSyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUVyQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjtZQUNMLENBQUMsQ0FBQyxDQUFBO1NBQ0w7S0FDSjtJQUVELElBQUksS0FBSyxDQUFDLE1BQU07UUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUzRCxPQUFPLEdBQUcsR0FBRyxJQUFJLE9BQU8sSUFBSSxVQUFVLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdEQsQ0FBQztBQTVCRCw4Q0E0QkMifQ==