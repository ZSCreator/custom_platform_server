"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl() {
        if (this.room.gamePlayers.every(p => p && p.isRobot === RoleEnum_1.RoleEnum.ROBOT) || this.room.gamePlayers.every(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)) {
            return this.room.randomDeal();
        }
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, isPlatformControl } = controlResult;
        if (players.length > 0) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length) {
                const positivePlayers = this.filterControlPlayer(needControlPlayers, true);
                const negativePlayers = this.filterControlPlayer(needControlPlayers, false);
                return this.room.personalControlDeal(positivePlayers, negativePlayers);
            }
        }
        this.room.sceneControlDeal(controlResult.sceneControlState, isPlatformControl);
    }
    stripPlayers() {
        return this.room.gamePlayers.map(pl => pl && (0, utils_1.filterProperty)(pl));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0ZpdmVDYXJkU3R1ZC9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUFnRDtBQUNoRCxtRkFBZ0Y7QUFHaEYsdUVBQW9FO0FBS3BFLE1BQXFCLFdBQVksU0FBUSxpQ0FBZTtJQUVwRCxZQUFZLE1BQXlCO1FBQ2pDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVU7UUFFWixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLG1CQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxtQkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBRTdJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNqQztRQUdELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDcEQsTUFBTSxFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxHQUFHLGFBQWEsQ0FBQztRQUc3RSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBRXBCLE1BQU0sa0JBQWtCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUxRixJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtnQkFFM0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUUzRSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRzVFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDMUU7U0FDSjtRQUdELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUtELFlBQVk7UUFDUixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFBLHNCQUFjLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0NBQ0o7QUEzQ0QsOEJBMkNDIn0=