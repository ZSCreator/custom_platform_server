"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const betAreas_1 = require("./config/betAreas");
const constants_1 = require("../../../services/newControl/constants");
class FanTanControl extends baseGameControl_1.BaseGameControl {
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
            if (areas.length) {
                controlUidList.push(controlPlayer.uid);
            }
            areas.forEach(area => overrunBetAreas.add(area));
        }
        if (overrunBetAreas.size === 0) {
            return [];
        }
        if (overrunBetAreas.has(betAreas_1.BetAreasName.DOUBLE) && overrunBetAreas.has(betAreas_1.BetAreasName.SINGLE)) {
            let singleTotalBet = 0, doubleTotalBet = 0;
            for (let controlPlayer of players) {
                const bets = this.room.getPlayer(controlPlayer.uid).getBetsDetail();
                singleTotalBet += bets[betAreas_1.BetAreasName.SINGLE];
                doubleTotalBet += bets[betAreas_1.BetAreasName.DOUBLE];
            }
            if (singleTotalBet === doubleTotalBet) {
                Math.random() > 0.5 ? overrunBetAreas.delete(betAreas_1.BetAreasName.DOUBLE) : overrunBetAreas.delete(betAreas_1.BetAreasName.SINGLE);
            }
            else {
                singleTotalBet > doubleTotalBet ? overrunBetAreas.delete(betAreas_1.BetAreasName.DOUBLE) : overrunBetAreas.delete(betAreas_1.BetAreasName.SINGLE);
            }
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return [...overrunBetAreas];
    }
    stripPlayers() {
        return this.room.getRealPlayersAndBetPlayers().map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = FanTanControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2ZhblRhbi9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUE4QztBQUU5QyxtRkFBOEU7QUFHOUUsZ0RBQStDO0FBQy9DLHNFQUFvRTtBQUtwRSxNQUFxQixhQUFjLFNBQVEsaUNBQWU7SUFHdEQsWUFBWSxNQUFzQjtRQUM5QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBd0I7UUFFNUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQzFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDL0M7UUFHRCxNQUFNLEVBQUMsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUU5RyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBRXBCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHN0MsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFFeEIsTUFBTSxrQkFBa0IsR0FBNEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUcxRixJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtvQkFFM0IsTUFBTSxFQUFDLEtBQUssRUFBRSxjQUFjLEVBQUMsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFHNUYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFF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