"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baijiaConst_1 = require("./baijiaConst");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
        this.isControl = false;
    }
    init() {
        this.isControl = false;
    }
    async runControl() {
        this.init();
        if (this.stripPlayers().length <= 0) {
            return this.room.getNotContainKillAreaResult();
        }
        const controlResult = await this.getControlResult();
        if (controlResult.sceneControlState !== constants_1.ControlState.NONE) {
            this.isControl = true;
        }
        return this.room.bankerIsRealMan() ? this.playerBanker(controlResult) :
            this.systemBanker(controlResult);
    }
    systemBanker({ personalControlPlayers: players, sceneControlState, isPlatformControl }) {
        if (players.length > 0) {
            const isKill = this.checkKillPlayers(players);
            if (!isKill) {
                const needControlPlayers = this.filterNeedControlPlayer(players);
                if (needControlPlayers.length) {
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);
                    this.isControl = true;
                    this.room.setPlayersState({ players: controlPlayers, state });
                    return this.room.personalDealCards({ state });
                }
            }
            else {
                this.isControl = true;
            }
        }
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }
    playerBanker({ personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl }) {
        if (players.find(p => p.uid === this.room.zhuangInfo.uid)) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            const bankerControlInfo = needControlPlayers.find(p => p.uid === this.room.zhuangInfo.uid);
            if (bankerControlInfo) {
                this.isControl = true;
                this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(constants_1.ControlKinds.PERSONAL);
                return this.room.controlDealCardsBanker({ bankerWin: !(bankerControlInfo.probability >= 0) });
            }
        }
        if (bankerKill) {
            this.isControl = true;
            this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(constants_1.ControlKinds.SCENE);
            return this.room.controlDealCardsBanker({ bankerWin: false });
        }
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }
    checkKillPlayers(players) {
        let isKill = false, transfinite = {};
        const controlUidList = [];
        for (let controlPlayer of players) {
            const player = this.room.getPlayer(controlPlayer.uid);
            const transfiniteArea = player.checkOverrunBet({ condition: controlPlayer.killCondition });
            if (Object.keys(transfiniteArea).length) {
                controlUidList.push(controlPlayer.uid);
            }
            for (let area in transfiniteArea) {
                if (!transfinite[area])
                    transfinite[area] = 0;
                transfinite[area] += transfiniteArea[area];
            }
        }
        for (let area in transfinite) {
            const mappingArea = baijiaConst_1.mapping[area];
            if (!mappingArea) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }
            const mappingBetNum = transfinite[mappingArea];
            if (!mappingBetNum) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }
            if (mappingBetNum === transfinite[area]) {
                delete transfinite[mappingArea];
                continue;
            }
            mappingBetNum > transfinite[area] ? this.room.addKillArea({ area: mappingArea }) :
                this.room.addKillArea({ area });
            isKill = true;
            delete transfinite[mappingArea];
        }
        if (isKill) {
            this.room.addKillArea({ area: 'draw' });
        }
        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(constants_1.ControlKinds.PERSONAL));
        return isKill;
    }
    stripPlayers() {
        return this.room.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && (p.bet > 0 || p.uid === this.room.zhuangInfo.uid))
            .map(p => (0, utils_1.filterProperty)(p));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlqaWEvbGliL0NvbnRyb2xJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMENBQThDO0FBQzlDLCtDQUFzQztBQUN0QyxtRkFBOEU7QUFFOUUsc0VBQWtGO0FBQ2xGLHVFQUFrRTtBQU9sRSxNQUFxQixXQUFZLFNBQVEsaUNBQWU7SUFJcEQsWUFBWSxNQUFnQztRQUN4QyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFIbEIsY0FBUyxHQUFZLEtBQUssQ0FBQztJQUkzQixDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFHTSxLQUFLLENBQUMsVUFBVTtRQUNuQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFWixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1NBQ2xEO1FBR0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUdwRCxJQUFJLGFBQWEsQ0FBQyxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksRUFBRTtZQUN2RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN6QjtRQUdELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQU1PLFlBQVksQ0FBQyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBaUI7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