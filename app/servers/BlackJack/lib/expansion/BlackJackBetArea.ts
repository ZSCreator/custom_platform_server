import { calculateDot } from "../../../../utils/GameUtil";
/**
 * 下注区域
 */
export class BlackJackBetArea {
    /** 当前下注 */
    private bet: number = 0;

    /** 最高限注 */
    maxBet: number = 1000000;

    /** 倍率 */
    private mulriple: number = 1;

    /** 初始牌 */
    private basePokerList: Array<number> = [];

    /** 初始牌合计 */
    private baseCount: Array<number> = [];

    private canSeparate: boolean = false;

    private hadSeparate: boolean = false;

    /** @property 当前区域发言: 是否新增牌*/
    beAddPokerAction: boolean = false;

    /** @property 当前区域发言: 玩家是否操作过 */
    playerHadAction: boolean = false;

    /** @property 当前区域发言: 玩家是否可继续操作 */
    continueAction: boolean = false;

    /** @property 当前区域发言: 玩家是否操作完毕 */
    actionComplete: boolean = false;

    public getFirstPoker() {
        return this.basePokerList[0];
    }

    public addPoker(poker: number) {
        this.basePokerList.push(poker);
        this.baseCount = calculateDot(this.basePokerList);
    }

    /**
     * 保留一位
     */
    public reserveOnePoker() {
        this.basePokerList = this.basePokerList.slice(0, 1);
        this.baseCount = calculateDot(this.basePokerList);
    }

    /**
     * 保留两位
     */
    public reserveTwoPoker() {
        this.basePokerList = this.basePokerList.slice(0, 2);
        this.baseCount = calculateDot(this.basePokerList);
    }

    /**
     * 获取两张初始牌后剩余的牌
     */
    public getResidualPoker() {
        return this.basePokerList.slice(2);
    }

    public getCount() {
        return Math.max(...this.baseCount);
    }

    /**
     * 检测玩家是否可以下注
     * @param bet 下注金额
     * @description 是否超过最大下注额
     */
    public checkPlayerCanBet(bet: number) {
        if (this.bet + bet > this.maxBet) {
            return false;
        }

        return true;
    }

    /**
     * 下注
     * @param bet 下注金额
     */
    public add(bet: number) {
        /** 首次下注时，初始化操作参数 */
        if (this.bet === 0) {
            this.continueAction = true;
        }

        this.bet += bet;
    }

    /**
     * 获取当前下注额
     */
    public getCurrentBet() {
        return this.bet;
    }

    /**
     * 取出公共区域的牌
     */
    public getPokerList() {
        const {
            basePokerList,
            baseCount
        } = this;

        return {
            basePokerList,
            baseCount
        };
    }



    /**
     * 复制进玩家独立区域
     * @param basePokerList 基础牌
     * @param baseCount     点数
     */
    public setPokerList(basePokerList: Array<number>, baseCount: Array<number>) {
        this.basePokerList = basePokerList;
        this.baseCount = baseCount;
    }

    /**
     * 获取基础牌型和点数
     */
    public getPokerAndCount() {
        return {
            pokerList: this.basePokerList,
            countList: this.baseCount
        };
    }

    /**
     * 结算金额
     * @description 下注额 * 倍率
     */
    public getSettlementAmount() {
        return this.bet * this.mulriple;
    }

    /**
     * 新增倍率
     * @param mulriple 倍率
     */
    public addMulriple(mulriple: number) {
        if (mulriple < 0) {
            throw new Error(`新增倍率必须为正数`);
        }

        this.mulriple += mulriple;
    }

    /**
     * 当前下注区域是否可分牌
     */
    public canPlayerSeparate() {
        const firstPokerCount = calculateDot([this.basePokerList[0]]);
        const secondPokerCount = calculateDot([this.basePokerList[1]]);

        if (firstPokerCount.length === 0 || secondPokerCount.length === 0) {
            return false;
        }
        const canSeparate = Math.max(...firstPokerCount) === Math.max(...secondPokerCount);

        /** 变更当前区域分牌状态 */
        this.setCanSeparate(canSeparate);

        return this.canSeparate;
    }

    /**
     * 设置是否可以分牌
     * @param separate 
     */
    public setCanSeparate(separate: boolean) {
        this.canSeparate = separate;
    }

    /**
     * 检测是否可以分牌操作
     */
    public checkSeparate() {
        return this.canSeparate;
    }

    /**
     * 检测是否已经分过牌
     */
    public checkHadSeparate() {
        return this.hadSeparate;
    }

    public setHadSeparate(separate: boolean) {
        this.hadSeparate = separate;
    }

    constructor(maxBet: number) {
        this.maxBet = maxBet;
    }
}
