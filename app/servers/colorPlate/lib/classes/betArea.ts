/**
 * 下注区域
 * @property areaName 区域名字 中文名
 * @property odds 区域赔率
 * @property totalBet 总押注
 * @property playersBet 单个玩家押注详情
 * @property isWin 这个区域是否赢 默认为输
 * @property lotteryResult 区域的开奖结果
 * @property totalProfit 区域收益
 * @property limit 区域押注上限
 */
export default class BetArea {
    readonly name: string;
    readonly odds: number;
    private totalBet: number = 0;
    private playersBet: {[uid: string]: number} = {};
    private isWin: boolean = false;
    private lotteryResult: {[uid: string]: number} = {};
    private totalProfit: number = 0;
    private readonly limit: number = 0;

    constructor({name, odds, limit}: {name: string, odds: number, limit: number}) {
        this.name = name;
        this.odds = odds;
        this.limit = limit;
    }

    init() {
        this.totalBet = 0;
        this.playersBet = {};
        this.lotteryResult = {};
        this.isWin = false;
        this.totalProfit = 0;
    }

    /**
     * 获取一个玩家在这个区域的押注
     * @param uid
     */
    getPlayerBet(uid: string) {
        return !!this.playersBet[uid] ? this.playersBet[uid] : 0;
    }


    /**
     * 检查下注金额是否超限
     * @param num
     */
    isOverrun(num: number) {
        return this.totalBet + num > this.limit;
    }

    /**
     * 添加押注
     * @param uid 玩家id
     * @param num 押注额
     */
    addPlayerBet(uid: string, num: number) {
        if (!this.playersBet[uid]) {
            this.playersBet[uid] = 0;
        }

        this.playersBet[uid] += num;

        this.totalBet += num;

        return this.playersBet[uid];
    }

    /**
     * 设置这个区域赢的结构
     */
    setWin() {
        this.isWin = true;
    }

    /**
     * 获取这个区域是否赢
     */
    getIsWin() {
        return this.isWin;
    }

    /**
     * 获取押注和盈利
     * @param uid
     */
    getPlayerBetAndWin(uid: string): {bet: number, win: number} | null {
        if (this.playersBet[uid]) {
            return {
                bet: this.playersBet[uid],
                win: this.lotteryResult[uid],
            }
        }

        return null;
    }

    /**
     * 设置输的结果
     */
    setLossResult() {
        for (let uid in this.playersBet) {
            this.lotteryResult[uid] = -this.playersBet[uid];
            this.totalBet += this.lotteryResult[uid];
        }
    }

    /**
     * 获取单个玩家的收益
     * @param uid
     */
    getPlayerProfit(uid: string): number {
        return !this.lotteryResult[uid] ? 0 : this.lotteryResult[uid];
    }

    /**
     * 设置赢的结果
     */
    setWinResult() {
        this.setWin();

        this.lotteryResult = {};
        this.totalProfit = 0;

        for (let uid in this.playersBet) {
            // 纯利润 = 押注 * 赔率 - 押注
            this.lotteryResult[uid] = this.playersBet[uid] * this.odds - this.playersBet[uid];
            this.totalProfit += this.lotteryResult[uid];
        }
    }

    /**
     * 获取开奖结果
     */
    getLotteryResult() {
        return this.lotteryResult;
    }

    /**
     * 获取这个区域的总收益
     */
    getTotalProfit() {
        return this.totalProfit;
    }

    /**
     * 获取开奖结果
     */
    getTotalBet() {
        return this.totalBet;
    }
}