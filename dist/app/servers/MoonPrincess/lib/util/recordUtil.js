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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL01vb25QcmluY2Vzcy9saWIvdXRpbC9yZWNvcmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU9BLFNBQWdCLGlCQUFpQixDQUFDLFNBQWlCLEVBQUUsY0FBK0IsRUFBRSxJQUFZO0lBQzlGLElBQUksTUFBTSxHQUFHLFFBQVEsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxHQUFHLENBQUM7SUFFekYsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUMxQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3JELENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQVJELDhDQVFDIn0=