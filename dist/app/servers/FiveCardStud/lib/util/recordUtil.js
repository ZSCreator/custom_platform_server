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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0ZpdmVDYXJkU3R1ZC9saWIvdXRpbC9yZWNvcmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlEQUEyRDtBQVEzRCxTQUFnQixpQkFBaUIsQ0FBQyxPQUFpQixFQUFFLFNBQW1CO0lBRXBFLElBQUksTUFBTSxHQUFXLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRXZGLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUduRSxNQUFNLElBQUksSUFBQSwwQkFBZSxFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXJDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUVoQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBRWhCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7WUFDM0IsT0FBTztTQUNWO1FBR0QsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRzlCLE1BQU0sSUFBSSxJQUFBLDBCQUFlLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBR0gsT0FBTyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzNCLENBQUM7QUExQkQsOENBMEJDIn0=