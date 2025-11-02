"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
class StateInwaitAction {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, paramRoomCode) {
        if (this.roomCodeList.findIndex((roomId) => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new StateInwaitAction(room);
        }
        return this.instanceMap[paramRoomCode];
    }
    initBeforeGame() {
        if (this.room.redPackQueue.length > 0 && !this.room.redPackQueue[0].isRobot) {
            this.room.robotGrabRedPacketLimit = this.room.sceneId === 0 ? 10 : 7;
        }
        else {
            this.room.robotGrabRedPacketLimit = this.room.sceneId === 0 ? 10 : 7;
        }
        this.room.robotGrabRedPacketCount = 0;
        if (this.room.currentGraberQueue.length !== 0)
            this.room.currentGraberQueue = [];
        if (this.room.tmp_countDown < 0)
            this.room.tmp_countDown = this.room.grabCountDown;
    }
    checkRedPacketQueue() {
        try {
            let nextStatus = false;
            while (!nextStatus) {
                const { length } = this.room.redPackQueue;
                if (length === 0) {
                    break;
                }
                const redPacket = this.room.redPackQueue[0];
                const player = this.room.getPlayer(redPacket.owner_uid);
                if (!player) {
                    this.room.redPackQueue = this.room.redPackQueue.slice(1);
                    continue;
                }
                if (player.gold >= redPacket.amount) {
                    nextStatus = true;
                }
                else {
                    this.room.redPackQueue = this.room.redPackQueue.slice(1);
                }
            }
            const { length } = this.room.redPackQueue;
            if (length > 0) {
                return true;
            }
            if (this.room.tmp_countDown === 0 && length === 0) {
                this.room.endAction.nextGameRound();
                this.room.channelForPlayerAction.roomWaitForHandOutRedPacketToAllPlayer();
            }
            return false;
        }
        catch (e) {
            logger.error(`红包扫雷 | ${this.room.roomId} | 检测红包队列是否有红包 | 出错 : ${e.stack}`);
            return false;
        }
    }
}
exports.default = StateInwaitAction;
StateInwaitAction.roomCodeList = [];
StateInwaitAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVXYWl0QWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpYi9leHBhbnNpb24vcm9vbUV4cGFuc2lvbi9TdGF0ZVdhaXRBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpQ0FBa0M7QUFFbEMsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVuRCxNQUFxQixpQkFBaUI7SUFnQnBDLFlBQVksSUFBVTtRQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBWEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFVLEVBQUUsYUFBcUI7UUFDbEQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6RSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDL0Q7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQVNELGNBQWM7UUFFWixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxD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