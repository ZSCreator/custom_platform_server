"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    async run_result() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomDeal();
        }
        const controlResult = await this.getControlResult();
        return this.room.bankerIsRealMan() ? this.playerBanker(controlResult) :
            this.systemBanker(controlResult);
    }
    systemBanker({ personalControlPlayers: players, sceneControlState, isPlatformControl }) {
        if (players.length > 0) {
            const isKill = this.checkKillPlayers(players);
            if (!isKill) {
                const needControlPlayers = this.filterNeedControlPlayer(players);
                if (needControlPlayers.length) {
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                    return this.room.personalDealCards(controlPlayers, state);
                }
            }
        }
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }
    playerBanker({ personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl }) {
        if (players.length > 0 && players.find(p => p.uid === this.room.zhuangInfo.uid)) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            const bankerControlInfo = needControlPlayers.find(p => p.uid === this.room.zhuangInfo.uid);
            if (bankerControlInfo) {
                this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(constants_1.ControlKinds.PERSONAL);
                return this.room.sceneControlResult(this.isPositiveControl(bankerControlInfo) ? constants_1.ControlState.PLAYER_WIN : constants_1.ControlState.SYSTEM_WIN, false);
            }
        }
        if (bankerKill) {
            this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(constants_1.ControlKinds.SCENE);
            return this.room.sceneControlResult(constants_1.ControlState.SYSTEM_WIN, false);
        }
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }
    checkKillPlayers(players) {
        let isKill = false;
        const controlUidList = [];
        for (let controlPlayer of players) {
            if (controlPlayer.killCondition === 0) {
                continue;
            }
            const player = this.room.getPlayer(controlPlayer.uid);
            const areas = player.checkOverrunBet(controlPlayer.killCondition);
            if (areas.some(area => area === commonConst_1.CommonControlState.LOSS)) {
                controlUidList.push(controlPlayer.uid);
                isKill = true;
                this.room.markKillArea(areas);
            }
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return isKill;
    }
    stripPlayers() {
        return this.room.players.filter(p => {
            return p.isRobot === 0 && (p.bet > 0 || this.room.zhuangInfo.uid === p.uid);
        }).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1dhblJlbkpIL2xpYi9jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMENBQThDO0FBRzlDLG1GQUE4RTtBQUM5RSxrRkFBb0Y7QUFDcEYsc0VBQWtGO0FBS2xGLE1BQXFCLFdBQVksU0FBUSxpQ0FBZTtJQUVwRCxZQUFZLEVBQUUsSUFBSSxFQUFzQjtRQUNwQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxLQUFLLENBQUMsVUFBVTtRQUNuQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNqQztRQUdELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFcEQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBT08sWUFBWSxDQUFDLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFpQjtRQUN6RyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBRXBCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUc5QyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUVULE1BQU0sa0JBQWtCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHMUYsSUFBSSxrQkFBa0IsQ0FB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