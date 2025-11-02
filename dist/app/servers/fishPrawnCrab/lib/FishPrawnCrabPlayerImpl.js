"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FishPrawnCrabPlayerImpl = void 0;
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const mailModule = require("../../../modules/mailModule");
class FishPrawnCrabPlayerImpl extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.bets = {};
        this.betResult = [];
        this.lastGain = 0;
        this.bet = 0;
        this.standbyRounds = 0;
        this.profit = 0;
        this.bets = {};
        this.betResult = [];
        this.recordBets = {};
        this.recordBetsRemark = {};
        this.profit = 0;
        this.lastGain = 0;
        this.bet = 0;
        this.standbyRounds = 0;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
    }
    async initGame() {
        this.initControlType();
        this.bets = {};
        this.profit = 0;
        if (Object.keys(this.recordBets).length != 0) {
            this.recordBetsRemark = {};
        }
        Object.assign(this.recordBetsRemark, this.recordBets);
        this.recordBets = {};
        this.betResult = [];
        this.bet = 0;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
    }
    lastSumBetNum() {
        let num = 0;
        for (let key in this.recordBetsRemark) {
            num += this.recordBetsRemark[key];
        }
        return num;
    }
    settlement(winAreaOdds) {
        for (let area in this.bets) {
            let item = winAreaOdds.find(x => x.name == area);
            if (item) {
                this.profit += this.bets[area] * item.odds;
                this.betResult.push({
                    area: area,
                    bet: this.bets[area],
                    profit: this.bets[area] * item.odds,
                    odds: item.odds
                });
            }
            else {
                this.betResult.push({
                    area: area,
                    bet: this.bets[area],
                    profit: 0,
                    odds: 0
                });
            }
        }
    }
    calculateProfit(winAreaOdds) {
        let profit = 0;
        for (let area in this.bets) {
            let item = winAreaOdds.find(x => x.name == area);
            if (item) {
                profit += this.bets[area] * item.odds - this.bets[area];
            }
            else {
                profit -= this.bets[area];
            }
        }
        return profit;
    }
    toSettlementInfoByMail() {
        const content = `由于断线/退出游戏。您在[鱼虾蟹]游戏中押注:${this.bet / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${this.profit / 100}`;
        mailModule.changeGoldsByMail2({ uid: this.uid, content });
    }
    checkOverrunBet(condition) {
        const overrunBets = {};
        for (let key in this.bets) {
            if (this.bets[key] >= condition) {
                overrunBets[key] = this.bets[key];
            }
        }
        return overrunBets;
    }
    result() {
        return {
            uid: this.uid,
            gold: this.gold,
            bet: this.bet,
            profit: this.profit,
            bets: this.bets,
            nickname: this.nickname,
            headurl: this.headurl,
        };
    }
    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            bet: this.bet,
            isRobot: this.isRobot,
        };
    }
}
exports.FishPrawnCrabPlayerImpl = FishPrawnCrabPlayerImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlzaFByYXduQ3JhYlBsYXllckltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9maXNoUHJhd25DcmFiL2xpYi9GaXNoUHJhd25DcmFiUGxheWVySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1RUFBb0U7QUFDcEUsa0ZBQXNGO0FBQ3RGLDBEQUEwRDtBQUUxRCxNQUFhLHVCQUF3QixTQUFRLHVCQUFVO0lBbUJuRCxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBbEJoQixTQUFJLEdBQU8sRUFBRSxDQUFDO1FBRWQsY0FBUyxHQUFRLEVBQUUsQ0FBQztRQU1wQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFFaEIsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFFbEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUtmLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNiLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsZ0NBQWtCLENBQUMsTUFBTSxDQUFDO0lBQ2xELENBQUM7SUFHRCxLQUFLLENBQUMsUUFBUTtRQUNWLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFN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