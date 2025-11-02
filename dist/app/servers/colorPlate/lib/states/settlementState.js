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
        for (let [areaName, area] of Object.entries(this.room.getBetAreas())) {
            const lotteryResult = area.getLotteryResult();
            for (let uid in lotteryResult) {
                const player = this.room.getPlayer(uid);
                player.addProfit(lotteryResult[uid]);
            }
        }
        await Promise.all(this.room.getPlayers()
            .filter(p => p.getTotalBet() > 0)
            .map(p => p.settlement(this.room)));
        this.room.routeMsg.startSettlementState();
    }
    async after() {
        this.room.updateDisplayPlayers();
        await this.room.changeRoomState(constants_1.RoomState.BET);
    }
}
exports.default = SettlementState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGxlbWVudFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29sb3JQbGF0ZS9saWIvc3RhdGVzL3NldHRsZW1lbnRTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRDQUF1QztBQUt2QyxNQUFxQixlQUFlO0lBTWhDLFlBQVksSUFBVTtRQUxiLGNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLGNBQVMsR0FBRyxxQkFBUyxDQUFDLFVBQVUsQ0FBQztRQUMxQyxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBSVYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUtELGdCQUFnQjtRQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUN4RCxDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLE1BQU07UUFDUixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFWixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBR25DLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTtZQUVsRSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM5QyxLQUFLLElBQUksR0FBRyxJQUFJLGFBQWEsRUFBRTtnQkFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDeEM7U0FDSjtRQUdELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTthQUNqQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3pDLENBQUM7UUFHRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUVQLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUdqQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUdKO0FBeERELGtDQXdEQyJ9