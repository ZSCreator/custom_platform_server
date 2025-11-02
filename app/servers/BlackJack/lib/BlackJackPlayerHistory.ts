import { BlackJackBetArea } from "./expansion/BlackJackBetArea";

/**
 * @name 玩家对局历史记录
 */
export class BlackJackPlayerHistory {

    /** @property 下注金额 */
    private betAreaList: Array<number> = [0, 0, 0];

    /** @property 分牌金额 */
    private separateBetAreaList: Array<number> = [0, 0, 0];

    /** @property 总金额 */
    private betTotal = 0;

    /** @property 基础区域手牌 */
    private pokerList: Array<Array<number>> = [[], [], []];

    /** @property 合计点数 */
    private pokerCountList: Array<number> = [0, 0, 0];

    /** @property 分牌区域手牌 */
    private separatePokerList: Array<Array<number>> = [[], [], []];

    /** @property 分牌区域合计点数 */
    private separatePokerCountList: Array<number> = [0, 0, 0];

    /** @property 庄家手牌 */
    private dealerPokerList: Array<number> = [];

    /** @property 庄家合计点数 */
    private dealerPokerCount: number = 0;

    setBetAreaList(betAreaList: Array<BlackJackBetArea>) {
        for (let idx = 0; idx < betAreaList.length; idx++) {
            const betArea = betAreaList[idx];

            // 下注金额
            this.betAreaList[idx] = betArea.getCurrentBet();

            // 牌型和点数
            const { pokerList, countList } = betArea.getPokerAndCount();
            this.pokerList[idx] = pokerList;
            this.pokerCountList[idx] = countList[0];
        }

        return this;
    }

    setSeparateBetAreaList(betAreaList: Array<BlackJackBetArea>) {
        for (let idx = 0; idx < betAreaList.length; idx++) {
            const betArea = betAreaList[idx];

            // 下注金额
            this.separateBetAreaList[idx] = betArea.getCurrentBet();

            // 牌型和点数
            const { pokerList, countList } = betArea.getPokerAndCount();
            this.separatePokerList[idx] = pokerList;
            this.separatePokerCountList[idx] = countList[0] || 0;
        }

        return this;
    }

    setBetTotal(bet: number) {
        this.betTotal = bet;

        return this;
    }

    setDealerArea({ pokerList, countList }) {
        // 牌型和点数
        this.dealerPokerList = pokerList;
        this.dealerPokerCount = countList[0];

        return this;
    }
}
