'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
        this.experienceField = params.room.experience;
    }
    async runControl(list) {
        if (list.every(p => p.isRobot === 2) || list.every(p => p.isRobot === 0) || this.experienceField) {
            return this.room.randomDeal(list);
        }
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, isPlatformControl } = controlResult;
        if (players.length > 0) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length) {
                const positivePlayers = this.filterControlPlayer(needControlPlayers, true);
                const negativePlayers = this.filterControlPlayer(needControlPlayers, false);
                return this.room.personalControlDeal(list, positivePlayers, negativePlayers);
            }
        }
        this.room.sceneControlDeal(controlResult.sceneControlState, list, isPlatformControl);
    }
    stripPlayers() {
        return this.room.gamePlayers.map(player => (0, utils_1.filterProperty)(player));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Hb2xkZW5GbG93ZXIvbGliL0NvbnRyb2xJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYiwwQ0FBZ0Q7QUFDaEQsbUZBQWdGO0FBT2hGLE1BQXFCLFdBQVksU0FBUSxpQ0FBZTtJQUVwRCxZQUFZLE1BQXdCO1FBQ2hDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDbEQsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBZ0I7UUFFN0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBRTlGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckM7UUFHRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3BELE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxhQUFhLENBQUM7UUFHN0UsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUVwQixNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBRTNCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFM0UsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUc1RSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNoRjtTQUNKO1FBR0QsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDekYsQ0FBQztJQUtELFlBQVk7UUFDUixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsc0JBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ3RFLENBQUM7Q0FDSjtBQTVDRCw4QkE0Q0MifQ==