"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const sicboConst_1 = require("./sicboConst");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
class SicBoControl extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    async result() {
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
        if (players.length) {
            const isKill = this.checkKillPlayers(players);
            if (!isKill) {
                const needControlPlayers = this.filterNeedControlPlayer(players);
                if (needControlPlayers.length) {
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                    return this.room.personalControlResult(controlPlayers, state);
                }
            }
        }
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }
    checkKillPlayers(players) {
        let isKill = false, transfinite = {};
        const controlUidList = [];
        for (let controlPlayer of players) {
            const player = this.room.getPlayer(controlPlayer.uid);
            const transfiniteArea = player.checkOverrunBet(controlPlayer.killCondition);
            if (Object.keys(transfiniteArea).length) {
                controlUidList.push(controlPlayer.uid);
            }
            for (let area in transfiniteArea) {
                if (!transfinite[area])
                    transfinite[area] = 0;
                transfinite[area] += transfiniteArea[area];
            }
        }
        for (let area in transfinite) {
            const mappingArea = sicboConst_1.mapping[area];
            if (!mappingArea) {
                isKill = true;
                this.room.addKillArea(area);
                continue;
            }
            const mappingBetNum = transfinite[mappingArea];
            if (!mappingBetNum) {
                isKill = true;
                this.room.addKillArea(area);
                continue;
            }
            if (mappingBetNum === transfinite[area]) {
                Reflect.deleteProperty(transfinite, mappingArea);
                continue;
            }
            isKill = true;
            mappingBetNum > transfinite[area] ? this.room.addKillArea(mappingArea) :
                this.room.addKillArea(area);
            Reflect.deleteProperty(transfinite, mappingArea);
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return isKill;
    }
    stripPlayers() {
        return this.room.players.filter(p => (p.isRobot === 0 && p.bet > 0)).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = SicBoControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NpY0JvL2xpYi9jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMENBQThDO0FBRTlDLDZDQUFxQztBQUVyQyxtRkFBOEU7QUFDOUUsc0VBQW9FO0FBS3BFLE1BQXFCLFlBQWEsU0FBUSxpQ0FBZTtJQUdyRCxZQUFZLEVBQUMsSUFBSSxFQUFpQjtRQUM5QixLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTTtRQUVmLE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBR2hILElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUVoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHOUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFFVCxNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRzFGLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO29CQUUzQixNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUU5RixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNqRTthQUNKO1NBQ0o7UUFHRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBT08sZ0JBQWdCLENBQUMsT0FBZ0M7UUFFckQs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