"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class SettlementState {
    constructor(room) {
        this.countdown = 9 * 1000;
        this.stateName = constants_1.RoomState.SETTLEMENT;
        this.startTime = 0;
        this.room = room;
    }
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }
    init() {
        this.startTime = Date.now();
    }
    ;
    async before() {
        this.init();
        this.room.endTime = this.startTime;
        for (let [, area] of Object.entries(this.room.getBetAreas())) {
            const lotteryResult = area.getLotteryResult();
            for (let uid in lotteryResult) {
                const player = this.room.getPlayer(uid);
                player.addProfit(lotteryResult[uid]);
            }
        }
        await Promise.all(this.room.getPlayers()
            .filter(p => !!p && p.getTotalBet() > 0)
            .map(p => p.settlement(this.room)));
        this.room.routeMsg.startSettlementState();
    }
    async after() {
        await this.room.changeRoomState(constants_1.RoomState.DEAL);
    }
}
exports.default = SettlementState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGxlbWVudFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYW5kYXJCYWhhci9saWIvc3RhdGVzL3NldHRsZW1lbnRTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRDQUF1QztBQUt2QyxNQUFxQixlQUFlO0lBTWhDLFlBQVksSUFBVTtRQUxiLGNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLGNBQVMsR0FBRyxxQkFBUyxDQUFDLFVBQVUsQ0FBQztRQUMxQyxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBSVYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUtELGdCQUFnQjtRQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUN4RCxDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLE1BQU07UUFDUixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBR25DLEtBQUssSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7WUFFMUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDOUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxhQUFhLEVBQUU7Z0JBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3hDO1NBQ0o7UUFHRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7YUFDakIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3pDLENBQUM7UUFLRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUdQLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBR0o7QUF2REQsa0NBdURDIn0=