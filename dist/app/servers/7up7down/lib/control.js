"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const up7Const_1 = require("./up7Const");
const constants_1 = require("../../../services/newControl/constants");
class SicBoControl extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    async result() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomLotteryResult();
        }
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
        let killAreas = [];
        if (players.length) {
            killAreas = this.getKillAreas(players);
            if (killAreas.length === 0) {
                const needControlPlayers = this.filterNeedControlPlayer(players);
                if (needControlPlayers.length) {
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                    return this.room.personalControlResult(controlPlayers, state);
                }
            }
        }
        return this.room.sceneControlResult(sceneControlState, killAreas, isPlatformControl);
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
                areas.forEach(area => overrunBetAreas.add(area));
            }
        }
        if (overrunBetAreas.size === 0) {
            return [];
        }
        if (overrunBetAreas.has(up7Const_1.BetAreas.AA) && overrunBetAreas.has(up7Const_1.BetAreas.CC)) {
            let aAreaTotalBet = 0, cAreaTotalBet = 0;
            for (let controlPlayer of players) {
                const bets = this.room.getPlayer(controlPlayer.uid).bets;
                aAreaTotalBet += bets[up7Const_1.BetAreas.AA].bet;
                cAreaTotalBet += bets[up7Const_1.BetAreas.CC].bet;
            }
            if (aAreaTotalBet === cAreaTotalBet) {
                Math.random() > 0.5 ? overrunBetAreas.delete(up7Const_1.BetAreas.AA) : overrunBetAreas.delete(up7Const_1.BetAreas.CC);
            }
            else {
                aAreaTotalBet > cAreaTotalBet ? overrunBetAreas.delete(up7Const_1.BetAreas.CC) : overrunBetAreas.delete(up7Const_1.BetAreas.AA);
            }
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return [...overrunBetAreas];
    }
    stripPlayers() {
        return this.room.players.filter(p => (p.isRobot === 0 && p.bet > 0)).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = SicBoControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzLzd1cDdkb3duL2xpYi9jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMENBQThDO0FBRTlDLG1GQUE4RTtBQUM5RSx5Q0FBb0M7QUFDcEMsc0VBQW9FO0FBS3BFLE1BQXFCLFlBQWEsU0FBUSxpQ0FBZTtJQUdyRCxZQUFZLEVBQUUsSUFBSSxFQUFrQjtRQUNoQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTTtRQUVmLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDMUM7UUFJRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUVoSCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFHbkIsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1lBRWhCLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBR3ZDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBRXhCLE1BQU0sa0JBQWtCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7b0JBRTNCLE1BQU0sRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBRTlGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxj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