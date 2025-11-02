"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../utils/index");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
    }
    async runControl() {
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = controlResult;
        if (players.length > 0) {
            const isKill = this.checkKillPlayers(players);
            if (isKill) {
                return this.room.killDealCard();
            }
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length) {
                const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                this.room.setPlayersState({ players: controlPlayers, state });
                return this.room.personalDealCards({ state });
            }
        }
        return await this.room.sceneControl(sceneControlState, isPlatformControl);
    }
    stripPlayers() {
        return this.room.players.filter(p => p.isRobot === 0 && p.bet > 0)
            .map(player => (0, index_1.filterProperty)(player));
    }
    checkKillPlayers(players) {
        let controlArea = {};
        const controlUidList = [];
        for (let controlPlayer of players) {
            const player = this.room.getPlayer(controlPlayer.uid);
            const areas = player.checkOverrunBet({ condition: controlPlayer.killCondition });
            if (Object.keys(areas).length) {
                controlUidList.push(controlPlayer.uid);
            }
            for (let index in areas) {
                if (areas[index] === commonConst_1.CommonControlState.LOSS) {
                    controlArea[index] = commonConst_1.CommonControlState.LOSS;
                }
            }
        }
        console.warn('不杀', controlArea, (Object.keys(controlArea).every(index => controlArea[index] === commonConst_1.CommonControlState.RANDOM)));
        if (Object.keys(controlArea).every(index => controlArea[index] === commonConst_1.CommonControlState.RANDOM)) {
            return false;
        }
        const allKill = Object.keys(controlArea).every(index => controlArea[index] === commonConst_1.CommonControlState.LOSS);
        if (allKill && Object.keys(controlArea).length === 5) {
            this.allKillDeal(players);
        }
        else {
            Object.keys(controlArea).forEach(index => {
                if (controlArea[index] === commonConst_1.CommonControlState.LOSS) {
                    this.room.markKillArea({ area: index });
                }
            });
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return true;
    }
    allKillDeal(players) {
        let statisticalResult = {};
        players.forEach(p => {
            const player = this.room.getPlayer(p.uid);
            const betAreas = player.getBetAreas();
            for (let index in betAreas) {
                if (!statisticalResult[index])
                    statisticalResult[index] = 0;
                statisticalResult[index] += betAreas[index];
            }
        });
        let result = { index: null, count: 0 }, killAreas = [];
        for (let index in statisticalResult) {
            const profit = statisticalResult[index] * this.room.area[index].multiple;
            if (result.index === null) {
                result.index = index;
                result.count = profit;
            }
            else {
                if (result.count > profit) {
                    killAreas.push(result.index);
                    result.index = index;
                    result.count = profit;
                }
                else {
                    killAreas.push(index);
                }
            }
        }
        killAreas.forEach(area => this.room.markKillArea({ area }));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jYW9odWFqaS9saWIvQ29udHJvbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBb0Q7QUFHcEQsa0ZBQW9GO0FBQ3BGLG1GQUE4RTtBQUU5RSxzRUFBb0U7QUFLcEUsTUFBcUIsV0FBWSxTQUFRLGlDQUFlO0lBR3BELFlBQVksTUFBc0I7UUFDOUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVTtRQUVaLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDcEQsTUFBTSxFQUFDLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxHQUFHLGFBQWEsQ0FBQztRQUU5RixJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBR3BCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUc5QyxJQUFJLE1BQU0sRUFBRTtnQkFDUixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbkM7WUFHRCxNQUFNLGtCQUFrQixHQUE0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBRTNCLE1BQU0sRUFBQyxLQUFLLEVBQUUsY0FBYyxFQUFDLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRzVGLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO2dCQUM1RCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlC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