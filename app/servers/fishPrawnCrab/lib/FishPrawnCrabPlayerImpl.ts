import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import * as mailModule from '../../../modules/mailModule';
/**一个玩家 */
export class FishPrawnCrabPlayerImpl extends PlayerInfo {
    /**玩家押注 */
    bets: {} = {};
    /**玩家押注以及中将结果 */
    betResult: any = [];
    /**记录需押 */
    recordBets: {};
    /**中转需押 */
    recordBetsRemark: {};
    /**最后一次的收益 */
    lastGain: number = 0;
    /**当局下注 */
    bet: number = 0;
    /**待机轮数 */
    standbyRounds = 0;
    /**该局盈利 */
    profit: number = 0;
    // 调控状态
    controlState: CommonControlState;
    constructor(opts: any) {
        super(opts);
        this.bets = {};   //{'XL': 0}
        this.betResult = [];
        this.recordBets = {};// 记录下注 {'HL': 0}
        this.recordBetsRemark = {};// 记录下注 {'HL': 0}
        this.profit = 0;// 当前总收益
        this.lastGain = 0;// 最后一次的收益
        this.bet = 0;
        this.standbyRounds = 0;
        this.controlState = CommonControlState.RANDOM;  // 随机
    }

    /**初始游戏信息 */
    async initGame() {
        this.initControlType();
        this.bets = {};
        this.profit = 0;// 当前收益
        if (Object.keys(this.recordBets).length != 0) {
            this.recordBetsRemark = {};
        }
        Object.assign(this.recordBetsRemark, this.recordBets);
        this.recordBets = {};
        this.betResult = [];
        this.bet = 0;
        this.controlState = CommonControlState.RANDOM;  // 随机

    }


    /**最后一次押注 */
    lastSumBetNum() {
        let num = 0;
        for (let key in this.recordBetsRemark) {
            num += this.recordBetsRemark[key];
        }
        return num;
    }


    /**结算 */
    settlement(winAreaOdds: { name: string, odds: number }[]) {
        for (let area in this.bets) {
            let item = winAreaOdds.find(x => x.name == area);
            if (item) {
                this.profit += this.bets[area] * item.odds;
                this.betResult.push({
                    area: area,
                    bet: this.bets[area],
                    profit: this.bets[area] * item.odds,
                    odds: item.odds
                })

            } else {
                this.betResult.push({
                    area: area,
                    bet: this.bets[area],
                    profit: 0,
                    odds: 0
                })
            }
        }
    }

    /**
     * 计算纯利润
     * @param winAreaOdds
     */
    calculateProfit(winAreaOdds: { name: string, odds: number }[]): number {
        let profit = 0;
        for (let area in this.bets) {
            let item = winAreaOdds.find(x => x.name == area);
            if (item) {
                profit += this.bets[area] * item.odds - this.bets[area];
            } else {
                profit -= this.bets[area];
            }
        }

        return profit;
    }

    /**
     * 结算信息 - 参与发送邮件
     */
    toSettlementInfoByMail() {
        const content = `由于断线/退出游戏。您在[鱼虾蟹]游戏中押注:${this.bet / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${this.profit / 100}`;
        mailModule.changeGoldsByMail2({ uid: this.uid, content })
    }

    /**
     * 是否必杀
     * @param condition
     */
    checkOverrunBet(condition: number) {
        const overrunBets = {};

        for (let key in this.bets) {
            if (this.bets[key] >= condition) {
                overrunBets[key] = this.bets[key];
            }
        }

        return overrunBets;
    }

    /**
     * 返回给前端
     */
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
