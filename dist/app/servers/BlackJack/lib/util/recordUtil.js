"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
const GameUtil_1 = require("../../../../utils/GameUtil");
function buildRecordResult(dealerArea, commonAreaList) {
    const count = Math.max(...dealerArea.countList);
    let banker = `${(0, GameUtil_1.conversionCards)(dealerArea.pokerList)}/${count > 21 ? '00' : count < 10 ? ('0' + count.toString()) : count.toString()}|`;
    let suffix = '';
    commonAreaList.forEach((area, index) => {
        if (area.getCurrentBet() === 0) {
            return;
        }
        const count = area.getCount();
        suffix += `${index + 1}/${(0, GameUtil_1.conversionCards)(area.getPokerList().basePokerList)}/${count > 21 ? '00' : count < 10 ? ('0' + count.toString()) : count.toString()}|`;
    });
    return `${banker}${suffix}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvdXRpbC9yZWNvcmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlEQUEyRDtBQU8zRCxTQUFnQixpQkFBaUIsQ0FBQyxVQUFlLEVBQUUsY0FBa0M7SUFFakYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRCxJQUFJLE1BQU0sR0FBRyxHQUFHLElBQUEsMEJBQWUsRUFBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7SUFFekksSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFBO0lBRWYsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUNuQyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDNUIsT0FBUTtTQUNYO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBQyxDQUFDLElBQUksSUFBQSwwQkFBZSxFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztJQUNsSyxDQUFDLENBQUMsQ0FBQTtJQUVGLE9BQU8sR0FBRyxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDaEMsQ0FBQztBQWpCRCw4Q0FpQkMifQ==