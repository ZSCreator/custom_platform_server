"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function conversionCards(cards) {
    return cards.reduce((str, card) => {
        if (card === 0x4E) {
            return str += (str + '41');
        }
        else if (card === 0x4F) {
            return str += (str + '42');
        }
        else {
            return str += card.toString(16);
        }
    }, '');
}
function buildRecordResult(players, holeCards) {
    const prefix = conversionCards(holeCards);
    let suffix = '';
    return `${prefix}${suffix}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0x1Y2t5RGljZS9saWIvdXRpbC9yZWNvcmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLFNBQVMsZUFBZSxDQUFDLEtBQWU7SUFDcEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQzlCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNmLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQzlCO2FBQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQzlCO2FBQU07WUFDSCxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25DO0lBQ0wsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1gsQ0FBQztBQU9ELFNBQWdCLGlCQUFpQixDQUFDLE9BQWlCLEVBQUUsU0FBbUI7SUFFcEUsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTFDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQVNoQixPQUFPLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFkRCw4Q0FjQyJ9