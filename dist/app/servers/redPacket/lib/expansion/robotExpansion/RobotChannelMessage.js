"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotChannelMessage = void 0;
class RobotChannelMessage {
    constructor(robot) {
        this.robot = robot;
    }
    waitForHandoutRedPacket({ countDown }) {
        this.robot.countDown = countDown;
        if (!this.robot.canNotAction) {
            this.robot.handOutRedPacket();
        }
    }
    grabRedPacket({ roomId, roomStatus, countDown, currentRedPacketInfo }) {
        this.robot.currentRedPacketInfo = currentRedPacketInfo;
        this.robot.grabRedPacket();
    }
    redPacketQueueWithUpdate({ redPacketList }) {
        this.robot.redPacketQueueUpdateTimeStamp = Math.round(new Date().getTime() / 1000);
        this.robot.redPacketQueue = redPacketList;
        this.robot.beInRedPacketQueueFlag = !!this.robot.redPacketQueue.find(({ owner_uid }) => owner_uid === this.robot.uid);
        if (this.robot.heartbetHandoutRedPacketAction) {
            this.robot.heartbetHandoutRedPacketAction = !this.robot.redPacketQueue.find(({ owner_uid }) => owner_uid === this.robot.uid);
        }
        if (!this.robot.beInRedPacketQueueFlag && !this.robot.canNotAction)
            this.robot.handOutRedPacket();
    }
    endOfGameRound({ gameRound, canBeSettled, redPackQueue }) {
        if (!canBeSettled)
            return;
        this.robot.nextGameRound();
    }
    async gameSettled({ gameRound, redPackQueue, result }) {
        if (!result)
            return;
        const robotResultIdx = result.grabberResult.findIndex(settleInfo => settleInfo.uid === this.robot.uid);
        if (robotResultIdx < 0)
            return;
        const { profitAmount } = result.grabberResult[robotResultIdx];
        if (profitAmount > 0)
            this.robot.winRound += 1;
        this.robot.playRound += 1;
        this.robot.profit += profitAmount;
        this.robot.playerGold += profitAmount;
        this.robot.initNextGameGoundTmpInfo();
        if (this.robot.playRound > this.robot.maxRound) {
            await this.robot.leave();
        }
    }
    someOneHandoutRedPacket({ roomStatus, hadAddRedPacket }) {
        const { uid, amount } = hadAddRedPacket;
        if (this.robot.roomStatus !== roomStatus)
            this.robot.changeRoomStatus(roomStatus);
    }
    someOneGrabRedPacket(messageList) {
        const { length } = messageList;
        for (let i = 0; i < length; i++) {
            const { uid, redPacketAmount } = messageList[i];
            const graberIdx = this.robot.currentGraberQueue.findIndex(graberRedPacket => uid === graberRedPacket.grabUid);
            if (graberIdx < 0) {
                const redPacketIdx = this.robot.currentGraberQueue.findIndex(graberRedPacket => graberRedPacket.redPacketAmount === redPacketAmount);
                this.currentGraberQueue[redPacketIdx].grabUid = uid;
                this.currentGraberQueue[redPacketIdx].hasGrabed = true;
            }
        }
        if (this.robot.currentGraberQueue && this.robot.currentGraberQueue.length === length)
            this.robot.nextGameRound();
    }
    beInRedPacketQueue({ beInRedPacketList }) {
        this.robot.beInRedPacketQueueFlag = beInRedPacketList ? beInRedPacketList : null;
    }
    currentGraberQueue({ currentGraberQueue, gameRound }) {
        this.robot.currentGraberQueue = currentGraberQueue;
        this.robot.currentMines = currentGraberQueue.filter(redPacketInfo => redPacketInfo.isStepInMine).length;
    }
    timeOut() {
        if (!this.robot.canNotAction) {
            this.robot.canNotAction = true;
        }
        if (!this.robot.beInRedPacketQueueFlag) {
            this.robot.leave();
        }
    }
}
exports.RobotChannelMessage = RobotChannelMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3RDaGFubmVsTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JlZFBhY2tldC9saWIvZXhwYW5zaW9uL3JvYm90RXhwYW5zaW9uL1JvYm90Q2hhbm5lbE1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBaUJBLE1BQWEsbUJBQW1CO0lBSTlCLFlBQVksS0FBeUI7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUtELHVCQUF1QixDQUFDLEVBQUUsU0FBUyxFQUFrQztRQUNuRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFakMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFO1lBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUMvQjtJQUVILENBQUM7SUFNRCxhQUFhLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBdUI7UUFFeEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztRQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBSzdCLENBQUM7SUFPRCx3QkFBd0IsQ0FBQyxFQUFFLGFBQWEsRUFBK0I7UUFDckUsSUFBSSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDbkYsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FB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