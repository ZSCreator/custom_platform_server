"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const lotteryUtil_1 = require("../util/lotteryUtil");
class LotteryState {
    constructor(room) {
        this.countdown = 8 * 1000;
        this.stateName = constants_1.RoomState.LOTTERY;
        this.startTime = 0;
        this.room = room;
    }
    init() {
        this.startTime = Date.now();
    }
    ;
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }
    async before() {
        this.init();
        const lotteryUtil = new lotteryUtil_1.LotteryUtil();
        lotteryUtil.setBetAreas(this.room.getBetAreas());
        await this.room.control.runControl(lotteryUtil);
        this.room.setResult(lotteryUtil.getResult())
            .setWinAreas(lotteryUtil.getWinAreas())
            .addOneLotteryResult(lotteryUtil.getResult());
        this.room.routeMsg.startLotteryState();
    }
    async after() {
        await this.room.updateAfterLottery();
        await this.room.changeRoomState(constants_1.RoomState.SETTLEMENT);
    }
}
exports.default = LotteryState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29sb3JQbGF0ZS9saWIvc3RhdGVzL2xvdHRlcnlTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRDQUF1QztBQUN2QyxxREFBZ0Q7QUFLaEQsTUFBcUIsWUFBWTtJQU03QixZQUFZLElBQVU7UUFMYixjQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNyQixjQUFTLEdBQUcscUJBQVMsQ0FBQyxPQUFPLENBQUM7UUFDdkMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUFBLENBQUM7SUFLRixnQkFBZ0I7UUFDWixPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBSVosTUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxFQUFFLENBQUM7UUFHdEMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFHakQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFHaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3ZDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDdEMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFHbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFFUCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVyQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNKO0FBakRELCtCQWlEQyJ9