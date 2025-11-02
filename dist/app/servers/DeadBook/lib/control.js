"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const slotGameControl_1 = require("../../../domain/CommonControl/slotGameControl");
const limitConfigManager_1 = require("./limitConfigManager");
const constants_1 = require("../../../services/newControl/constants");
class Control extends slotGameControl_1.SlotGameControl {
    constructor({ room }) {
        super({ room });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
    }
    async runControl(player, lotteryUtil) {
        let result, controlType;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState, isPlatformControl } = controlResult;
        if (personalControlPlayers.length) {
            result = this.runPersonalControl(lotteryUtil, personalControlPlayers);
        }
        if (!result) {
            result = this.runSceneControl(lotteryUtil, sceneControlState);
            controlType = sceneControlState === constants_1.ControlState.NONE ? constants_1.ControlKinds.NONE :
                isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        }
        else {
            controlType = constants_1.ControlKinds.PERSONAL;
        }
        const totalWin = result.totalWin + result.freeSpinResult.reduce((num, result) => {
            return num + result.totalWin;
        }, 0);
        const { isOverrun } = this.isEarningsTransfinite({ player, profit: totalWin });
        if (isOverrun) {
            result = lotteryUtil.setSystemWinOrLoss(true).result();
            controlType = constants_1.ControlKinds.SCENE;
        }
        player.setControlType(controlType);
        return result;
    }
    async boControl(player, lotteryUtil) {
        let result, controlType;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState, isPlatformControl } = controlResult;
        if (personalControlPlayers.length) {
            result = this.runBoPersonalControl(lotteryUtil, personalControlPlayers);
        }
        if (!result) {
            result = this.runSceneControl(lotteryUtil, sceneControlState);
            controlType = sceneControlState === constants_1.ControlState.NONE ? constants_1.ControlKinds.NONE :
                isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        }
        else {
            controlType = constants_1.ControlKinds.PERSONAL;
        }
        const { isOverrun } = this.isEarningsTransfinite({ player, profit: result.totalWin });
        if (isOverrun) {
            result = lotteryUtil.setSystemWinOrLoss(true).result();
            controlType = constants_1.ControlKinds.SCENE;
        }
        player.setControlType(controlType);
        return result;
    }
    runPersonalControl(lotteryUtil, personalControlPlayers) {
        const killCondition = personalControlPlayers[0].killCondition * 100;
        if (killCondition > 0 && killCondition <= lotteryUtil.totalBet) {
            return lotteryUtil.setSystemWinOrLoss(true).result();
        }
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);
        if (controlPlayer) {
            const isPositive = this.isPositiveControl(controlPlayer);
            return lotteryUtil.setSystemWinOrLoss(!isPositive).result();
        }
        return;
    }
    runBoPersonalControl(lotteryUtil, personalControlPlayers) {
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);
        if (controlPlayer) {
            const isPositive = this.isPositiveControl(controlPlayer);
            return lotteryUtil.setSystemWinOrLoss(!isPositive).result();
        }
        return;
    }
    runSceneControl(lotteryUtil, sceneControlState) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return lotteryUtil.result();
        }
        return lotteryUtil.setSystemWinOrLoss(sceneControlState === constants_1.ControlState.SYSTEM_WIN).result();
    }
}
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RlYWRCb29rL2xpYi9jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQThDO0FBQzlDLG1GQUE4RTtBQUM5RSw2REFBd0Q7QUFFeEQsc0VBQWtGO0FBUWxGLE1BQXFCLE9BQVEsU0FBUSxpQ0FBbUM7SUFHcEUsWUFBWSxFQUFDLElBQUksRUFBQztRQUNkLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7UUFIbEIsaUJBQVksR0FBdUIsdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFJcEUsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBYyxFQUFFLFdBQW9CO1FBQ2pELElBQUksTUFBa0IsRUFBRSxXQUF5QixDQUFDO1FBRWxELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBQSxzQkFBYyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxNQUFNLEVBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsR0FBRyxhQUFhLENBQUM7UUFHckYsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUU7WUFDL0IsTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztTQUN6RTtRQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUU5RCxXQUFXLEdBQUcsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLFFBQVEsQ0FB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