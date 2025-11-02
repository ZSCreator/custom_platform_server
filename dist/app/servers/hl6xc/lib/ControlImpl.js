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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9obDZ4Yy9saWIvQ29udHJvbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBOEM7QUFDOUMsbUZBQThFO0FBQzlFLDZEQUF3RDtBQUV4RCxzRUFBa0Y7QUFTbEYsTUFBcUIsV0FBWSxTQUFRLGlDQUFtQztJQWdCeEUsWUFBWSxFQUFDLElBQUksRUFBQztRQUNkLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7UUFIbEIsaUJBQVksR0FBdUIsdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFJaEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNDLENBQUM7SUFiTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBVTtRQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUUsQ0FBQyxDQUFDO1NBQ3BFO1FBRUQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQVNELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBYyxFQUFFLFdBQW9CO1FBRWpELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7U0FDM0U7UUFFRCxJQUFJLE1BQWtCLEVBQUUsV0FBeUIsQ0FBQztRQUVsRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElB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