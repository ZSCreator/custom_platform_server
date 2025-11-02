"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class Control extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl() {
        if (this.room.isSameGamePlayers()) {
            return this.room.randomDeal();
        }
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
        return await this.room.runSceneControl(controlResult.sceneControlState, isPlatformControl);
    }
    stripPlayers() {
        return this.room.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).map(player => (0, utils_1.filterProperty)(player));
    }
}
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0VyYmEvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwQ0FBOEM7QUFDOUMsbUZBQThFO0FBRTlFLHVFQUFrRTtBQUtsRSxNQUFxQixPQUFRLFNBQVEsaUNBQWU7SUFFaEQsWUFBWSxNQUFzQjtRQUM5QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVO1FBRVosSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ2pDO1FBR0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNwRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFHLGlCQUFpQixFQUFFLEdBQUcsYUFBYSxDQUFDO1FBRzlFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFcEIsTUFBTSxrQkFBa0IsR0FBNEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTFGLElBQUksa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFFL0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFaEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFakUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUMxRTtTQUNKO1FBQ0QsT0FBTyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFLUyxZQUFZO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxtQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsc0JBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25ILENBQUM7Q0FDSjtBQXZDRCwwQkF1Q0MifQ==