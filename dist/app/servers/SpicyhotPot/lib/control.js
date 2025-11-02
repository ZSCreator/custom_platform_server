"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const slotGameControl_1 = require("../../../domain/CommonControl/slotGameControl");
const limitConfigManager_1 = require("./limitConfigManager");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const constants_1 = require("../../../services/newControl/constants");
const Room_1 = require("./Room");
class Control extends slotGameControl_1.SlotGameControl {
    constructor({ room }) {
        super({ room });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
    }
    static getControlInstance() {
        if (this.instance === null) {
            this.instance = new Control({ room: { nid: GameNidEnum_1.GameNidEnum.SpicyhotPot, sceneId: 0 } });
        }
        return this.instance;
    }
    async result(player, totalBet) {
        let result, controlType;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState, isPlatformControl } = controlResult;
        if (personalControlPlayers.length) {
            result = this.runPersonalControl(totalBet, personalControlPlayers);
        }
        if (!result) {
            result = this.runSceneControl(totalBet, sceneControlState);
            controlType = sceneControlState === constants_1.ControlState.NONE ? constants_1.ControlKinds.NONE :
                isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        }
        else {
            controlType = constants_1.ControlKinds.PERSONAL;
        }
        const { isOverrun } = this.isEarningsTransfinite({ player, profit: Room_1.default.calculateProfit(result.rebate, totalBet) });
        if (isOverrun) {
            result = Room_1.default.getWinOrLossResult(totalBet, true);
            controlType = constants_1.ControlKinds.SCENE;
        }
        player.setControlType(controlType);
        return result;
    }
    runPersonalControl(totalBet, personalControlPlayers) {
        const killCondition = personalControlPlayers[0].killCondition * 100;
        if (killCondition > 0 && killCondition <= totalBet) {
            return Room_1.default.getWinOrLossResult(totalBet, true);
        }
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);
        if (controlPlayer) {
            const isPositive = this.isPositiveControl(controlPlayer);
            return Room_1.default.getWinOrLossResult(totalBet, !isPositive);
        }
        return;
    }
    runSceneControl(totalBet, sceneControlState) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return Room_1.default.getResult(totalBet);
        }
        return Room_1.default.getWinOrLossResult(totalBet, sceneControlState === constants_1.ControlState.SYSTEM_WIN);
    }
}
exports.default = Control;
Control.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NwaWN5aG90UG90L2xpYi9jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQThDO0FBQzlDLG1GQUE4RTtBQUM5RSw2REFBd0Q7QUFDeEQsMkVBQXNFO0FBRXRFLHNFQUFrRjtBQUNsRixpQ0FBMEI7QUFNMUIsTUFBcUIsT0FBUSxTQUFRLGlDQUFtQztJQWdCcEUsWUFBWSxFQUFDLElBQUksRUFBQztRQUNkLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7UUFIbEIsaUJBQVksR0FBdUIsdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFJcEUsQ0FBQztJQVpNLE1BQU0sQ0FBQyxrQkFBa0I7UUFDNUIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFFLENBQUM7U0FDdEY7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQVFELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBYyxFQUFFLFFBQWdCO1FBQ3pDLElBQUksTUFBVyxFQUFFLFdBQXlCLENBQUM7UUFFM0MsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFBLHNCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sRUFBQyxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxHQUFHLGFBQWEsQ0FBQztRQUdyRixJQUFJLHNCQUFzQixDQUFDLE1BQU0sRUFBRTtZQUMvQixNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzVELFdBQVcsR0FBRyxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLEtBQUssQ0FBQztTQUN0RTthQUFNO1lBQ0gsV0FBVyxHQUFHLHdCQUFZLENBQUMsUUFBUSxDQUFDO1NBQ3ZDO1FBR0QsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUNmLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsY0FBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUdqRyxJQUFJLFNBQVMsRUFBRTtZQUVYLE1BQU0sR0FBRyxjQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pELFdBQVcsR0FBRyx3QkFBWSxDQUFDLEtBQUssQ0FBQztTQUNwQztRQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbkMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQU9PLGtCQUFrQixDQUFDLFFBQWdCLEVBQUUsc0JBQStDO1FBQ3hGLE1BQU0sYUFBYSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7UUFHcEUsSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLGFBQWEsSUFBSSxRQUFRLEVBQUU7WUFDaEQsT0FBUSxjQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ25EO1FBSUQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRzdFLElBQUksYUFBYSxFQUFFO1lBRWYsTUFBTSxVQUFVLEdBQVksSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBR2xFLE9BQU8sY0FBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsT0FBUTtJQUNaLENBQUM7SUFPTyxlQUFlLENBQUMsUUFBZ0IsRUFBRSxpQkFBK0I7UUFFckUsSUFBSSxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QyxPQUFPLGNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDbkM7UUFFRCxPQUFPLGNBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1RixDQUFDOztBQWhHTCwwQkFpR0M7QUFoR2tCLGdCQUFRLEdBQVksSUFBSSxDQUFDIn0=