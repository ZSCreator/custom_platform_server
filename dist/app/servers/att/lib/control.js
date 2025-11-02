"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const slotGameControl_1 = require("../../../domain/CommonControl/slotGameControl");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const limitConfigManager_1 = require("./limitConfigManager");
const constants_1 = require("../../../services/newControl/constants");
class Control extends slotGameControl_1.SlotGameControl {
    constructor({ room } = { room: { nid: GameNidEnum_1.GameNidEnum.att, sceneId: 0 } }) {
        super({ room });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
    }
    static getControlInstance(room) {
        if (this.instance === null) {
            this.instance = new Control({ room });
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
        console.warn(`调控玩家 uid: ${player.uid} 玩家收益: ${result.totalWin} 调控状态 ${controlType} 
         场控数据 ${JSON.stringify(personalControlPlayers)} ${sceneControlState} 是否超限 ${isOverrun}`);
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
            console.warn(`调控玩家 uid: ${controlPlayer.uid} 系统赢: ${!isPositive}`);
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
Control.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2F0dC9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUE4QztBQUM5QyxtRkFBOEU7QUFDOUUsMkVBQXNFO0FBQ3RFLDZEQUF3RDtBQUV4RCxzRUFBa0Y7QUFTbEYsTUFBcUIsT0FBUSxTQUFRLGlDQUFtQztJQWdCcEUsWUFBWSxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBQztRQUM3RCxLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBSGxCLGlCQUFZLEdBQXVCLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBSXBFLENBQUM7SUFaTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBVTtRQUN2QyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBRSxDQUFDO1NBQ3hDO1FBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFRRCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWMsRUFBRSxXQUF3QjtRQUNyRCxJQUFJLE1BQWlCLEVBQUUsV0FBeUIsQ0FBQztRQUVqRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUEsc0JBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSxFQUFDLHNCQUFzQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLEdBQUcsYUFBYSxDQUFDO1FBR3JGLElBQUksc0JBQXNCLENBQUMsTUFBTSxFQUFFO1lBQy9CLE1BQU0sR0FB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