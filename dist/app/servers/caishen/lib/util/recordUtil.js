"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
const elementConversionConfig = {
    'A': '1',
    'B': '2',
    'C': '3',
    'D': '4',
    'E': '5',
    'H': '6',
    'W': '7',
};
function buildRecordResult(bet, winLines) {
    let lines = "";
    if (winLines) {
        lines = `${winLines.money}/${elementConversionConfig[winLines.type]}/${winLines.multiple}|`;
    }
    return `${bet}|${lines}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NhaXNoZW4vbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxNQUFNLHVCQUF1QixHQUFHO0lBQzVCLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0NBQ1gsQ0FBQztBQVNGLFNBQWdCLGlCQUFpQixDQUFDLEdBQVcsRUFBRSxRQUFhO0lBR3hELElBQUksS0FBSyxHQUFXLEVBQUUsQ0FBQztJQUN2QixJQUFJLFFBQVEsRUFBRTtRQUNWLEtBQUssR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQztLQUMvRjtJQUNELE9BQU8sR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQVJELDhDQVFDIn0=