"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const MessageService_1 = require("../../../../services/MessageService");
class RouteMessage {
    constructor(room) {
        this.room = room;
    }
    playersChange() {
        this.room.channelIsPlayer(constants_1.MsgRoute.PLAYERS_CHANGE, {
            players: this.room.getFrontDisplayPlayers(),
        });
    }
    playersGoOut(player) {
        const member = this.room.channel.getMember(player.uid);
        if (member) {
            (0, MessageService_1.pushMessageByUids)(constants_1.MsgRoute.GO_OUT, {}, member);
        }
    }
    startDealState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_DEAL_STATE, {
            countdown: this.room.processState.countdown,
            systemCard: this.room.getSystemCard(),
            roundId: this.room.roundId,
        });
    }
    startBetState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_BET_STATE, {
            countdown: this.room.processState.countdown,
        });
    }
    startSecondBetState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_SECOND_BET_STATE, {
            countdown: this.room.processState.countdown,
            systemCard: this.room.getSystemCard(),
        });
    }
    startLotteryState(nextState) {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_LOTTERY_STATE, {
            result: this.room.getResult(),
            countdown: this.room.processState.countdown,
            nextState,
        });
    }
    startSecondLotteryState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_SECOND_LOTTERY_STATE, {
            result: this.room.getResult(),
            countdown: this.room.processState.countdown,
            players: this.room.getFrontDisplayPlayers(),
        });
    }
    startSettlementState() {
        this.room.channelIsPlayer(constants_1.MsgRoute.START_SETTLEMENT_STATE, {
            countdown: this.room.processState.countdown,
            winAreas: this.room.getWinArea(),
            gamePlayers: this.room.getGamePlayerSettlementResult(),
        });
    }
    playerBet(player, bets) {
        this.room.channelIsPlayer(constants_1.MsgRoute.PLAYER_BET, {
            uid: player.uid,
            bets,
        });
    }
    playerSkip(player) {
        this.room.channelIsPlayer(constants_1.MsgRoute.PLAYER_SKIP, {
            uid: player.uid,
        });
    }
}
exports.default = RouteMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVNZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYW5kYXJCYWhhci9saWIvY2xhc3Nlcy9yb3V0ZU1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBaUQ7QUFDakQsd0VBQXNFO0FBTXRFLE1BQXFCLFlBQVk7SUFHN0IsWUFBWSxJQUFVO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFLRCxhQUFhO1FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQVEsQ0FBQyxjQUFjLEVBQUU7WUFDL0MsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7U0FDOUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUtELFlBQVksQ0FBQyxNQUFjO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkQsSUFBSSxNQUFNLEVBQUU7WUFDUixJQUFBLGtDQUFpQixFQUFDLG9CQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNsRDtJQUNMLENBQUM7SUFLTSxjQUFjO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFRLENBQUMsZ0JBQWdCLEVBQUU7WUFDakQsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDM0MsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87U0FDN0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUtNLGFBQWE7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQVEsQ0FBQyxlQUFlLEVBQUU7WUFDaEQsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7U0FDOUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUtNLG1CQUFtQjtRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBUSxDQUFDLHNCQUFzQixFQUFFO1lBQ3ZELFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQzNDLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtTQUN4QyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBS00saUJBQWlCLENBQUMsU0FBb0I7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQVEsQ0FBQyxtQkFBbUIsRUFBRTtZQUNwRCxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDN0IsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDM0MsU0FBUztTQUNaLENBQUMsQ0FBQztJQUNQLENBQUM7SUFLTSx1QkFBdUI7UUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQVEsQ0FBQywwQkFBMEIsRUFBRTtZQUMzRCxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDN0IsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDM0MsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7U0FDOUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUtNLG9CQUFvQjtRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBUSxDQUFDLHNCQUFzQixFQUFFO1lBQ3ZELFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQzNDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNoQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtTQUN6RCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBT00sU0FBUyxDQUFDLE1BQWMsRUFBRSxJQUFJO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFFLG9CQUFRLENBQUMsVUFBVSxFQUFFO1lBQzVDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRztZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBTU0sVUFBVSxDQUFDLE1BQWM7UUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUUsb0JBQVEsQ0FBQyxXQUFXLEVBQUU7WUFDN0MsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQS9HRCwrQkErR0MifQ==