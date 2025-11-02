"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_scheduler_1 = require("pinus-scheduler");
const utils_1 = require("../../../utils");
const slotGameControl_1 = require("../../../domain/CommonControl/slotGameControl");
const limitConfigManager_1 = require("./limitConfigManager");
const constants_1 = require("../../../services/newControl/constants");
class ControlImpl extends slotGameControl_1.SlotGameControl {
    constructor(params) {
        super({ game: { nid: params.room.nid, sceneId: params.room.sceneId } });
        this.limitManager = limitConfigManager_1.LimitConfigManager.getInstance();
        this.scheduleJobId = null;
        this.room = params.room;
    }
    runControl(currPlayer, profit, fishMultiple) {
        let playerRate = 0, sceneWights = 0;
        if (this.controlResult) {
            const { personalControlPlayers, isPlatformControl, sceneControlState } = this.controlResult;
            const player = personalControlPlayers.find(p => p.uid === currPlayer.uid);
            if (player)
                playerRate = player.probability;
            sceneWights = this.controlResult.sceneWeights;
            if (isPlatformControl && sceneControlState !== constants_1.ControlState.NONE) {
                sceneWights = sceneControlState === constants_1.ControlState.SYSTEM_WIN ? 100 : -80;
            }
        }
        const { isOverrun } = this.isEarningsTransfinite({ player: currPlayer, profit });
        let rate_low = 1;
        if (isOverrun) {
            rate_low = calculateLimit(fishMultiple);
            currPlayer.setControlType(constants_1.ControlKinds.SCENE);
        }
        if (playerRate !== 0) {
            currPlayer.setControlType(constants_1.ControlKinds.PERSONAL);
            return calculateControlPro(playerRate) * rate_low * (1 / fishMultiple);
        }
        if (sceneWights !== 0) {
            currPlayer.setControlType(this.controlResult.isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE);
        }
        return calculateControlPro(sceneWights) * rate_low * (1 / fishMultiple);
    }
    controlPlanTimer() {
        if (this.scheduleJobId) {
            return;
        }
        this.scheduleJobId = (0, pinus_scheduler_1.scheduleJob)({ period: 2000 }, async () => {
            this.controlResult = await this.getControlResult();
        });
    }
    cancelTimer() {
        (0, pinus_scheduler_1.cancelJob)(this.scheduleJobId);
        this.scheduleJobId = null;
    }
    stripPlayers() {
        return this.room.players.filter(p => !!p && p.isRobot === 0).map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = ControlImpl;
function calculateLimit(fishMultiple) {
    if (fishMultiple <= 10) {
        return 0.5;
    }
    else if (fishMultiple <= 20) {
        return 0.4;
    }
    else if (fishMultiple <= 50) {
        return 0.3;
    }
    else {
        return 0;
    }
}
function calculateControlPro(value) {
    if (value === 0) {
        return 1;
    }
    if (value > 0) {
        return (100 - value) / 2 / 100;
    }
    if (value < 0) {
        return (Math.abs(value) + 100) * 1.5 / 100;
    }
    if (value === 100) {
        return 0;
    }
    if (value === -100) {
        return 200;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9idXl1L2xpYi9Db250cm9sSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFEQUF1RDtBQUV2RCwwQ0FBOEM7QUFDOUMsbUZBQThFO0FBQzlFLDZEQUF3RDtBQUV4RCxzRUFBa0Y7QUFLbEYsTUFBcUIsV0FBWSxTQUFRLGlDQUFtQztJQU14RSxZQUFZLE1BQXNCO1FBQzlCLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFONUUsaUJBQVksR0FBdUIsdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEUsa0JBQWEsR0FBVyxJQUFJLENBQUM7UUFNekIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFRRCxVQUFVLENBQUMsVUFBa0IsRUFBRSxNQUFjLEVBQUUsWUFBb0I7UUFDL0QsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFFcEMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLE1BQU0sRUFBQyxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDMUYsTUFBTSxNQUFNLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUUsSUFBSSxNQUFNO2dCQUFFLFVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQzVDLFdBQVcsR0FBRyxJQUFJLENBQUMs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