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
        await this.room.changeRoomState(constants_1.RoomState.READY);
    }
}
exports.default = SettlementState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGxlbWVudFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmFuVGFuL2xpYi9zdGF0ZXMvc2V0dGxlbWVudFN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsNENBQXVDO0FBS3ZDLE1BQXFCLGVBQWU7SUFNaEMsWUFBWSxJQUFVO1FBTGIsY0FBUyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDckIsY0FBUyxHQUFHLHFCQUFTLENBQUMsVUFBVSxDQUFDO1FBQzFDLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFJVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBS0QsZ0JBQWdCO1FBQ1osT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsTUFBTTtRQUNSLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdaLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTtZQUVsRSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM5QyxLQUFLLElBQUksR0FBRyxJQUFJLGFBQWEsRUFBRTtnQkFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDeEM7U0FDSjtRQUdELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTthQUNqQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3pDLENBQUM7UUFHRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUVQLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUdqQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckQsQ0FBQztDQUdKO0FBdERELGtDQXNEQyJ9