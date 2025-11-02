"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const mailModule = require("../../../modules/mailModule");
const RummyConst = require("./RummyConst");
class RummyPlayerImpl extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.playerSet = 0;
        this.cards = [];
        this.cardsList = [];
        this.profit = 0;
        this.point = 0;
        this.gropPoint = 0;
        this.isGetCard = false;
        this.needCards = [];
        this.profit = 0;
        this.cards = [];
        this.cardsList = [];
        this.point = RummyConst.PLAYER_POINT.VALUE;
        this.gropPoint = 0;
        this.playerSet = opts.playerSet;
        this.isGetCard = false;
        this.getCard = null;
        this.playerReady = opts.playerReady;
        this.needCards = [];
    }
    async initGame(lowBet) {
        this.profit = 0;
        this.gropPoint = lowBet * RummyConst.PLAYER_LOSE.ONE * RummyConst.PLAYER_POINT.VALUE;
        this.point = RummyConst.PLAYER_POINT.VALUE;
        this.getCard = null;
        this.isGetCard = false;
        this.isLose = false;
        this.needCards = [];
        this.initControlType();
    }
    settlement(winAreaOdds) {
    }
    resetOnlineState() {
        this.onLine = true;
    }
    calculateProfit(winAreaOdds) {
        return 0;
    }
    toSettlementInfoByMail() {
        const content = `由于断线/退出游戏。您在[Rummy]游戏中押注:${0 / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${this.profit / 100}`;
        mailModule.changeGoldsByMail2({ uid: this.uid, content });
    }
    result() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            nickname: this.nickname,
            headurl: this.headurl,
            cardsList: this.cardsList,
            cards: this.cards,
            playerSet: this.playerSet,
            point: this.point,
            getCard: this.getCard,
            isGetCard: this.isGetCard,
            gropPoint: this.gropPoint,
        };
    }
    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            isRobot: this.isRobot,
            playerSet: this.playerSet,
            point: this.point,
        };
    }
}
exports.default = RummyPlayerImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVtbXlQbGF5ZXJJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvUnVtbXkvbGliL1J1bW15UGxheWVySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFvRTtBQUVwRSwwREFBMEQ7QUFDMUQsMkNBQTJDO0FBRTNDLE1BQXFCLGVBQWdCLFNBQVEsdUJBQVU7SUF3Qm5ELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUF2QmhCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUVyQixjQUFTLEdBQXFELEVBQUUsQ0FBQztRQUVqRSxXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLFVBQUssR0FBVyxDQUFDLENBQUM7UUFFbEIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUV0QixjQUFTLEdBQVksS0FBSyxDQUFDO1FBUzNCLGNBQVMsR0FBYSxFQUFFLENBQUM7UUFHckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUMzQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBU3hCLENBQUM7SUFJRCxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQWM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFDckYsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQTtRQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUtELFVBQVUsQ0FBQyxXQUE2QztJQUV4RCxDQUFDO0lBS0QsZ0JBQWdCO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQU1ELGVBQWUsQ0FBQyxXQUE2QztRQUV6RCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFLRCxzQkFBc0I7UUFDbEIsTUFBTSxPQUFPLEdBQUcsNEJBQTRCLENBQUMsR0FBRyxHQUFHLDZCQUE2QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3BHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUtELE1BQU07UUFDRixPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQzVCLENBQUM7SUFDTixDQUFDO0lBR0QsS0FBSztRQUNELE9BQU87WUFDSCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2xDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ3BCLENBQUM7SUFDTixDQUFDO0NBQ0o7QUExSEQsa0NBMEhDIn0=