"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class SettlementState {
    constructor(room) {
        this.countdown = 5 * 1000;
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
        await Promise.all(this.room.getPlayers()
            .filter(p => p.getTotalBet() > 0 && !p.isTaken())
            .map(p => {
            p.addProfit(this.room.getResult(), true);
            return p.settlement(this.room);
        }));
        this.room.routeMsg.startSettlementState();
    }
    async after() {
        await this.room.changeRoomState(constants_1.RoomState.BET);
    }
}
exports.default = SettlementState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGxlbWVudFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ3Jhc2gvbGliL3N0YXRlcy9zZXR0bGVtZW50U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBdUM7QUFLdkMsTUFBcUIsZUFBZTtJQU1oQyxZQUFZLElBQVU7UUFMYixjQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNyQixjQUFTLEdBQUcscUJBQVMsQ0FBQyxVQUFVLENBQUM7UUFDMUMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFLRCxnQkFBZ0I7UUFDWixPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxNQUFNO1FBQ1IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVosSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUduQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7YUFDakIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDTCxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FDVCxDQUFDO1FBR0YsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFFUCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUdKO0FBOUNELGtDQThDQyJ9