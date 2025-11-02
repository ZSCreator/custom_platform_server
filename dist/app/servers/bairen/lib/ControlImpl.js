"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl() {
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
                    this.room.setPlayersState({ players: controlPlayers, state });
                    return this.room.personalDealCards(state);
                }
            }
        }
        return this.room.controlDealCards(sceneControlState, isPlatformControl);
    }
    playerBanker({ personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl }) {
        if (players.find(p => p.uid === this.room.zhuangInfo.uid)) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            const bankerControlInfo = needControlPlayers.find(p => p.uid === this.room.zhuangInfo.uid);
            if (bankerControlInfo) {
                const state = bankerControlInfo.probability > 0 ? constants_1.ControlState.SYSTEM_WIN : constants_1.ControlState.PLAYER_WIN;
                this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(constants_1.ControlKinds.PERSONAL);
                return this.room.controlDealCards(state, false);
            }
        }
        if (bankerKill) {
            this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(constants_1.ControlKinds.SCENE);
            return this.room.controlDealCards(constants_1.ControlState.SYSTEM_WIN, false);
        }
        return this.room.controlDealCards(sceneControlState, isPlatformControl);
    }
    stripPlayers() {
        return this.room.players.filter(p => (p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) && (p.bet > 0 || p.uid === this.room.zhuangInfo.uid))
            .map(player => (0, utils_1.filterProperty)(player));
    }
    checkKillPlayers(players) {
        let isKill = false;
        const controlUidList = [];
        for (let controlPlayer of players) {
            if (controlPlayer.killCondition === 0) {
                continue;
            }
            const player = this.room.getPlayer(controlPlayer.uid);
            const areas = player.checkOverrunBet({ condition: controlPlayer.killCondition });
            if (areas.some(area => area === commonConst_1.CommonControlState.LOSS)) {
                controlUidList.push(controlPlayer.uid);
                isKill = true;
                this.room.markKillArea(areas);
            }
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return isKill;
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlyZW4vbGliL0NvbnRyb2xJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQThDO0FBRzlDLGtGQUFvRjtBQUNwRixtRkFBOEU7QUFFOUUsc0VBQWtGO0FBQ2xGLHVFQUFrRTtBQUtsRSxNQUFxQixXQUFZLFNBQVEsaUNBQWU7SUFFcEQsWUFBWSxNQUFzQjtRQUM5QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVO1FBRVosSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNsQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDakM7UUFHRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBR3BELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUtPLFlBQVksQ0FBQyxFQUFDLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBZ0I7UUFDdkcsSUFBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUdyQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHOUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFFVCxNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRzFGLElBQUksa0JBQWtCLENBQUMs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