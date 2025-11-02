"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Control = void 0;
const slotGameControl_1 = require("../../../domain/CommonControl/slotGameControl");
const limitConfigManager_1 = require("./limitConfigManager");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const utils_1 = require("../../../utils");
const constants_1 = require("../../../services/newControl/constants");
const lotteryUtil_1 = require("./util/lotteryUtil");
class Control extends slotGameControl_1.SlotGameControl {
    constructor({ room }) {
        super({ room });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
    }
    static geInstance(sceneId) {
        let instance = this.instances.get(sceneId);
        if (!instance) {
            instance = new Control({ room: { nid: GameNidEnum_1.GameNidEnum.FruitMachine, sceneId } });
            this.instances.set(sceneId, instance);
        }
        return instance;
    }
    async result(player) {
        let result, controlType;
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers, sceneControlState, isPlatformControl } = controlResult;
        if (personalControlPlayers.length) {
            result = this.runPersonalControl(player, personalControlPlayers);
        }
        if (!result) {
            result = this.runSceneControl(player, sceneControlState);
            controlType = sceneControlState === constants_1.ControlState.NONE ? constants_1.ControlKinds.NONE :
                isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        }
        else {
            controlType = constants_1.ControlKinds.PERSONAL;
        }
        const { isOverrun } = this.isEarningsTransfinite({ player, profit: result.totalProfit });
        if (isOverrun) {
            controlType = constants_1.ControlKinds.SCENE;
            result = (0, lotteryUtil_1.getWinORLossResultStandAlone)(player.betAreas, player.totalBet, true);
        }
        player.setControlType(controlType);
        return result;
    }
    runPersonalControl(player, personalControlPlayers) {
        const killCondition = personalControlPlayers[0].killCondition * 100;
        if (killCondition > 0 && killCondition <= player.totalBet) {
            return (0, lotteryUtil_1.getWinORLossResultStandAlone)(player.betAreas, player.totalBet, true);
        }
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);
        if (controlPlayer) {
            const isPositive = this.isPositiveControl(controlPlayer);
            return (0, lotteryUtil_1.getWinORLossResultStandAlone)(player.betAreas, player.totalBet, !isPositive);
        }
        return;
    }
    runSceneControl(player, sceneControlState) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return (0, lotteryUtil_1.getRandomLotteryResultStandAlone)(player.betAreas);
        }
        return (0, lotteryUtil_1.getWinORLossResultStandAlone)(player.betAreas, player.totalBet, sceneControlState === constants_1.ControlState.SYSTEM_WIN);
    }
}
exports.Control = Control;
Control.instances = new Map();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0ZydWl0TWFjaGluZS9saWIvY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtRkFBOEU7QUFDOUUsNkRBQXdEO0FBQ3hELDJFQUFzRTtBQUN0RSwwQ0FBOEM7QUFFOUMsc0VBQWtGO0FBRWxGLG9EQUFrRztBQU1sRyxNQUFhLE9BQVEsU0FBUSxpQ0FBbUM7SUFtQjVELFlBQVksRUFBQyxJQUFJLEVBQUM7UUFDZCxLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBSGxCLGlCQUFZLEdBQUcsdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFJaEQsQ0FBQztJQWZNLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBZTtRQUNwQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsUUFBUSxHQUFHLElBQUksT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBQyxFQUFDLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDekM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBUUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFjO1FBQ3ZCLElBQUksTUFBVyxFQUFFLFdBQXlCLENBQUM7UUFFM0MsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFBLHNCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sRUFBQyxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIs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