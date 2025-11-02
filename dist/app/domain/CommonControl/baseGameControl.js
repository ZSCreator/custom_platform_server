"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGameControl = void 0;
const utils_1 = require("../../utils");
const pinus_logger_1 = require("pinus-logger");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const commonConst_1 = require("./config/commonConst");
const constants_1 = require("../../services/newControl/constants");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class BaseGameControl {
    constructor({ room }) {
        this.experienceField = false;
        this.room = room;
    }
    stripPlayers() {
        return [];
    }
    ;
    async getControlResult(players) {
        return gameControlService_1.GameControlService.getInstance().getControlInfo({ sceneId: this.room.sceneId, players: players || this.stripPlayers() });
    }
    filterNeedControlPlayer(players) {
        return players.filter(p => this.judgePlayerControlRate(p));
    }
    judgePlayerControlRate(params) {
        return (0, utils_1.random)(0, 99, 0) < Math.abs(params.probability);
    }
    chooseControlPlayerAndControlState(players) {
        const positivePlayers = this.filterControlPlayer(players, true);
        const negativePlayers = this.filterControlPlayer(players, false);
        const isPosControl = this.judgePosOrNeg(positivePlayers, negativePlayers);
        if (isPosControl) {
            return { controlPlayers: positivePlayers, state: commonConst_1.CommonControlState.WIN };
        }
        return { controlPlayers: negativePlayers, state: commonConst_1.CommonControlState.LOSS };
    }
    filterControlPlayer(players, positive) {
        return players.filter(p => {
            if (positive && p.probability < 0) {
                return true;
            }
            return !positive && p.probability > 0;
        });
    }
    judgePosOrNeg(positivePlayers, negativePlayers) {
        let posAmount = 0, negAmount = 0;
        positivePlayers.forEach(p => posAmount += Math.abs(p.probability));
        negativePlayers.forEach(p => negAmount += Math.abs(p.probability));
        return posAmount > negAmount;
    }
    isPositiveControl(player) {
        return player.probability < 0;
    }
    experienceFieldControl() {
        return Math.random() < 0.1 ? constants_1.ControlState.PLAYER_WIN : constants_1.ControlState.NONE;
    }
}
exports.BaseGameControl = BaseGameControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUdhbWVDb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9Db21tb25Db250cm9sL2Jhc2VHYW1lQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUM7QUFDbkMsK0NBQXVDO0FBRXZDLHFGQUFnRjtBQUNoRixzREFBd0Q7QUFDeEQsbUVBQWlFO0FBRWpFLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFlbkQsTUFBc0IsZUFBZTtJQUlqQyxZQUFzQixFQUFFLElBQUksRUFBZTtRQUYzQyxvQkFBZSxHQUFZLEtBQUssQ0FBQztRQUc3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBTVMsWUFBWTtRQUNsQixPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFBQSxDQUFDO0lBRVEsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQXlCO1FBQ3RELE9BQU8sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsY0FBYyxDQUNsRCxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQyxDQUFDLENBQUE7SUFDOUUsQ0FBQztJQUdTLHVCQUF1QixDQUFDLE9BQWdDO1FBQzlELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFNUyxzQkFBc0IsQ0FBQyxNQUErQjtRQUM1RCxPQUFPLElBQUEsY0FBTSxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQVFTLGtDQUFrQyxDQUFDLE9BQWdDO1FBR3pFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVqRSxNQUFNLFlBQVksR0FBWSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUduRixJQUFJLFlBQVksRUFBRTtZQUNkLE9BQU8sRUFBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxnQ0FBa0IsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUMzRTtRQUNELE9BQU8sRUFBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxnQ0FBa0IsQ0FBQyxJQUFJLEVBQUMsQ0FBQztJQUM3RSxDQUFDO0lBU1MsbUJBQW1CLENBQUMsT0FBZ0MsRUFBRSxRQUFpQjtRQUM3RSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxPQUFPLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQVNTLGFBQWEsQ0FBQyxlQUF3QyxFQUFFLGVBQXdDO1FBQ3RHLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNuRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFbkUsT0FBTyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ2pDLENBQUM7SUFPUyxpQkFBaUIsQ0FBQyxNQUE2QjtRQUNyRCxPQUFPLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFLRCxzQkFBc0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxJQUFJLENBQUM7SUFDN0UsQ0FBQztDQUNKO0FBdkdELDBDQXVHQyJ9