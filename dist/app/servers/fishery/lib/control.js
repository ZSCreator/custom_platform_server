"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const fisheryConst_1 = require("./fisheryConst");
const constants_1 = require("../../../services/newControl/constants");
class Control extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async result() {
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = controlResult;
        if (players.length > 0) {
            const killAreas = this.checkKillPlayers(players);
            if (killAreas.size === 0) {
                const needControlPlayers = this.filterNeedControlPlayer(players);
                if (needControlPlayers.length) {
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                    return this.room.personalControlResult(state, controlPlayers);
                }
            }
            else {
                this.room.setKillAreas(killAreas);
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
        let keys = Object.keys(statisticalRes);
        const killAreas = new Set();
        const baseAreas = [fisheryConst_1.SEAT.A, fisheryConst_1.SEAT.B, fisheryConst_1.SEAT.C];
        const secondAreas = ['watch', 'rare', 'shoalSater', 'deepwater'];
        let baseContains = keys.filter(k => baseAreas.includes(k));
        const secondContains = keys.filter(k => secondAreas.includes(k));
        if (baseContains.length > 0) {
            if (baseContains.includes(fisheryConst_1.SEAT.B)) {
                killAreas.add(fisheryConst_1.SEAT.B);
                baseContains = baseContains.filter(k => k !== fisheryConst_1.SEAT.B);
            }
            if (baseContains.length === 2) {
                const retain = statisticalRes[baseContains[0]] > statisticalRes[baseContains[1]] ? baseContains[0] :
                    baseContains[1];
                baseContains = baseContains.filter(k => k === retain);
            }
            baseContains.forEach(k => {
                k === fisheryConst_1.SEAT.A ? killAreas.add(fisheryConst_1.SEAT.A) : killAreas.add(fisheryConst_1.SEAT.B);
            });
        }
        if (killAreas.has(fisheryConst_1.SEAT.A)) {
            let freshContains = secondReuse(secondContains, statisticalRes, ['watch', 'rare']);
            freshKill(freshContains, killAreas, keys, statisticalRes);
            keys = keys.filter(k => !['watch', 'rare'].includes(k));
        }
        else if (killAreas.has(fisheryConst_1.SEAT.B)) {
            let deepContains = secondReuse(secondContains, statisticalRes, ['shoalSater', 'deepwater']);
            deepKill(deepContains, killAreas, keys, statisticalRes);
            keys = keys.filter(k => !['shoalSater', 'deepwater'].includes(k));
        }
        const summaryAreas = baseAreas.concat(secondAreas);
        const killFishList = keys.filter(k => !summaryAreas.includes(k));
        if (killFishList.length === 12) {
            killFishList.map(k => {
                return { name: k, num: statisticalRes[k] };
            }).sort((x, y) => y.num - x.num)
                .slice(0, 11)
                .forEach(area => killAreas.add(area.name));
        }
        else {
            killFishList.forEach(k => killAreas.add(k));
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return killAreas;
    }
    stripPlayers() {
        return this.room.players.filter(p => (p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && p.bet > 0)).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = Control;
function secondReuse(secondContains, statisticalRes, partKillAreas) {
    let secondList = secondContains.filter(area => partKillAreas.includes(area));
    if (secondList.length === 2) {
        const retain = statisticalRes[secondContains[0]] > statisticalRes[secondContains[1]] ? secondContains[0] :
            secondContains[1];
        secondList = secondContains.filter(area => area === retain);
    }
    return secondList;
}
function freshKill(freshContains, killAreas, keys, statisticalRes) {
    freshContains.forEach(area => {
        if (area === 'watch') {
            killAreas.add('watch');
            reuse(killAreas, keys, fisheryConst_1.watchFish, fisheryConst_1.canEatFish, statisticalRes);
        }
        else {
            killAreas.add('rare');
            reuse(killAreas, keys, fisheryConst_1.canEatFish, fisheryConst_1.watchFish, statisticalRes);
        }
    });
}
function deepKill(deepContains, killAreas, keys, statisticalRes) {
    deepContains.forEach(area => {
        if (area === 'shoalSater') {
            killAreas.add('shoalSater');
            reuse(killAreas, keys, fisheryConst_1.bigFish, fisheryConst_1.smallFish, statisticalRes);
        }
        else {
            killAreas.add('deepwater');
            reuse(killAreas, keys, fisheryConst_1.smallFish, fisheryConst_1.bigFish, statisticalRes);
        }
    });
}
function reuse(killAreas, keys, slayAreas, corresponding, statisticalRes) {
    slayAreas.forEach(area => killAreas.add(area));
    let list = keys.filter(k => corresponding.includes(k));
    if (list.length === 3) {
        list = list.map(k => {
            return { name: k, num: statisticalRes[k] };
        }).sort((x, y) => y.num - x.num)
            .slice(0, 2)
            .map(area => area.name);
    }
    list.forEach(area => killAreas.add(area));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Zpc2hlcnkvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwQ0FBOEM7QUFFOUMsbUZBQThFO0FBQzlFLHVFQUFrRTtBQUNsRSxpREFBK0U7QUFDL0Usc0VBQW9FO0FBTXBFLE1BQXFCLE9BQVEsU0FBUSxpQ0FBZTtJQUVoRCxZQUFZLE1BQXVCO1FBQy9CLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBS00sS0FBSyxDQUFDLE1BQU07UUFHZixNQUFNLGFBQWEsR0FBa0IsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuRSxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsYUFBYSxDQUFDO1FBRWhHLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFcEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWpELElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7Z0JBRXRCLE1BQU0sa0JBQWtCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7b0JBRTNCLE1BQU0sRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBRzlGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7aUJBQ2pFO2FBQ0o7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDckM7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