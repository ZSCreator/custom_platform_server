"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const GameStatusEnum_1 = require("../../enum/GameStatusEnum");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
class StateReadyAction {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, paramRoomCode) {
        if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new StateReadyAction(room);
        }
        return this.instanceMap[paramRoomCode];
    }
    initCountDown() {
        if (this.room.tmp_countDown < 0) {
            this.room.tmp_countDown = this.room.waitCountDown;
            const canBeSettled = this.room.currentGraberQueue.filter(GraberRedPacket => GraberRedPacket.hasGrabed).length > 0;
            if (!canBeSettled) {
                this.room.channelForPlayerAction.beInRedPacketQueueToPlayerInQueue();
                this.room.redPackQueue.splice(0, 1);
                this.room.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();
                this.room.waitAction.initBeforeGame();
                this.room.changeGameStatues(GameStatusEnum_1.GameStatusEnum.WAIT);
                this.room.channelForPlayerAction.gameOverToAllPlayer(false);
                logger.info(`红包扫雷|无人抢红包|房间:${this.room.roomId}|第${this.room.roundTimes}轮`);
            }
        }
    }
    clearCountDown() {
        this.room.tmp_countDown = 0;
    }
    checkGrabRedPacketQueue() {
        const { length } = this.room.currentGraberQueue.filter(redPacket => redPacket.hasGrabed);
        const playerHasGrabFlag = (length > 0 && this.room.tmp_countDown === 0) || length === this.room.currentGraberQueue.length;
        if (!playerHasGrabFlag)
            this.initCountDown();
        return playerHasGrabFlag;
    }
}
exports.default = StateReadyAction;
StateReadyAction.roomCodeList = [];
StateReadyAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVSZWFkeUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JlZFBhY2tldC9saWIvZXhwYW5zaW9uL3Jvb21FeHBhbnNpb24vU3RhdGVSZWFkeUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUFrQztBQUNsQyw4REFBMkQ7QUFFM0QsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUtuRCxNQUFxQixnQkFBZ0I7SUFrQm5DLFlBQVksSUFBVTtRQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBWkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFVLEVBQUUsYUFBcUI7UUFFbEQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzdEO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFTRCxhQUFhO1FBQ1gsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7WUFFbEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNsSCxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUlqQixJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGlDQUFpQyxFQUFFLENBQUM7Z0JBR3JFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBR3BDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztnQkFHdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBR3RDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsK0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFHakQsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2FBQzVFO1NBRUY7SUFDSCxDQUFDO0lBRUQsY0FBYztRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBS0QsdUJBQXVCO1FBQ3JCLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RixNQUFNLGlCQUFpQixHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUMsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7UUFDMUgsSUFBSSxDQUFDLGlCQUFpQjtZQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QyxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7O0FBckVILG1DQXVFQztBQW5FUSw2QkFBWSxHQUFhLEVBQUUsQ0FBQztBQUU1Qiw0QkFBVyxHQUFXLEVBQUUsQ0FBQyJ9