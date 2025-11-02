"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
var RoomControlState;
(function (RoomControlState) {
    RoomControlState[RoomControlState["NONE"] = 0] = "NONE";
    RoomControlState[RoomControlState["SCENE"] = 1] = "SCENE";
    RoomControlState[RoomControlState["PERSONAL"] = 2] = "PERSONAL";
})(RoomControlState || (RoomControlState = {}));
class Control extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    async startControl() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomLottery();
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
        return this.room.players.filter(p => (p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && p.totalBet > 0)).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDBDQUE4QztBQUU5QyxtRkFBOEU7QUFDOUUsdUVBQWtFO0FBUWxFLElBQUssZ0JBSUo7QUFKRCxXQUFLLGdCQUFnQjtJQUNqQix1REFBSSxDQUFBO0lBQ0oseURBQUssQ0FBQTtJQUNMLCtEQUFRLENBQUE7QUFDWixDQUFDLEVBSkksZ0JBQWdCLEtBQWhCLGdCQUFnQixRQUlwQjtBQVFELE1BQXFCLE9BQVEsU0FBUSxpQ0FBZTtJQUloRCxZQUFZLEVBQUMsSUFBSSxFQUE4QjtRQUMzQyxLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFLTSxLQUFLLENBQUMsWUFBWTtRQUVyQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFHO1lBQ25DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUNwQztRQUlELE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBR2hILElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUVoQixNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBRTNCLE1BQU0sRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRzlGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzNEO1NBQ0o7UUFHRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFLUyxZQUFZO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLG1CQUFRLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLHNCQUFjLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3SCxDQUFDO0NBQ0o7QUE5Q0QsMEJBOENDIn0=