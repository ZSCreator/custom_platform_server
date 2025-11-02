"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const slotGameControl_1 = require("../../../domain/CommonControl/slotGameControl");
const limitConfigManager_1 = require("./limitConfigManager");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends slotGameControl_1.SlotGameControl {
    constructor({ room }) {
        super({ room });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
        this.experienceField = room.experience;
    }
    static getControlInstance(room) {
        if (!this.instances.get(room.sceneId)) {
            this.instances.set(room.sceneId, new ControlImpl({ room: room }));
        }
        return this.instances.get(room.sceneId);
    }
    async runControl(player, lotteryUtil) {
        if (this.experienceField) {
            return this.runSceneControl(lotteryUtil, this.experienceFieldControl());
        }
        let result, controlType;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState, isPlatformControl } = controlResult;
        lotteryUtil.setTotalBet(player.totalBet);
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
        const { isOverrun } = this.isEarningsTransfinite({ player, profit: result.totalWin + result.freeSpinResult.totalWin });
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
    runSceneControl(lotteryUtil, sceneControlState) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return lotteryUtil.result();
        }
        return lotteryUtil.setSystemWinOrLoss(sceneControlState === constants_1.ControlState.SYSTEM_WIN).result();
    }
}
exports.default = ControlImpl;
ControlImpl.instances = new Map();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DYXNoU2xvdC9saWIvQ29udHJvbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBZ0Q7QUFDaEQsbUZBQWdGO0FBQ2hGLDZEQUEwRDtBQUUxRCxzRUFBb0Y7QUFTcEYsTUFBcUIsV0FBWSxTQUFRLGlDQUFtQztJQWdCeEUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNoQixLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBSHBCLGlCQUFZLEdBQXVCLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBSWhFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQyxDQUFDO0lBYk0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQVU7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNuQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNyRTtRQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFTRCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWMsRUFBRSxXQUFvQjtRQUVqRCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDdEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1NBQzNFO1FBRUQsSUFBSSxNQUFrQixFQUFFLFdBQXlCLENBQUM7UUFFbEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFBLHNCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLGFBQWEsQ0FBQztRQUd2RixXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUd6QyxJQUFJLHNCQUFzQixDQUFDLE1BQU0sRUFBRTtZQUMvQixNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBRTlELFdBQVcsR0FBRyxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLEtBQUssQ0FBQztTQUN0RTthQUFNO1lBQ0gsV0FBVyxHQUFHLHdCQUFZLENBQUMsUUFBUSxDQUFDO1NBQ3ZDO1FBR0QsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUNmLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFHckcsSUFBSSxTQUFTLEVBQUU7WUFFWCxNQUFNLEdBQUcsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZELFdBQVcsR0FBRyx3QkFBWSxDQUFDLEtBQUssQ0FBQztTQUNwQztRQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbkMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQU9PLGtCQUFrQixDQUFDLFdBQW9CLEVBQUUsc0JBQStDO1FBQzVGLE1BQU0sYUFBYSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7UUFHcEUsSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLGFBQWEsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQzVELE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3hEO1FBSUQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRzdFLElBQUksYUFBYSxFQUFFO1lBRWYsTUFBTSxVQUFVLEdBQVksSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBR2xFLE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDL0Q7UUFFRCxPQUFPO0lBQ1gsQ0FBQztJQU9PLGVBQWUsQ0FBQyxXQUFvQixFQUFFLGlCQUErQjtRQUV6RSxJQUFJLGlCQUFpQixLQUFLLHdCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pDLE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQy9CO1FBRUQsT0FBTyxXQUFXLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsRyxDQUFDOztBQTFHTCw4QkEyR0M7QUExR2tCLHFCQUFTLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUMifQ==