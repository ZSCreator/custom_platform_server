"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const constants_1 = require("../../../services/newControl/constants");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    static getControlInstance() {
        if (this.instance === null) {
            this.instance = new ControlImpl({ room: { nid: GameNidEnum_1.GameNidEnum.Scratch, sceneId: 0 } });
        }
        return this.instance;
    }
    async runControl(player, lotteryUtil) {
        let result, controlType;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState, isPlatformControl } = controlResult;
        lotteryUtil.setTotalBetAndJackpotId(player.bet, player.jackpotId);
        if (personalControlPlayers.length) {
            result = await this.runPersonalControl(lotteryUtil, personalControlPlayers);
        }
        if (!result) {
            result = await this.runSceneControl(lotteryUtil, sceneControlState);
            controlType = sceneControlState === constants_1.ControlState.NONE ? constants_1.ControlKinds.NONE :
                isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        }
        else {
            controlType = constants_1.ControlKinds.PERSONAL;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NjcmF0Y2gvbGliL2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBOEM7QUFDOUMsMkVBQXNFO0FBRXRFLHNFQUFrRjtBQUVsRixtRkFBOEU7QUFROUUsTUFBcUIsV0FBWSxTQUFRLGlDQUFlO0lBY3BELFlBQVksRUFBQyxJQUFJLEVBQUM7UUFDZCxLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFWTSxNQUFNLENBQUMsa0JBQWtCO1FBQzVCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFdBQVcsQ0FBQyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBRSxDQUFDO1NBQ3RGO1FBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFNRCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWMsRUFBRSxXQUFvQjtRQUNqRCxJQUFJLE1BQXlCLEVBQUUsV0FBeUIsQ0FBQztRQUV6RCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUEsc0JBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSxFQUFDLHNCQUFzQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLEdBQUcsYUFBYSxDQUFDO1FBR3JGLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUdsRSxJQUFJLHNCQUFzQixDQUFDLE1BQU0sRUFBRTtZQUMvQixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLHNCQUFzQixDQUFDLENBQUM7U0FDL0U7UUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNwRSxXQUFXLEdBQUcsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxLQUFLLENBQUM7U0FDdEU7YUFBTTtZQUNILFdBQVcsR0FBRyx3QkFBWSxDQUFDLFFBQVEsQ0FBQztTQUN2QztRQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbkMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQU9PLGtCQUFrQixDQUFDLFdBQW9CLEVBQUUsc0JBQWdEO1FBQzdGLE1BQU0sYUFBYSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7UUFHcEUsSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQzNELE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3hEO1FBR0QsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRzdFLElBQUksYUFBYSxFQUFFO1lBRWYsTUFBTSxVQUFVLEdBQVksSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBR2xFLE9BQU8sV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDL0Q7UUFFRCxPQUFRO0lBQ1osQ0FBQztJQU9PLGVBQWUsQ0FBQyxXQUFvQixFQUFFLGlCQUErQjtRQUV6RSxJQUFJLGlCQUFpQixLQUFLLHdCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pDLE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQy9CO1FBRUQsT0FBTyxXQUFXLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEtBQUssd0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsRyxDQUFDOztBQXJGTCw4QkFzRkM7QUFyRmtCLG9CQUFRLEdBQWdCLElBQUksQ0FBQyJ9