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
        const { isOverrun } = this.isEarningsTransfinite({ player, profit: result.profit });
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
exports.default = Control;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2x1Y2t5V2hlZWwvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBOEM7QUFDOUMsbUZBQThFO0FBQzlFLDZEQUF3RDtBQUV4RCxzRUFBa0Y7QUFRbEYsTUFBcUIsT0FBUSxTQUFRLGlDQUFtQztJQUdwRSxZQUFZLEVBQUMsSUFBSSxFQUFDO1FBQ2QsS0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUhsQixpQkFBWSxHQUF1Qix1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUlwRSxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFjLEVBQUUsV0FBb0I7UUFDakQsSUFBSSxNQUF1QixFQUFFLFdBQXlCLENBQUM7UUFFdkQsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFBLHNCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sRUFBQyxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxHQUFHLGFBQWEsQ0FBQztRQUdyRixJQUFJLHNCQUFzQixDQUFDLE1BQU0sRUFBRTtZQUMvQixNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlELFdBQVcsR0FBRyxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLEtBQUssQ0FBQztTQUN0RTthQUFNO1lBQ0gsV0FBVyxHQUFHLHdCQUFZLENBQUMsUUFBUSxDQUFDO1NBQ3ZDO1FBSUQsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUNmLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFHbEUsSUFBSSxTQUFTLEVBQUU7WUFFWCxNQUFNLEdBQUcsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZELFdBQVcsR0FBRyx3QkFBWSxDQUFDLEtBQUssQ0FBQztTQUNwQztRQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbkMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQU9PLGtCQUFrQixDQUFDLFdBQW9CLEVBQUUsc0JBQWdEO1FBQzdGLE1BQU0sYUFBYSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7UUFHcEUsSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQzNELE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3hEO1FBR0QsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRzdFLElBQUksYUFBYSxFQUFFO1lBRWYsTUFBTSxVQUFVLEdBQVksSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBR2xFLE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDL0Q7UUFFRCxPQUFRO0lBQ1osQ0FBQztJQU9PLGVBQWUsQ0FBQyxXQUFvQixFQUFFLGlCQUErQjtRQUV6RSxJQUFJLGlCQUFpQixLQUFLLHdCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pDLE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQy9CO1FBRUQsT0FBTyxXQUFXLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsRyxDQUFDO0NBQ0o7QUFwRkQsMEJBb0ZDIn0=