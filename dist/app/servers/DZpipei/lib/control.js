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
        if (this.experienceField) {
            return this.room.sceneControlDeal(this.experienceFieldControl(), false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RacGlwZWkvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBZ0Q7QUFDaEQsbUZBQWdGO0FBR2hGLHVFQUFvRTtBQUtwRSxNQUFxQixXQUFZLFNBQVEsaUNBQWU7SUFFcEQsWUFBWSxNQUF3QjtRQUNoQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVO1FBRVosSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxtQkFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssbUJBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUU3SSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDakM7UUFHRCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzNFO1FBSUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNwRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLEdBQUcsYUFBYSxDQUFDO1FBRzdFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFcEIsTUFBTSxrQkFBa0IsR0FBNEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTFGLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO2dCQUUzQixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRTNFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFHNUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUMxRTtTQUNKO1FBR0QsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBS0QsWUFBWTtRQUNSLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLElBQUEsc0JBQWMsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3BFLENBQUM7Q0FDSjtBQWpERCw4QkFpREMifQ==