"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
const GameUtil_1 = require("../../../../utils/GameUtil");
function buildRecordResult(players) {
    let prefix = players.filter(p => !!p && p.status === 'GAME').length.toString();
    players.map(p => prefix += !!p && p.status === 'GAME' ? '1' : '0');
    let suffix = '';
    players.forEach(p => {
        if (!p || p.status !== 'GAME') {
            return;
        }
        suffix += (p.seat).toString();
        suffix += (0, GameUtil_1.conversionCards)(p.cards.map(card => card - 1));
        switch (p.cardType) {
            case 2:
                suffix += 'b';
                break;
            case 1:
                suffix += 'a';
                break;
            case 0:
                suffix += p.Points.toString();
                break;
        }
        suffix += p.profit >= 0 ? '1' : '0';
    });
    return prefix + suffix;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2JhaWNhby9saWIvdXRpbC9yZWNvcmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlEQUE2RDtBQU03RCxTQUFnQixpQkFBaUIsQ0FBQyxPQUFpQjtJQUUvQyxJQUFJLE1BQU0sR0FBVyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUV2RixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFbkUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBRWhCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFFaEIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtZQUMzQixPQUFPO1NBQ1Y7UUFHRCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFHOUIsTUFBTSxJQUFJLElBQUEsMEJBQWUsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpELFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRTtZQUNoQixLQUFLLENBQUM7Z0JBQUUsTUFBTSxJQUFJLEdBQUcsQ0FBQztnQkFBQyxNQUFNO1lBQzdCLEtBQUssQ0FBQztnQkFBRSxNQUFNLElBQUksR0FBRyxDQUFDO2dCQUFDLE1BQU07WUFDN0IsS0FBSyxDQUFDO2dCQUFFLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUFDLE1BQU07U0FDaEQ7UUFHRCxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ3hDLENBQUMsQ0FBQyxDQUFDO0lBR0gsT0FBTyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzNCLENBQUM7QUFoQ0QsOENBZ0NDIn0=