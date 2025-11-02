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
    players.forEach(p => {
        suffix += p.seat.toString();
        suffix += p.friendSeat === -1 ? '1' : '0';
        suffix += conversionCards(p.cards);
    });
    return `${prefix}${suffix}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2xhbmQvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxTQUFTLGVBQWUsQ0FBQyxLQUFlO0lBQ3BDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUM5QixJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDZixPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM5QjthQUFNLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUN0QixPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM5QjthQUFNO1lBQ0gsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQztJQUNMLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNYLENBQUM7QUFPRCxTQUFnQixpQkFBaUIsQ0FBQyxPQUFpQixFQUFFLFNBQW1CO0lBRXBFLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUxQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFHaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNoQixNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QixNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDMUMsTUFBTSxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUE7SUFFRixPQUFPLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFkRCw4Q0FjQyJ9