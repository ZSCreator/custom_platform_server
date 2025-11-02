"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
class CrashControl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl(lotteryUtil) {
        if (this.room.getRealPlayersTotalBet() === 0) {
            return this.room.randomLottery(lotteryUtil);
        }
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
        if (players.length > 0) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length) {
                const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                return this.room.personalControl(lotteryUtil, controlPlayers, state);
            }
        }
        return this.room.sceneControl(lotteryUtil, sceneControlState, isPlatformControl);
    }
    stripPlayers() {
        return this.room.getRealPlayersAndBetPlayers().map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = CrashControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0NyYXNoL2xpYi9jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQThDO0FBRTlDLG1GQUE4RTtBQU85RSxNQUFxQixZQUFhLFNBQVEsaUNBQWU7SUFFckQsWUFBWSxNQUFzQjtRQUM5QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBd0I7UUFFNUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQzFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDL0M7UUFHRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUVoSCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBRXBCLE1BQU0sa0JBQWtCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUcxRixJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtnQkFFM0IsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFHOUYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hFO1NBQ0o7UUFHRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFLUyxZQUFZO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsc0JBQWMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7Q0FDSjtBQXZDRCwrQkF1Q0MifQ==