"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const benzConst_1 = require("./benzConst");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomLottery();
        }
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
        if (players.length > 0) {
            const isKill = this.checkKillPlayers(players);
            if (!isKill) {
                const needControlPlayers = this.filterNeedControlPlayer(players);
                if (needControlPlayers.length) {
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                    return this.room.personalControl(state, controlPlayers);
                }
            }
        }
        return this.room.sceneControl(sceneControlState, isPlatformControl);
    }
    checkKillPlayers(players) {
        let isKill = false, transfinite = new Set();
        const controlUidList = [];
        for (let controlPlayer of players) {
            const condition = controlPlayer.killCondition * 100;
            if (condition <= 0) {
                continue;
            }
            const player = this.room.getPlayer(controlPlayer.uid);
            const transfiniteArea = player.checkOverrunBet(condition);
            if (Object.keys(transfiniteArea).length) {
                controlUidList.push(controlPlayer.uid);
            }
            for (let area in transfiniteArea) {
                transfinite.add(area);
            }
        }
        if (transfinite.size === 8) {
            Math.random() > 0.5 ? transfinite.delete(benzConst_1.BetAreas.BMW) : transfinite.delete(benzConst_1.BetAreas.Benz);
        }
        if (transfinite.size > 0) {
            isKill = true;
            this.room.setKillAreas(transfinite);
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return isKill;
    }
    stripPlayers() {
        return this.room.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && p.bet > 0).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JlbnpCbXcvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwQ0FBOEM7QUFFOUMsbUZBQThFO0FBRTlFLDJDQUFxQztBQUNyQyx1RUFBa0U7QUFDbEUsc0VBQW9FO0FBS3BFLE1BQXFCLFdBQVksU0FBUSxpQ0FBZTtJQUVwRCxZQUFZLE1BQTBCO1FBQ2xDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVU7UUFFWixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUNwQztRQUVELE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBR2hILElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFcEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRzlDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBRVQsTUFBTSxrQkFBa0IsR0FBNEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUcxRixJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtvQkFFM0IsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFHOUYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7aUJBQzNEO2FBQ0o7U0FDSjtRQUdELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBT08sZ0JBQWdCLENBQUMsT0FBZ0M7UUFFckQsSUFBSSxNQUFNLEdBQVksS0FBSyxFQUV2QixXQUFXLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0MsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBRTFCLEtBQUssSUFBSSxhQUFhLElBQUksT0FBTyxFQUFFO1lBQy9CLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO1lBRXBELElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTtnQkFDaEIsU0FBUzthQUNaO1lBRUQsTUFBTSxNQUFNLEdBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBR2xFLE1BQU0sZUFBZSxHQUFXLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFbEUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDckMsY0FBYyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDMUM7WUFFRCxLQUFLLElBQUksSUFBSSxJQUFJLGVBQWUsRUFBRTtnQkFDOUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFnQixDQUFDLENBQUM7YUFDckM7U0FDSjtRQUdELElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0Y7UUFFRCxJQUFJLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN2QztRQUVELGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsd0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRTlGLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFLUyxZQUFZO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxtQkFBUSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsc0JBQWMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RILENBQUM7Q0FDSjtBQTdGRCw4QkE2RkMifQ==