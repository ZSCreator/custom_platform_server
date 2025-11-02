"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const DragonTigerConst_1 = require("./DragonTigerConst");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl() {
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
                    return this.room.personalDealCards({ state });
                }
            }
        }
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }
    playerBanker({ personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl }) {
        if (players.length > 0 && players.find(p => p.uid === this.room.banker.uid)) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            const bankerControlInfo = needControlPlayers.find(p => p.uid === this.room.banker.uid);
            if (bankerControlInfo) {
                this.room.getPlayer(this.room.banker.uid).setControlType(constants_1.ControlKinds.PERSONAL);
                return this.room.controlDealCardsBanker({ bankerWin: !(bankerControlInfo.probability >= 0) });
            }
        }
        if (bankerKill) {
            this.room.getPlayer(this.room.banker.uid).setControlType(constants_1.ControlKinds.SCENE);
            return this.room.controlDealCardsBanker({ bankerWin: false });
        }
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }
    checkKillPlayers(players) {
        let isKill = false, transfinite = {};
        const controlUidList = [];
        for (let controlPlayer of players) {
            const player = this.room.getPlayer(controlPlayer.uid);
            const transfiniteArea = player.checkOverrunBet({ condition: controlPlayer.killCondition });
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
            const mappingArea = DragonTigerConst_1.mapping[area];
            if (!mappingArea) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }
            const mappingBetNum = transfinite[mappingArea];
            if (!mappingBetNum) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }
            if (mappingBetNum === transfinite[area]) {
                delete transfinite[mappingArea];
                continue;
            }
            mappingBetNum > transfinite[area] ? this.room.addKillArea({ area: mappingArea }) :
                this.room.addKillArea({ area });
            isKill = true;
            delete transfinite[mappingArea];
        }
        if (isKill) {
            this.room.addKillArea({ area: 'f' });
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return isKill;
    }
    stripPlayers() {
        return this.room.players.filter(p => (p.isRobot === 0 && p.bet > 0) || p.isBanker).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EcmFnb25UaWdlci9saWIvQ29udHJvbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwQ0FBOEM7QUFFOUMseURBQTJDO0FBRTNDLG1GQUE4RTtBQUM5RSxzRUFBb0U7QUFLcEUsTUFBcUIsV0FBWSxTQUFRLGlDQUFlO0lBRXBELFlBQVksTUFBd0I7UUFDaEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTSxLQUFLLENBQUMsVUFBVTtRQUduQixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXBELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQU9PLFlBQVksQ0FBQyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBaUI7UUFDekcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUdwQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHOUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFFVCxNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRzFGLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO29CQUUzQixNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUc5RixJQUFJLENBQUMsSUFBSSxD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