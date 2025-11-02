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
    runSceneControl(lotteryUtil, sceneControlState) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return lotteryUtil.result();
        }
        return lotteryUtil.setSystemWinOrLoss(sceneControlState === constants_1.ControlState.SYSTEM_WIN).result();
    }
}
exports.default = ControlImpl;
ControlImpl.instances = new Map();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CaW5nb01vbmV5L2xpYi9Db250cm9sSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUE4QztBQUM5QyxtRkFBOEU7QUFDOUUsNkRBQXdEO0FBRXhELHNFQUFrRjtBQVNsRixNQUFxQixXQUFZLFNBQVEsaUNBQW1DO0lBZ0J4RSxZQUFZLEVBQUMsSUFBSSxFQUFDO1FBQ2QsS0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUhsQixpQkFBWSxHQUF1Qix1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUloRSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0MsQ0FBQztJQWJNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFVO1FBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBRSxDQUFDLENBQUM7U0FDcEU7UUFFRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBU0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFjLEVBQUUsV0FBb0I7UUFFakQsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQztTQUMzRTtRQUVELElBQUksTUFBa0IsRUFBRSxXQUF5QixDQUFDO1FBRWxELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBQSxzQkFBYyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxNQUFNLEVBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsR0FBRyxhQUFhLENBQUM7UUFHckYsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFHekMsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUU7WUFDL0IsTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztTQUN6RTtRQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUU5RCxXQUFXLEdBQUcsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxLQUFLLENBQUM7U0FDdEU7YUFBTTtZQUNILFdBQVcsR0FBRyx3QkFBWSxDQUFDLFFBQVEsQ0FBQztTQUN2QztRQUdELE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FDZixJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBR3BFLElBQUksU0FBUyxFQUFFO1lBRVgsTUFBTSxHQUFHLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2RCxXQUFXLEdBQUcsd0JBQVksQ0FBQyxLQUFLLENBQUM7U0FDcEM7UUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5DLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFPTyxrQkFBa0IsQ0FBQyxXQUFvQixFQUFFLHNCQUFnRDtRQUM3RixNQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO1FBR3BFLElBQUksYUFBYSxHQUFHLENBQUMsSUFBSSxhQUFhLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUM1RCxPQUFPLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUN4RDtRQUlELE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUc3RSxJQUFJLGFBQWEsRUFBRTtZQUVmLE1BQU0sVUFBVSxHQUFZLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUdsRSxPQUFPLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQy9EO1FBRUQsT0FBUTtJQUNaLENBQUM7SUFPTyxlQUFlLENBQUMsV0FBb0IsRUFBRSxpQkFBK0I7UUFFekUsSUFBSSxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QyxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMvQjtRQUVELE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixLQUFLLHdCQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEcsQ0FBQzs7QUExR0wsOEJBMkdDO0FBMUdrQixxQkFBUyxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDIn0=