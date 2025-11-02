"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameStatusEnum_1 = require("../../enum/GameStatusEnum");
const RedPacketGameStatusEnum_1 = require("../../enum/RedPacketGameStatusEnum");
const MessageService = require("../../../../../services/MessageService");
const ChannelEventEnum_1 = require("../../enum/ChannelEventEnum");
class ChannelForPlayerAction {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, paramRoomCode) {
        if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new ChannelForPlayerAction(room);
        }
        return this.instanceMap[paramRoomCode];
    }
    roomWaitForHandOutRedPacketToAllPlayer() {
        this.room.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.roomWaitForHandout, {
            roomId: this.room.roomId,
            roomStatus: GameStatusEnum_1.GameStatusEnum[this.room.status],
            countDown: this.room.tmp_countDown
        });
    }
    roomReadyForGrabToAllPlayer() {
        this.room.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.roomReady, {
            roomId: this.room.roomId,
            roomStatus: GameStatusEnum_1.GameStatusEnum[this.room.status],
            countDown: this.room.tmp_countDown,
            currentRedPacketInfo: Object.assign({}, this.room.getPlayer(this.room.redPackQueue[0].owner_uid).sendPlayerInfoForFrontEnd(), this.room.redPackQueue[0])
        });
    }
    redPacketQueueWithUpdateToAllPlayer() {
        this.room.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.redPacketQueueWithUpdate, {
            redPacketList: this.room.redPackQueue,
        });
    }
    beInRedPacketQueueToPlayerInQueue() {
        this.room.redPackQueue.map(redPacketInfo => {
            const member = this.room.channel.getMember(redPacketInfo.owner_uid);
            member && MessageService.pushMessageByUids(ChannelEventEnum_1.ChannelEventEnum.beInRedPacketQueue, { beInRedPacketList: redPacketInfo.status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.WAIT }, member);
        });
    }
    afterSettledToAllPlayer(result) {
        this.room.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.settled, {
            gameRound: this.room.roundTimes,
            redPackQueue: this.room.redPackQueue,
            result
        });
    }
    gameOverToAllPlayer(canBeSettled) {
        this.room.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.settle, {
            gameRound: this.room.roundTimes,
            redPackQueue: this.room.redPackQueue,
            canBeSettled,
            roundId: this.room.roundId,
        });
    }
    playerListWithUpdate(playerCount) {
        this.room.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.redPacketPlayerListWithUpdate, {
            playerCount
        });
    }
}
exports.default = ChannelForPlayerAction;
ChannelForPlayerAction.roomCodeList = [];
ChannelForPlayerAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbEZvclBsYXllckFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JlZFBhY2tldC9saWIvZXhwYW5zaW9uL2NoYW5uZWxFeHBhbnNpb24vQ2hhbm5lbEZvclBsYXllckFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDhEQUEyRDtBQUMzRCxnRkFBNkU7QUFDN0UseUVBQTBFO0FBQzFFLGtFQUErRDtBQUsvRCxNQUFxQixzQkFBc0I7SUFpQnpDLFlBQVksSUFBVTtRQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBWEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFVLEVBQUUsYUFBcUI7UUFDbEQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BFO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFTRCxzQ0FBc0M7UUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsbUNBQWdCLENBQUMsa0JBQWtCLEVBQUU7WUFDN0QsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUN4QixVQUFVLEVBQUUsK0JBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUM1QyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhO1NBQ25DLENBQUMsQ0FBQztJQUNMLENBQUM7SUFN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