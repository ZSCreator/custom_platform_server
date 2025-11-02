"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const betAreas_1 = require("./config/betAreas");
const constants_1 = require("../../../services/newControl/constants");
class AndarBaharControl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl(lotteryUtil) {
        if (this.room.getRealPlayersTotalBet() === 0) {
            return this.room.randomLottery(lotteryUtil);
        }
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
        if (players.length > 0) {
            const killAreas = this.getKillAreas(players);
            if (killAreas.length === 0) {
                const needControlPlayers = this.filterNeedControlPlayer(players);
                if (needControlPlayers.length) {
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                    return this.room.personalControl(lotteryUtil, controlPlayers, state);
                }
            }
            else {
                lotteryUtil.setKillAreas(killAreas);
            }
        }
        return this.room.sceneControl(lotteryUtil, sceneControlState, isPlatformControl);
    }
    getKillAreas(players) {
        let overrunBetAreas = new Set();
        const controlUidList = [];
        for (let controlPlayer of players) {
            if (controlPlayer.killCondition === 0) {
                continue;
            }
            const player = this.room.getPlayer(controlPlayer.uid);
            const killCondition = controlPlayer.killCondition * 100;
            const areas = player.getOverrunBetAreas(killCondition);
            if (areas.length)
                controlUidList.push(controlPlayer.uid);
            areas.forEach(area => overrunBetAreas.add(area));
        }
        if (overrunBetAreas.size === 0) {
            return [];
        }
        if (overrunBetAreas.has(betAreas_1.BetAreasName.ANDAR) && overrunBetAreas.has(betAreas_1.BetAreasName.BAHAR)) {
            let andarTotalBet = 0, baharTotalBet = 0;
            for (let controlPlayer of players) {
                const bets = this.room.getPlayer(controlPlayer.uid).getBetsDetail();
                andarTotalBet += bets[betAreas_1.BetAreasName.ANDAR];
                baharTotalBet += bets[betAreas_1.BetAreasName.BAHAR];
            }
            if (andarTotalBet === baharTotalBet) {
                Math.random() > 0.5 ? overrunBetAreas.delete(betAreas_1.BetAreasName.ANDAR) : overrunBetAreas.delete(betAreas_1.BetAreasName.BAHAR);
            }
            else {
                andarTotalBet > baharTotalBet ? overrunBetAreas.delete(betAreas_1.BetAreasName.BAHAR) : overrunBetAreas.delete(betAreas_1.BetAreasName.ANDAR);
            }
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return [...overrunBetAreas];
    }
    stripPlayers() {
        return this.room.getRealPlayersAndBetPlayers().map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = AndarBaharControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2FuZGFyQmFoYXIvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBOEM7QUFFOUMsbUZBQThFO0FBRzlFLGdEQUErQztBQUMvQyxzRUFBb0U7QUFLcEUsTUFBcUIsaUJBQWtCLFNBQVEsaUNBQWU7SUFFMUQsWUFBWSxNQUFzQjtRQUM5QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBd0I7UUFFNUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQzFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDL0M7UUFHRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUVoSCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBRXBCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHN0MsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFFeEIsTUFBTSxrQkFBa0IsR0FBNEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUcxRixJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtvQkFFM0IsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFHOUYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsY0FB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