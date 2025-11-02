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
            this.instance = new ControlImpl({ room: { nid: GameNidEnum_1.GameNidEnum.MineGame, sceneId: 0 } });
        }
        return this.instance;
    }
    async runControl(player, lotteryUtil) {
        let result;
        let controlType;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState, isPlatformControl } = controlResult;
        if (personalControlPlayers.length) {
            result = this.runPersonalControl(lotteryUtil, personalControlPlayers);
        }
        if (!result) {
            controlType = sceneControlState === constants_1.ControlState.NONE ? constants_1.ControlKinds.NONE :
                isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        }
        else {
            controlType = constants_1.ControlKinds.PERSONAL;
        }
        const { isOverrun, limit } = this.isEarningsTransfinite({ player, profit: 0 });
        if (isOverrun) {
            controlType = constants_1.ControlKinds.SCENE;
        }
        player.setControlType(controlType);
        return { result, limit };
    }
    runPersonalControl(lotteryUtil, personalControlPlayers) {
        const killCondition = personalControlPlayers[0].killCondition * 100;
        if (killCondition > 0 && killCondition < lotteryUtil.totalBet) {
            return true;
        }
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);
        if (controlPlayer) {
            const isPositive = this.isPositiveControl(controlPlayer);
            return isPositive;
        }
        return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL01pbmVHYW1lL2xpYi9jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQWdEO0FBQ2hELG1GQUFnRjtBQUNoRiwyRUFBd0U7QUFDeEUsNkRBQTBEO0FBRTFELHNFQUFvRjtBQVFwRixNQUFxQixXQUFZLFNBQVEsaUNBQW1DO0lBZ0J4RSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQ2hCLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFIcEIsaUJBQVksR0FBdUIsdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFJcEUsQ0FBQztJQVpNLE1BQU0sQ0FBQyxrQkFBa0I7UUFDNUIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDeEY7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQVFELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBYyxFQUFFLFdBQW9CO1FBQ2pELElBQUksTUFBZSxDQUFDO1FBQ3BCLElBQUksV0FBeUIsQ0FBQztRQUU5QixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUEsc0JBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSxFQUFFLHNCQUFzQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsYUFBYSxDQUFDO1FBR3ZGLElBQUksc0JBQXNCLENBQUMsTUFBTSxFQUFFO1lBQy9CLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLHNCQUFzQixDQUFDLENBQUM7U0FDekU7UUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBRVQsV0FBVyxHQUFHLGlCQUFpQixLQUFLLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsS0FBSyxDQUFDO1NBQ3RFO2FBQU07WUFDSCxXQUFXLEdBQUcsd0JBQVksQ0FBQyxRQUFRLENBQUM7U0FDdkM7UUFJRCxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUN0QixJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFHdEQsSUFBSSxTQUFTLEVBQUU7WUFHWCxXQUFXLEdBQUcsd0JBQVksQ0FBQyxLQUFLLENBQUM7U0FDcEM7UUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5DLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQU9PLGtCQUFrQixDQUFDLFdBQW9CLEVBQUUsc0JBQStDO1FBQzVGLE1BQU0sYUFBYSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7UUFHcEUsSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQzNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFHRCxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFHN0UsSUFBSSxhQUFhLEVBQUU7WUFFZixNQUFNLFVBQVUsR0FBWSxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbEUsT0FBTyxVQUFVLENBQUM7U0FHckI7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBT08sZUFBZSxDQUFDLFdBQW9CLEVBQUUsaUJBQStCO1FBRXpFLElBQUksaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxJQUFJLEVBQUU7WUFDekMsT0FBTyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDL0I7UUFFRCxPQUFPLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xHLENBQUM7O0FBakdMLDhCQWtHQztBQWpHa0Isb0JBQVEsR0FBZ0IsSUFBSSxDQUFDIn0=