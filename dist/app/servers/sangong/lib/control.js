"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
class Control extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControlDeal() {
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, isPlatformControl } = controlResult;
        if (players.length > 0) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length > 0) {
                const positivePlayers = this.filterControlPlayer(players, true);
                const negativePlayers = this.filterControlPlayer(players, false);
                return this.room.controlPersonalDeal(positivePlayers, negativePlayers);
            }
        }
        return this.room.sceneControl(controlResult.sceneControlState, isPlatformControl);
    }
    stripPlayers() {
        return this.room.curPlayers.map(pl => (0, utils_1.filterProperty)(pl));
    }
}
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3NhbmdvbmcvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwQ0FBZ0Q7QUFDaEQsbUZBQWdGO0FBT2hGLE1BQXFCLE9BQVEsU0FBUSxpQ0FBZTtJQUVoRCxZQUFZLE1BQXdCO1FBQ2hDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBS0QsS0FBSyxDQUFDLGNBQWM7UUFJaEIsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNwRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLEdBQUcsYUFBYSxDQUFDO1FBRzdFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFcEIsTUFBTSxrQkFBa0IsR0FBNEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTFGLElBQUksa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFFL0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFaEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFakUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUMxRTtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBS1MsWUFBWTtRQUNsQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUEsc0JBQWMsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDSjtBQXhDRCwwQkF3Q0MifQ==