import { PlayerInfo } from "../../../common/pojo/entity/PlayerInfo";
import { BlackJackPlayerStatusEnum } from "./enum/BlackJackPlayerStatusEnum";
import { BlackJackPlayerRoleEnum } from "./enum/BlackJackPlayerRoleEnum";
import { BlackJackBetArea } from "./expansion/BlackJackBetArea";
import { BlackJackPlayerInsuranceArea } from "./expansion/playerExpansion/BlackJackPlayerInsuranceArea";
import { IBlackJackAction } from "./interface/IBlackJackAction";

export class BlackJackPlayerImpl extends PlayerInfo {

    /** @property 玩家身份 */
    role: BlackJackPlayerRoleEnum;

    /** @property 玩家状态 */
    status: BlackJackPlayerStatusEnum = BlackJackPlayerStatusEnum.None;

    /** @property 玩家座位号 */
    seatNum: number = 0;

    /** @property 总下注: 公共区域 */
    totalBet: number = 0;

    /** @property 总胜场 */
    winRound: number = 0;

    /** @property 每局盈利 */
    profitQueue: Array<number> = [];

    /** @property 玩家独立区域 */
    commonAreaBetList: Array<BlackJackBetArea> = [];

    /** @property 是否购买过保险 */
    hadBuyInsurance: boolean = false;

    /** @property 保险区域 */
    insuranceAreaList: Array<BlackJackPlayerInsuranceArea> = [];

    /** @property 是否可分牌 */
    canSeparate: boolean = false;

    /** @property 是否已分牌 */
    hadSeparate: boolean = false;

    /** @property 分牌区域 */
    separateAreaBetList: Array<BlackJackBetArea> = [];

    /** @property 是否可以操作 */
    canAction: boolean = false;

    /** @property 可操作行为集合 */
    actionList: IBlackJackAction;

    /** @property 下注历史记录(上一次),用于续压 */
    betHistory: Array<number> = [0, 0, 0];
    /**5局为下注需要进行剔除房间 */
    standbyRounds: number;
    constructor(opts: any) {
        super(opts);

        const { role, seatNum } = opts;

        this.role = role || BlackJackPlayerRoleEnum.Player;

        this.seatNum = seatNum || 1;
        this.standbyRounds = 0;
        this.commonAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));

        this.separateAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));

        this.insuranceAreaList = Array.from({ length: 3 }).map(() => new BlackJackPlayerInsuranceArea());

        this.actionList = {
            multiple: true,
            continueBet: false,
            insurance: false,
            separate: false
        };
    }

    /**
     * 初始化玩家运行数据
     */
    public initRunData() {

        this.status = BlackJackPlayerStatusEnum.Ready;

        this.totalBet = 0;

        this.commonAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));

        this.insuranceAreaList = Array.from({ length: 3 }).map(() => new BlackJackPlayerInsuranceArea());

        this.hadBuyInsurance = false;

        this.canSeparate = false;

        this.hadSeparate = false;

        this.separateAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));

        this.actionList.multiple = true;

        this.actionList.insurance = false;

        this.actionList.separate = false;

        this.initControlType();
    }

    /**
     * 获取玩家当前金币
     * @description 游戏过程花费的金币，待结算时才更新
     */
    public getCurrentGold(): number {
        // 公共区域: 金额
        const commonBet = this.commonAreaBetList.reduce((totalBet, area) => totalBet += area.getCurrentBet(), 0);

        // 分牌区域: 分牌金额
        const separateBet = this.separateAreaBetList.reduce((totalBet, area) => totalBet += area.getCurrentBet(), 0);

        // 保险区域: 保险金额
        const insuranceBet = this.insuranceAreaList.reduce((totalBet, area) => {
            if (area.checkBuyInsurance()) {
                totalBet += area.getBet();
            }

            return totalBet;
        }, 0);

        return this.gold - commonBet - separateBet - insuranceBet;
    }

    /**
     * 判断玩家携带金额是否满足继续下注
     * @param bet 下注金额
     */
    public checkPlayerCanBet(bet: number) {
        if (this.totalBet + bet > this.gold / 2) {
            return false;
        }

        return true;
    }

    /**
     * 获取当前总下注额
     */
    public getCurrentTotalBet(): number {
        return this.totalBet;
    }

    /**
     * 玩家下注
     * @param areaIdx 下注区域
     * @param bet 下注金额
     */
    public bet(areaIdx: number, bet: number) {
        this.commonAreaBetList[areaIdx].add(bet);

        this.totalBet += bet;

        this.betHistory[areaIdx] += bet;
    }

    /**
     * 玩家加倍
     * @param areaIdx 下注区域
     * @param bet 下注金额
     */
    public multiple(areaIdx: number, bet: number) {
        this.commonAreaBetList[areaIdx].add(bet);

        this.totalBet += bet;
    }

    /**
     * 玩家续押
     * @param areaIdx 下注区域
     * @param bet 下注金额
     */
    public continueBet(areaIdx: number, bet: number) {
        this.commonAreaBetList[areaIdx].add(bet);

        this.totalBet += bet;

    }

    /**
     * 购买保险
     * @param areaIdx 下注区域
     */
    public insurance(areaIdx: number) {

        /** 首次购买时,复制各区域的下注额 */
        if (!this.hadBuyInsurance) {
            this.hadBuyInsurance = true;

            this.commonAreaBetList.map((area, i) => {
                const bet = area.getCurrentBet();
                this.insuranceAreaList[i].setBet(bet);
            });
        }

        /** 购买指定区域保险 */
        this.insuranceAreaList[areaIdx].buyInsurance();
    }

    /**
     * 分牌
     * @param areaIdx 分牌区域
     */
    public separate(areaIdx: number) {

        // 以防多次分牌导致多次初始化
        if (!this.hadSeparate) {

            this.hadSeparate = true;

        }

        const commonPokerList = this.commonAreaBetList.map(area => area.getPokerList());

        this.separateAreaBetList.forEach((area, idx) => {

            if (areaIdx === idx) {

                const { basePokerList } = commonPokerList[idx];

                area.addPoker(basePokerList[1]);
            }
        });

        // 变更当前区域分牌状态
        this.commonAreaBetList[areaIdx].setHadSeparate(true);

        // 避免重复累加下注额
        if (this.commonAreaBetList[areaIdx].checkHadSeparate()) {

            // 获取当前区域下注金额
            const bet = this.commonAreaBetList[areaIdx].getCurrentBet();

            // 累计下注
            this.totalBet += bet;

            // 当前区域下注金额复制进分牌区域
            this.separateAreaBetList[areaIdx].add(bet);

            this.separateAreaBetList[areaIdx].setHadSeparate(true);
        }

    }

    public actionDone(areaIdx: number, isSeparate: boolean = false) {

        if (isSeparate) {
            this.separateAreaBetList[areaIdx].playerHadAction = true;
            this.separateAreaBetList[areaIdx].continueAction = true;
            this.separateAreaBetList[areaIdx].actionComplete = false;
            return;
        }

        this.commonAreaBetList[areaIdx].playerHadAction = true;
        this.commonAreaBetList[areaIdx].continueAction = true;
        this.commonAreaBetList[areaIdx].actionComplete = true;

    }

    public playerHadLeave() {
        this.commonAreaBetList = null;
        this.insuranceAreaList = null;
        this.separateAreaBetList = null;
    }

    /**
     * 预结算
     * @param dealerPokerList 庄家牌
     * @param dealerCountList 庄家手牌点数
     * @param beInsuranceToSettlement 是否从保险阶段直达结算
     * @return {number}
     * @description 计算当前收益
     */
    public presettlement(dealerPokerList: Array<number>, dealerCountList: Array<number>, beInsuranceToSettlement: boolean = false): number {

        let { bet, win, hadSeparate } = this.commonAreaBetList.reduce((result, area, areaIdx) => {
            const {
                countList,
                pokerList
            } = area.getPokerAndCount();

            if (pokerList.length === 0) {
                return result;
            }

            // 检测玩家是否有分牌
            if (area.checkHadSeparate()) {
                result.hadSeparate = true;
            }

            // 闲家手牌是否 BlackJack
            const playerIsBlackJack = countList.some(count => count === 21);

            result.bet += area.getCurrentBet();

            /** | 保险阶段 | 闲家:是否购买保险 */
            if (this.hadBuyInsurance) {
                // 保险⾦额是下注的⼀半且不退
                result.bet += this.insuranceAreaList[areaIdx].getBet();
            }

            /** 特殊: 保险阶段直接跳结算 */
            if (beInsuranceToSettlement) {
                result.bet += (area.getCurrentBet() * 0.5);

                /** 若购买过保险，则返还下注阶段下注额 */
                if (this.hadBuyInsurance) {
                    result.win += area.getCurrentBet();
                    return result;
                }

                /** 平局 */
                if (playerIsBlackJack) {
                    result.win += area.getCurrentBet();
                    return result;
                }

                /** defalut: 输 */
                return result;
            }

            /** 正常结算 */

            const dealerPokerCount = Math.max(...dealerCountList);

            const dealerIsBlackJack = dealerCountList.some(count => count === 21);
            const playerPokerCount = Math.max(...countList);

            /** 庄赢 */
            if (dealerPokerCount <= 21 && playerPokerCount > 21) {

                if (dealerIsBlackJack && dealerPokerList.length === 2) {
                    result.bet += (area.getCurrentBet() * 0.5);
                }

                return result;
            }

            /** 闲赢 */
            if (dealerPokerCount > 21 && playerPokerCount <= 21) {

                if (playerIsBlackJack && pokerList.length === 2) {
                    result.win += area.getCurrentBet() * 2.5;
                } else {
                    result.win += area.getCurrentBet() * 2;
                }
            }

            /** 平局: 庄家优势，庄赢 */
            if (dealerPokerCount > 21 && playerPokerCount > 21) {
                return result;
            }

            /** 庄赢 */
            if (dealerPokerCount > playerPokerCount) {
                return result;
            }

            /** 闲赢 */
            if (dealerPokerCount < playerPokerCount) {

                if (playerIsBlackJack && pokerList.length === 2) {
                    result.win += area.getCurrentBet() * 2.5;
                } else {
                    result.win += area.getCurrentBet() * 2;
                }
            }

            /** 平局 */
            if (dealerPokerCount === playerPokerCount) {
                result.win += area.getCurrentBet();
                return result;
            }

            return result;
        }, { bet: 0, win: 0, hadSeparate: false });

        if (hadSeparate) {
            const { bet: sepBet, win: sepWin } = this.separateAreaBetList.reduce((result, area, areaIdx) => {
                const {
                    countList,
                    pokerList
                } = area.getPokerAndCount();

                if (pokerList.length === 0) {
                    return result;
                }

                result.bet += area.getCurrentBet();

                const dealerPokerCount = Math.max(...dealerCountList);

                const playerPokerCount = Math.max(...countList);

                /** 庄赢 */
                if (dealerPokerCount <= 21 && playerPokerCount > 21) {

                    return result;
                }

                /** 闲赢 */
                if (dealerPokerCount > 21 && playerPokerCount <= 21) {
                    result.win += area.getCurrentBet() * 2;

                    return result;
                }


                /** 平局: 庄家优势，庄赢 */

                if (dealerPokerCount > 21 && playerPokerCount > 21) {
                    return result;
                }

                /** 庄赢 */
                if (dealerPokerCount > playerPokerCount) {
                    return result;
                }

                /** 闲赢 */
                if (dealerPokerCount < playerPokerCount) {

                    result.win += area.getCurrentBet() * 2;

                    return result;
                }

                /** 平局 */
                if (dealerPokerCount === playerPokerCount) {
                    result.win += area.getCurrentBet();

                    return result;
                }

                return result;
            }, { bet, win });

            bet = sepBet;

            win = sepWin;
        }

        return win - bet;
    }
}
