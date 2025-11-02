"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedPacketRobotImpl = void 0;
const BaseRobot_1 = require("../../../common/pojo/baseClass/BaseRobot");
const RobotChannelMessage_1 = require("./expansion/robotExpansion/RobotChannelMessage");
const RobotAgentMessage_1 = require("./expansion/robotExpansion/RobotAgentMessage");
const RobotAction_1 = require("./expansion/robotExpansion/RobotAction");
const RobotException_1 = require("./expansion/robotExpansion/RobotException");
const GameStatusEnum_1 = require("./enum/GameStatusEnum");
const PlayerGameStatusEnum_1 = require("./enum/PlayerGameStatusEnum");
const ChannelEventEnum_1 = require("./enum/ChannelEventEnum");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
const utils_1 = require("../../../utils");
class RedPacketRobotImpl extends BaseRobot_1.BaseRobot {
    constructor(options) {
        super(options);
        this.initGold = 0;
        this.playRound = 0;
        this.winRound = 0;
        this.playerGold = 0;
        this.roomStatus = GameStatusEnum_1.GameStatusEnum.NONE;
        this.countDown = 0;
        this.playerStatus = PlayerGameStatusEnum_1.PlayerGameStatusEnum.NONE;
        this.currentMines = 0;
        this.grabbedCount = 0;
        this.beInRedPacketQueueFlag = null;
        this.canGrabFlag = false;
        this.hadGrabFlag = false;
        this.maxRound = (0, utils_1.random)(5, 20);
        this.countDown_Timer = null;
        this.canNotAction = false;
        this.heartbeatTimer = null;
        this.redPacketQueueUpdateTimeStamp = 0;
        this.heartbetHandoutRedPacketAction = false;
        this.redPacketQueue = [];
        this.grabTimeOut = setTimeout(() => { }, 0);
        this.robotLogger = new RobotException_1.RobotException(this);
        this.channelMessage = new RobotChannelMessage_1.RobotChannelMessage(this);
        this.agentMessage = new RobotAgentMessage_1.RobotAgentMessage(this);
        this.action = new RobotAction_1.RobotAction(this);
    }
    registerListener() {
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.roomWaitForHandout, (msg) => this.channelMessage.waitForHandoutRedPacket(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.roomReady, (msg) => this.channelMessage.grabRedPacket(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.redPacketQueueWithUpdate, (msg) => this.channelMessage.redPacketQueueWithUpdate(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.settle, (msg) => this.channelMessage.endOfGameRound);
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.settled, (msg) => this.channelMessage.gameSettled(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.handout, (msg) => this.channelMessage.someOneHandoutRedPacket(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.grab, (msg) => this.channelMessage.someOneGrabRedPacket(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.beInRedPacketQueue, (msg) => this.channelMessage.beInRedPacketQueue(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.currentGraberQueue, (msg) => this.channelMessage.currentGraberQueue(msg));
        this.Emitter.on(ChannelEventEnum_1.ChannelEventEnum.timeout, () => this.channelMessage.timeOut());
        this.countDownProcess();
    }
    changeRoomStatus(status) {
        this.roomStatus = status;
    }
    changePlayerStatus(status) {
        this.playerStatus = status;
    }
    async leave() {
        clearInterval(this.countDown_Timer);
        clearTimeout(this.grabTimeOut);
        clearInterval(this.heartbeatTimer);
        await this.agentMessage.leaveRoom();
    }
    async destroy() {
        await this.agentMessage.leaveRoom();
        clearTimeout(this.grabTimeOut);
        clearInterval(this.countDown_Timer);
        clearInterval(this.heartbeatTimer);
    }
    countDownProcess() {
        this.countDown_Timer = setInterval(() => {
            if (this.countDown >= 0) {
                this.countDown -= 500;
                if (this.canGrabFlag) {
                    this.grabRedPacket();
                }
            }
        }, 500);
    }
    grabRedPacket() {
        if (this.hadGrabFlag || this.currentRedPacketInfo.uid === this.uid)
            return;
        this.action.grabTheRedPacket();
    }
    handOutRedPacket() {
        if (this.redPacketQueue.filter(redPacketInfo => redPacketInfo.owner_uid === this.uid).length)
            return;
        const { length } = this.redPacketQueue.filter(redPacketInfo => redPacketInfo.isRobot);
        const len = length < 5 ? length : 5;
        const currentProbability = (0, commonUtil_1.randomFromRange)(0, 100);
        const ableHandoutProbability = len * 20;
        if (currentProbability > ableHandoutProbability)
            this.action.handoutRedPacket();
    }
    nextGameRound() {
        if (!this.hadGrabFlag)
            clearTimeout(this.grabTimeOut);
        if (!this.currentGraberQueue.filter(redPacketInfo => redPacketInfo.grabUid === this.uid).length) {
            this.playRound++;
        }
    }
    initNextGameGoundTmpInfo() {
        this.currentGraberQueue = [];
        this.currentMines = 0;
        this.grabbedCount = 0;
        this.canGrabFlag = false;
        this.hadGrabFlag = false;
    }
}
exports.RedPacketRobotImpl = RedPacketRobotImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkUGFja2V0Um9ib3RJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpYi9SZWRQYWNrZXRSb2JvdEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFxRjtBQUNyRixvRkFBaUY7QUFDakYsd0VBQXFFO0FBQ3JFLDhFQUEyRTtBQUMzRSwwREFBdUQ7QUFDdkQsc0VBQW1FO0FBQ25FLDhEQUEyRDtBQUkzRCxrRUFBb0U7QUFDcEUsMENBQXdDO0FBd0J4QyxNQUFhLGtCQUFtQixTQUFRLHFCQUFTO0lBNEMvQyxZQUFZLE9BQU87UUFDakIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBM0NqQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBUXJCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBUXZCLGVBQVUsR0FBbUIsK0JBQWMsQ0FBQyxJQUFJLENBQUM7UUFDakQsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixpQkFBWSxHQUF5QiwyQ0FBb0IsQ0FBQyxJQUFJLENBQUM7UUFHL0QsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsMkJBQXNCLEdBQW1CLElBQUksQ0FBQztRQUU5QyxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM3QixnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM3QixhQUFRLEdBQVcsSUFBQSxjQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLG9CQUFlLEdBQWlCLElBQUksQ0FBQztRQUVyQyxpQkFBWSxHQUFZLEtBQUssQ0FBQztRQUU5QixtQkFBYyxHQUFpQixJQUFJLENBQUM7UUFDcEMsa0NBQTZCLEdBQVcsQ0FBQyxDQUFDO1FBQzFDLG1DQUE4QixHQUFZ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