"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const RedBlackConst_1 = require("./RedBlackConst");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
        this.experienceField = params.room.experience;
    }
    async runControl() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomLottery();
        }
        if (this.experienceField) {
            return this.room.sceneControlResult(this.experienceFieldControl(), false);
        }
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
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
            const mappingArea = RedBlackConst_1.mapping[area];
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
            this.room.addKillArea({ area: 'luck' });
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return isKill;
    }
    stripPlayers() {
        return this.room.players.filter(p => p.isRobot === 0 && p.bet > 0).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9SZWRCbGFjay9saWIvQ29udHJvbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwQ0FBOEM7QUFFOUMsbURBQXdDO0FBQ3hDLG1GQUE4RTtBQUU5RSxzRUFBb0U7QUFLcEUsTUFBcUIsV0FBWSxTQUFRLGlDQUFlO0lBRXBELFlBQVksTUFBOEI7UUFDdEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUNsRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVU7UUFFWixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUNwQztRQUdELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0U7UUFFRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUdoSCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBRXBCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUc5QyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUVULE1BQU0sa0JBQWtCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFN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