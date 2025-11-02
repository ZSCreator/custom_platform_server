"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class Control extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    async runControl() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomDeal();
        }
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
        if (players.length) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length) {
                const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                return this.room.personalControl(controlPlayers, state);
            }
        }
        this.room.sceneControl(sceneControlState, isPlatformControl);
    }
    stripPlayers() {
        return this.room.players.filter(p => !!p && (p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && p.bet > 0)).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrR2FtZS9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDBDQUE4QztBQUU5QyxtRkFBOEU7QUFDOUUsdUVBQWtFO0FBUWxFLE1BQXFCLE9BQVEsU0FBUSxpQ0FBZTtJQUloRCxZQUFZLEVBQUMsSUFBSSxFQUFpQjtRQUM5QixLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFLTSxLQUFLLENBQUMsVUFBVTtRQUVuQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFHO1lBQ25DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNqQztRQUdELE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBR2hILElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUVoQixNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBRTNCLE1BQU0sRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRzlGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzNEO1NBQ0o7UUFHRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFLUyxZQUFZO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssbUJBQVEsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsc0JBQWMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ILENBQUM7Q0FDSjtBQTdDRCwwQkE2Q0MifQ==