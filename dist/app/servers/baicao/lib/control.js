"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
class Control extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControlDeal() {
        if (this.room.isSameGamePlayers()) {
            return this.room.randomDeal();
        }
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players } = controlResult;
        if (players.length > 0) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length > 0) {
                const positivePlayers = this.filterControlPlayer(players, true);
                const negativePlayers = this.filterControlPlayer(players, false);
                return this.room.controlPersonalDeal(positivePlayers, negativePlayers);
            }
        }
        return this.room.sceneControl(controlResult.sceneControlState, controlResult.isPlatformControl);
    }
    stripPlayers() {
        return this.room.dealCardsPlayers.map(player => (0, utils_1.filterProperty)(player));
    }
}
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2JhaWNhby9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDBDQUFnRDtBQUNoRCxtRkFBZ0Y7QUFNaEYsTUFBcUIsT0FBUSxTQUFRLGlDQUFlO0lBRWhELFlBQVksTUFBNEI7UUFDcEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFLRCxLQUFLLENBQUMsY0FBYztRQUVoQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtZQUMvQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDakM7UUFHRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3BELE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsR0FBRyxhQUFhLENBQUM7UUFHMUQsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUVwQixNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUUvQixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVoRSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUVqRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQzFFO1NBQ0o7UUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBS1MsWUFBWTtRQUNsQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSxzQkFBYyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDNUUsQ0FBQztDQUNKO0FBM0NELDBCQTJDQyJ9