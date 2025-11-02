"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const lotteryUtil_1 = require("../util/lotteryUtil");
const betAreas_1 = require("../config/betAreas");
class SecondLotteryState {
    constructor(room) {
        this.countdown = 0;
        this.stateName = constants_1.RoomState.SECOND_LOTTERY;
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
        lotteryUtil.setSecond();
        await this.room.control.runControl(lotteryUtil);
        const result = lotteryUtil.getResult();
        this.room.setResult(result)
            .setWinAreas(lotteryUtil.getWinArea());
        this.countdown = (result[betAreas_1.BetAreasName.ANDAR].length + result[betAreas_1.BetAreasName.BAHAR].length) * 200 + 2000;
        this.room.routeMsg.startSecondLotteryState();
    }
    async after() {
        await this.room.changeRoomState(constants_1.RoomState.SETTLEMENT);
    }
}
exports.default = SecondLotteryState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vjb25kTG90dGVyeVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYW5kYXJCYWhhci9saWIvc3RhdGVzL3NlY29uZExvdHRlcnlTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRDQUF1QztBQUN2QyxxREFBZ0Q7QUFDaEQsaURBQWdEO0FBS2hELE1BQXFCLGtCQUFrQjtJQU1uQyxZQUFZLElBQVU7UUFMZixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ1osY0FBUyxHQUFHLHFCQUFTLENBQUMsY0FBYyxDQUFDO1FBQzlDLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFJVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFBQSxDQUFDO0lBS0YsZ0JBQWdCO1FBQ1osT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNSLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdaLE1BQU0sV0FBVyxHQUFHLElBQUkseUJBQVcsRUFBRSxDQUFDO1FBR3RDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBR2pELFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBR3JELFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRzNDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUd4QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQU1oRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO2FBQ3RCLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUszQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyx1QkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFJdEcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFFUCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNKO0FBakVELHFDQWlFQyJ9