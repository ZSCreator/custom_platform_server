"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const slotGameControl_1 = require("../../../domain/CommonControl/slotGameControl");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const limitConfigManager_1 = require("./limitConfigManager");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends slotGameControl_1.SlotGameControl {
    constructor({ room }) {
        super({ room });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
    }
    static getControlInstance() {
        if (this.instance === null) {
            this.instance = new ControlImpl({ room: { nid: GameNidEnum_1.GameNidEnum.pharaoh, sceneId: 0 } });
        }
        return this.instance;
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
        if (killCondition > 0 && killCondition < lotteryUtil.totalBet) {
            return lotteryUtil.setSystemWinOrLoss(true).result();
        }
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
exports.default = ControlImpl;
ControlImpl.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3BpcmF0ZS9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUE4QztBQUM5QyxtRkFBOEU7QUFDOUUsMkVBQXNFO0FBQ3RFLDZEQUF3RDtBQUV4RCxzRUFBa0Y7QUFRbEYsTUFBcUIsV0FBWSxTQUFRLGlDQUFtQztJQWdCeEUsWUFBWSxFQUFDLElBQUksRUFBQztRQUNkLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7UUFIbEIsaUJBQVksR0FBdUIsdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFJcEUsQ0FBQztJQVpNLE1BQU0sQ0FBQyxrQkFBa0I7UUFDNUIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFFLENBQUM7U0FDdEY7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQVFELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBYyxFQUFFLFdBQW9CO1FBQ2pELElBQUksTUFBb0IsRUFBRSxXQUF5QixDQUFDO1FBRXBELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBQSxzQkFBYyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxNQUFNLEVBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsR0FBRyxhQUFhLENBQUM7UUFHckYsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUU7WUFDL0IsTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztTQUN6RTtRQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUM5RCxXQUFXLEdBQUcsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxLQUFLLENBQUM7U0FDdEU7YUFBTTtZQUNILFdBQVcsR0FBRyx3QkFBWSxDQUFDLFFBQVEsQ0FBQztTQUN2QztRQUlELE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FDZixJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBR3BFLElBQUksU0FBUyxFQUFFO1lBRVgsTUFBTSxHQUFHLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2RCxXQUFXLEdBQUcsd0JBQVksQ0FBQyxLQUFLLENBQUM7U0FDcEM7UUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5DLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFPTyxrQkFBa0IsQ0FBQyxXQUFvQixFQUFFLHNCQUFnRDtRQUM3RixNQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO1FBR3BFLElBQUksYUFBYSxHQUFHLENBQUMsSUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUMzRCxPQUFPLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUN4RDtRQUdELE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUc3RSxJQUFJLGFBQWEsRUFBRTtZQUVmLE1BQU0sVUFBVSxHQUFZLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUdsRSxPQUFPLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQy9EO1FBRUQsT0FBUTtJQUNaLENBQUM7SUFPTyxlQUFlLENBQUMsV0FBb0IsRUFBRSxpQkFBK0I7UUFFekUsSUFBSSxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QyxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMvQjtRQUVELE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixLQUFLLHdCQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEcsQ0FBQzs7QUFoR0wsOEJBaUdDO0FBaEdrQixvQkFBUSxHQUFnQixJQUFJLENBQUMifQ==