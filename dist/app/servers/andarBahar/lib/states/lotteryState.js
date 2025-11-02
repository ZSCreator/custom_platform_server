"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const lotteryUtil_1 = require("../util/lotteryUtil");
class LotteryState {
    constructor(room) {
        this.countdown = 5 * 1000;
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
        lotteryUtil.setSystemCard(this.room.getSystemCard());
        lotteryUtil.setCards(this.room.getCards());
        await this.room.control.runControl(lotteryUtil);
        this.room.setResult(lotteryUtil.getResult())
            .setWinAreas(lotteryUtil.getWinArea())
            .setLotteryOver(lotteryUtil.isOver());
        this.room.routeMsg.startLotteryState(lotteryUtil.isOver() ? constants_1.RoomState.SETTLEMENT : constants_1.RoomState.SECOND_BET);
    }
    async after() {
        this.room.isLotteryOver() ? await this.room.changeRoomState(constants_1.RoomState.SETTLEMENT) :
            await this.room.changeRoomState(constants_1.RoomState.SECOND_BET);
    }
}
exports.default = LotteryState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYW5kYXJCYWhhci9saWIvc3RhdGVzL2xvdHRlcnlTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRDQUF1QztBQUN2QyxxREFBZ0Q7QUFLaEQsTUFBcUIsWUFBWTtJQU03QixZQUFZLElBQVU7UUFMYixjQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNyQixjQUFTLEdBQUcscUJBQVMsQ0FBQyxPQUFPLENBQUM7UUFDdkMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUFBLENBQUM7SUFLRixnQkFBZ0I7UUFDWixPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBR1osTUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxFQUFFLENBQUM7UUFHdEMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFHakQsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFHckQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFHM0MsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFHaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3ZDLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDckMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBTTFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMscUJBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHFCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0csQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBRVAsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDSjtBQXhERCwrQkF3REMifQ==