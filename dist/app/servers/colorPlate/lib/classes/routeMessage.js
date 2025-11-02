"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class RouteMessage {
    constructor(room) {
        this.room = room;
    }
    playersChange() {
        this.room.channelIsPlayer(constants_1.MsgRoute.PLAYERS_CHANGE, {
            displayPlayers: this.room.getDisplayPlayers(),
            playersNumber: this.room.players.length,
        });
    }
    startBetState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_BET_STATE, {
            roundId: this.room.roundId,
            countdown: this.room.processState.countdown,
        });
        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            countDown: this.room.processState.countdown,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        });
    }
    startLotteryState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_LOTTERY_STATE, {
            result: this.room.getResult(),
            countdown: this.room.processState.countdown,
        });
        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            countDown: this.room.processState.countdown,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        });
    }
    startSettlementState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_SETTLEMENT_STATE, {
            countdown: this.room.processState.countdown,
            winAreas: this.room.getWinAreas(),
            gamePlayers: this.room.getGamePlayerSettlementResult(),
        });
        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            countDown: this.room.processState.countdown,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        });
    }
    playerBet(player, bets) {
        this.room.channelIsPlayer(constants_1.MsgRoute.PLAYER_BET, {
            uid: player.uid,
            bets,
            displayPlayers: this.room.getDisplayPlayers()
        });
    }
}
exports.default = RouteMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVNZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29sb3JQbGF0ZS9saWIvY2xhc3Nlcy9yb3V0ZU1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBd0M7QUFNeEMsTUFBcUIsWUFBWTtJQUc3QixZQUFZLElBQVU7UUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUtELGFBQWE7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBUSxDQUFDLGNBQWMsRUFBRTtZQUMvQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUM3QyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtTQUMxQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBS00sYUFBYTtRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBUSxDQUFDLGVBQWUsRUFBRTtZQUNoRCxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQzFCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1NBQzlDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3pELEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUMxQixNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQ3hCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQzNDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFB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