"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const FishPrawnCrabConst_1 = require("./FishPrawnCrabConst");
const constants_1 = require("../../../services/newControl/constants");
class Control extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    async result() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomLotteryResult();
        }
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();
        if (players.length) {
            const killAreas = this.checkKillPlayers(players);
            if (killAreas.size > 0) {
                this.room.setKillAreas(killAreas);
            }
            else {
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
        let statisticalRes = {};
        const controlUidList = [];
        for (let controlPlayer of players) {
            if (controlPlayer.killCondition === 0) {
                continue;
            }
            const player = this.room.getPlayer(controlPlayer.uid);
            const areas = player.checkOverrunBet(controlPlayer.killCondition * 100);
            if (Object.keys(areas).length) {
                controlUidList.push(controlPlayer.uid);
            }
            for (let key in areas) {
                if (!statisticalRes[key]) {
                    statisticalRes[key] = 0;
                }
                statisticalRes[key] += areas[key];
            }
        }
        const keys = Object.keys(statisticalRes);
        const killAreas = new Set();
        const baseElement = [FishPrawnCrabConst_1.AREA.HL, FishPrawnCrabConst_1.AREA.PX, FishPrawnCrabConst_1.AREA.FISH, FishPrawnCrabConst_1.AREA.GOLD, FishPrawnCrabConst_1.AREA.JI, FishPrawnCrabConst_1.AREA.XIA];
        const containsRes = keys.filter(e => baseElement.includes(e));
        const noContainsRes = keys.filter(e => !baseElement.includes(e) && e !== FishPrawnCrabConst_1.AREA.ONE);
        if (keys.includes(FishPrawnCrabConst_1.AREA.ONE)) {
            killAreas.add(FishPrawnCrabConst_1.AREA.ONE);
            noContainsRes.forEach(e => {
                const sp = e.split('_');
                sp.forEach(key => statisticalRes[key] += statisticalRes[e]);
            });
            if (containsRes.length >= 5) {
                containsRes.map(e => {
                    return { name: e, num: statisticalRes[e] };
                }).sort((x, y) => y.num - x.num)
                    .slice(0, 4)
                    .map(e => e.name)
                    .forEach(e => killAreas.add(e));
            }
            else {
                containsRes.forEach(e => killAreas.add(e));
                noContainsRes.forEach(e => killAreas.add(e));
            }
        }
        else {
            if (containsRes.length > 5) {
                containsRes.map(e => {
                    return { name: e, num: statisticalRes[e] };
                }).sort((x, y) => y.num - x.num)
                    .slice(0, 5)
                    .map(e => e.name)
                    .forEach(e => killAreas.add(e));
            }
            else {
                containsRes.forEach(e => killAreas.add(e));
                noContainsRes.forEach(e => killAreas.add(e));
            }
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return killAreas;
    }
    stripPlayers() {
        return this.room.players.filter(p => (p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && p.bet > 0)).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Zpc2hQcmF3bkNyYWIvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwQ0FBOEM7QUFFOUMsbUZBQThFO0FBQzlFLHVFQUFrRTtBQUNsRSw2REFBMEM7QUFDMUMsc0VBQW9FO0FBS3BFLE1BQXFCLE9BQVEsU0FBUSxpQ0FBZTtJQUdoRCxZQUFZLEVBQUMsSUFBSSxFQUFrQztRQUMvQyxLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTTtRQUVmLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDMUM7UUFHRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUdoSCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFFaEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWpELElBQUksU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3JDO2lCQUFNO2dCQUVILE1BQU0sa0JBQWtCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7b0JBRTNCLE1BQU0sRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGtCQUFr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