"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
const GameUtil_1 = require("../../../../utils/GameUtil");
function buildRecordResult(players, holeCards) {
    let prefix = players.filter(p => !!p && p.status === 'GAME').length.toString();
    players.map(p => prefix += !!p && p.status === 'GAME' ? '1' : '0');
    prefix += (0, GameUtil_1.conversionCards)(holeCards);
    let suffix = '';
    players.forEach(p => {
        if (!p || p.status !== 'GAME') {
            return;
        }
        suffix += (p.seat).toString();
        suffix += (0, GameUtil_1.conversionCards)(p.holds);
    });
    return prefix + suffix;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RacGlwZWkvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx5REFBMkQ7QUFRM0QsU0FBZ0IsaUJBQWlCLENBQUMsT0FBaUIsRUFBRSxTQUFtQjtJQUVwRSxJQUFJLE1BQU0sR0FBVyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUV2RixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFHbkUsTUFBTSxJQUFJLElBQUEsMEJBQWUsRUFBQyxTQUFTLENBQUMsQ0FBQztJQUVyQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFFaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUVoQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO1lBQzNCLE9BQU87U0FDVjtRQUdELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUc5QixNQUFNLElBQUksSUFBQSwwQkFBZSxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztJQUdILE9BQU8sTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMzQixDQUFDO0FBMUJELDhDQTBCQyJ9