"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class RouteMessage {
    constructor(room) {
        this.room = room;
    }
    playersChange() {
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
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        });
    }
    startLotteryState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_LOTTERY_STATE, {
            boom: this.room.isExplodeImmediately(),
        });
        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        });
    }
    startSettlementState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_SETTLEMENT_STATE, {
            countdown: this.room.processState.countdown,
            result: this.room.getResult(),
            flyTime: this.room.getFlyTime(),
            players: this.room.getGamePlayerSettlementResult(),
        });
    }
    takeProfit(player) {
        this.room.channelIsPlayer(constants_1.MsgRoute.TOOK_PROFIT, player.settlementResult());
    }
    playerBet(player, num) {
    }
}
exports.default = RouteMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVNZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ3Jhc2gvbGliL2NsYXNzZXMvcm91dGVNZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsNENBQXdDO0FBTXhDLE1BQXFCLFlBQVk7SUFHN0IsWUFBWSxJQUFVO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFLRCxhQUFhO0lBQ2IsQ0FBQztJQUtNLGFBQWE7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQVEsQ0FBQyxlQUFlLEVBQUU7WUFDaEQsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUMxQixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUztTQUM5QyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN6RCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQ2xCLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFDMUIsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUV4QixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUztZQUN2QyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7U0FDN0MsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUtNLGlCQUFpQjtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBUSxDQUFDLG1CQUFtQixFQUFFO1lBRXBELElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1NBQ3pDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3pELEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUMxQixNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO1lBRXhCLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztTQUM3QyxDQUFDLENBQUE7SUFDTixDQUFDO0lBS00sb0JBQW9CO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFRLENBQUMsc0JBQXNCLEVBQUU7WUFDdkQsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDM0MsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUMvQixPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtTQUNyRCxDQUFDLENBQUM7SUFVUCxDQUFDO0lBTUQsVUFBVSxDQUFDLE1BQWM7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQVEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBT00sU0FBUyxDQUFDLE1BQWMsRUFBRSxHQUFHO0lBRXBDLENBQUM7Q0FDSjtBQXhGRCwrQkF3RkMifQ==