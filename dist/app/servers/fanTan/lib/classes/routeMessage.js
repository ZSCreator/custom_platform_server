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
    startReadyState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_READY_STATE, {
            playersNumber: this.room.players.length,
            roundId: this.room.roundId,
            countdown: this.room.processState.countdown,
        });
    }
    startBetState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_BET_STATE, {
            countdown: this.room.processState.countdown,
            roundId: this.room.roundId,
        });
        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            countDown: this.room.processState.countdown,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory()
        });
    }
    startLotteryState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_LOTTERY_STATE, {
            result: this.room.getResult(),
            countdown: this.room.processState.countdown,
            doubleAreas: this.room.getDoubleAreas(),
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
            history: this.room.getLotteryHistory()
        });
    }
    playerBet(player, bets) {
        this.room.channelIsPlayer(constants_1.MsgRoute.PLAYER_BET, {
            uid: player.uid,
            bets,
        });
    }
}
exports.default = RouteMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVNZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmFuVGFuL2xpYi9jbGFzc2VzL3JvdXRlTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRDQUF3QztBQU14QyxNQUFxQixZQUFZO0lBRzdCLFlBQVksSUFBVTtRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBS0QsYUFBYTtRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFRLENBQUMsY0FBYyxFQUFFO1lBQy9DLGNBQWMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQzdDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO1NBQzFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFLRCxlQUFlO1FBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQVEsQ0FBQyxpQkFBaUIsRUFBRTtZQUNsRCxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtZQUN2QyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQzFCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1NBQzlDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFLTSxhQUFhO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFRLENBQUMsZUFBZSxFQUFFO1lBQ2hELFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQzNDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87U0FDN0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDekQsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRztZQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07WUFDeEIsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDdkMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7U0FDekMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUtNLGlCQUFpQjtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBUSxDQUFDLG1CQUFtQixFQUFFO1lBQ3BELE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUM3QixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUztZQUMzQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7U0FDMUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUtNLG9CQUFvQjtRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBUSxDQUFDLHNCQUFzQixFQUFFO1lBQ3ZELFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQzNDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNqQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtTQUN6RCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN6RCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQ2xCLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFDMUIsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUN4QixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUztZQUMzQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUztZQUN2QyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtTQUN6QyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBT00sU0FBUyxDQUFDLE1BQWMsRUFBRSxJQUFJO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFFLG9CQUFRLENBQUMsVUFBVSxFQUFFO1lBQzVDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRztZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF6RkQsK0JBeUZDIn0=