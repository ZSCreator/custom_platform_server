"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logic_1 = require("./logic");
const utils_1 = require("../../../utils");
const slotGameControl_1 = require("../../CommonControl/slotGameControl");
const limitConfigManager_1 = require("./limitConfigManager");
const constants_1 = require("../../../services/newControl/constants");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
class ControlImpl extends slotGameControl_1.SlotGameControl {
    constructor({ room }) {
        super({ room });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
    }
    static getControlInstance() {
        if (this.instance === null) {
            this.instance = new ControlImpl({ room: { nid: GameNidEnum_1.GameNidEnum.xiyouji, sceneId: 0 } });
        }
        return this.instance;
    }
    async runControl({ player, par, totalBet }) {
        let result;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState } = controlResult;
        if (personalControlPlayers.length) {
            result = this.runPersonalControl({ totalBet, par, personalControlPlayers });
        }
        if (!result) {
            result = this.runSceneControl({ totalBet, par, sceneControlState });
        }
        const { isOverrun } = this.isEarningsTransfinite({ player, profit: result.finalResult_1.allTotalWin });
        if (isOverrun) {
            result = (0, logic_1.getResult)(par, totalBet, true);
        }
        return result;
    }
    runPersonalControl({ par, totalBet, personalControlPlayers }) {
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);
        if (controlPlayer) {
            const isPositive = this.isPositiveControl(controlPlayer);
            return (0, logic_1.getResult)(par, totalBet, !isPositive);
        }
        return;
    }
    runSceneControl({ par, totalBet, sceneControlState }) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return (0, logic_1.randomResult)(par);
        }
        return (0, logic_1.getResult)(par, totalBet, sceneControlState === constants_1.ControlState.SYSTEM_WIN);
    }
}
exports.default = ControlImpl;
ControlImpl.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZG9tYWluL2dhbWVzL3hpeW91amkvQ29udHJvbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBa0Q7QUFDbEQsMENBQThDO0FBQzlDLHlFQUFvRTtBQUNwRSw2REFBd0Q7QUFFeEQsc0VBQW9FO0FBQ3BFLDJFQUFzRTtBQU10RSxNQUFxQixXQUFZLFNBQVMsaUNBQW1DO0lBZ0J6RSxZQUFZLEVBQUMsSUFBSSxFQUFDO1FBQ2QsS0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUhsQixpQkFBWSxHQUF1Qix1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUlwRSxDQUFDO0lBWk0sTUFBTSxDQUFDLGtCQUFrQjtRQUM1QixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUUsQ0FBQztTQUN0RjtRQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBUUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUNnQztRQUNuRSxJQUFJLE1BQVcsQ0FBQztRQUVoQixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUEsc0JBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSxFQUFDLHNCQUFzQixFQUFFLGlCQUFpQixFQUFDLEdBQUcsYUFBYSxDQUFDO1FBR2xFLElBQUksc0JBQXNCLENBQUMsTUFBTSxFQUFFO1lBQy9CLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixFQUFFLENBQUMsQ0FBQztTQUMvRTtRQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQyxDQUFDO1NBQ3JFO1FBR0QsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUNmLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBR3JGLElBQUksU0FBUyxFQUFFO1lBRVgsTUFBTSxHQUFHLElBQUEsaUJBQVMsRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQU1PLGtCQUFrQixDQUFDLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFDK0M7UUFFNUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRzdFLElBQUksYUFBYSxFQUFFO1lBRWYsTUFBTSxVQUFVLEdBQVksSUFBSSxDQUFDLGlCQUFpQixDQUFFLGFBQWEsQ0FBRSxDQUFDO1lBR3BFLE9BQU8sSUFBQSxpQkFBUyxFQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNoRDtRQUVELE9BQVE7SUFDWixDQUFDO0lBUU8sZUFBZSxDQUFDLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFDa0M7UUFFdkYsSUFBSSxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QyxPQUFPLElBQUEsb0JBQVksRUFBQyxHQUFHLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sSUFBQSxpQkFBUyxFQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRixDQUFDOztBQXBGTCw4QkFxRkM7QUFwRmtCLG9CQUFRLEdBQWdCLElBQUksQ0FBQyJ9