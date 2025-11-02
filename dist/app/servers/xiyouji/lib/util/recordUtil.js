"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function buildRecordResult(bet, betLine, result) {
    const linesCount = result.roundsAward.reduce((total, once) => {
        return total += once.winLines.length;
    }, 0);
    let suffix = '';
    if (linesCount !== 0) {
        result.roundsAward.forEach(once => {
            once.winLines.forEach(line => {
                suffix += `${line.type}${line.linkNum}/${line.money}|`;
            });
        });
    }
    return `${bet}|${betLine}|${linesCount}|${suffix}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3hpeW91amkvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRQSxTQUFnQixpQkFBaUIsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQXdCO0lBRXBGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3pELE9BQU8sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ3pDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVOLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7UUFDbEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztLQUNOO0lBRUQsT0FBTyxHQUFHLEdBQUcsSUFBSSxPQUFPLElBQUksVUFBVSxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBQ3ZELENBQUM7QUFoQkQsOENBZ0JDIn0=