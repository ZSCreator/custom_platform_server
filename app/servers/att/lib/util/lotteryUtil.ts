import {GameState} from "../attConst";
import {random} from "../../../../utils";
import {getResultByAtt} from "../../../../utils/GameUtil";

export interface AttResult {
    /** 总赢取 */
    totalWin?: number;
    /** 搏一搏赔率 */
    multiple?: number;
    /** 搏一搏牌 */
    card?: number,
    /** 补牌结果 */
    resultList?: {bupais: number[], id: number, gain: number, king: number, cards: number[]}[];
    /** 首次发牌结果 */
    cards?: number[];
}

/**
 * 调控状态
 */
enum ControlStatus {
    SystemWin,
    PlayerWin,
    Random
}

/**
 * 开奖工具
 * @property baseBet 基础押注
 * @property limit 几手
 * @property gameState 游戏状态
 * @property controlStatus 调控状态
 * @property totalBet 总押注
 * @property totalWin 总盈利
 * @property cards 发牌结果或者补牌结果
 * @property _cards 已发牌一旦设定不再改变
 * @property disCards 弃牌堆
 * @property color 花色
 * @property multiple 搏一搏赔率
 * @property card 搏一搏牌
 * @property currentProfit 搏一搏当前收益
 */
export class LotteryUtil {
    baseBet: number;
    limit: number;
    gameState: GameState;
    controlStatus : ControlStatus = ControlStatus.Random;
    totalBet: number = 0;
    totalWin: number = 0;
    cards: number[] = [];
    resultList: {bupais: number[], id: number, gain: number, king: number, cards: number[]}[] = [];
    disCards: number[] = [];
    color: number;
    card: number;
    multiple: number;
    currentProfit: number;
    private _cards: number[] = [];

    constructor(gameState: GameState, baseBet: number, limit: number) {
        this.gameState = gameState;
        this.baseBet = baseBet;
        this.limit = limit;
        this.totalBet = this.baseBet * this.limit;
    }

    /**
     * 获取开奖结果
     */
    result(): AttResult {
        if (this.controlStatus === ControlStatus.Random) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        return {
            totalWin: this.totalWin,
            cards: this.cards,
            multiple: this.multiple,
            card: this.card,
            resultList: this.resultList,
        }
    }


    /**
     * 设置保留牌
     * @param cards
     */
    setCards(cards: number[]) {
        this._cards = cards;
        return this;
    }

    setBoCurrentProfit(profit: number) {
        this.currentProfit = profit;
        return this;
    }

    /**
     * 设置弃牌堆和玩家选择的颜色
     * @param cards 弃牌堆
     * @param color 玩家选择的颜色
     */
    setDisCardsAndColor(cards: number[], color: number) {
        this.disCards = cards;
        this.color = color;
        return this;
    }

    /**
     * 设置调控
     * @param systemWin
     */
    setSystemWinOrLoss(systemWin: boolean) {
        this.controlStatus = systemWin ? ControlStatus.SystemWin : ControlStatus.PlayerWin;
        return this;
    }

    /**
     * 调控开奖
     */
    private randomLottery() {
        this.init();
        switch (this.gameState) {
            case GameState.Deal: {
                // 如果是第一次押注总押注修改为第一次
                this.totalBet = this.baseBet;
                this.deal();
                break;
            }
            case GameState.Again: this.again(); break;
            case GameState.Bo: this.bo(); break;
        }
    }

    /**
     * 调控开奖
     */
    private controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();

            // 如果状态是搏一搏游戏状态
            if (this.gameState === GameState.Bo) {
                // 如果调控状态玩家随机
                if (this.controlStatus === ControlStatus.PlayerWin) {
                    break;
                }

                // 如果调控输 则赔率为0则代表输
                if (this.multiple === 0) {
                    break;
                }
            }

            // 如果系统赢则玩家总盈利必须输
            if (this.controlStatus === ControlStatus.SystemWin && this.totalWin < this.totalBet) {
                break;
            }

            if (this.controlStatus === ControlStatus.PlayerWin && this.totalWin >= this.totalBet) {
                break;
            }
        }
    }


    private init() {
        this.totalWin = 0;
        this.cards = [];
        this.resultList = [];
    }


    /**
     * 第一次发牌
     * @private
     */
    private deal() {
        // 获取一副牌 不要鬼牌
        const cards = getCards(52);

        for (let i = 0; i < 5; i++) {
            const index = random(0, cards.length - 1);
            const card = cards.splice(index, 1)[0];
            this.cards.push(card);
        }

        this.totalWin = getResultByAtt(this.cards).mul * this.baseBet;
    }

    /**
     * 补牌
     * @private
     */
    private again() {
        let cards = getCards(53);

        // 获取需要补牌数量
        const count = 5 - this._cards.length;

        // 不需要补牌直接结算
        if (count === 0) {
            const result = getResultByAtt(this._cards);
            const win = this.baseBet * result.mul;
            this.resultList.push({bupais: [], id: result.id, king: result.king, gain: win, cards: this._cards});
            this.totalWin = win * this.limit;
        } else {
            cards = cards.filter(c => !this._cards.includes(c));

            for (let i = 0; i < this.limit; i++) {
                const _cards = cards.slice();
                const personalCards = this._cards.slice();
                const newlyCards = [];
                
                for (let j = 0; j < count; j++) {
                    const index = random(0, _cards.length - 1);
                    const card = _cards.splice(index, 1)[0];
                    personalCards.push(card);
                    newlyCards.push(card);
                }

                const result = getResultByAtt(personalCards);
                const win = result.mul * this.baseBet;
                this.resultList.push({bupais: newlyCards, id: result.id, king: result.king, gain: win, cards: personalCards});
                this.totalWin += win;
            }
        }
    }

    /**
     * 开出搏一搏结果
     */
    private bo() {
        let cards = getCards(52);

        // 随机从弃牌堆取出一张牌
        cards = cards.filter(c => !this.disCards.includes(c));

        const index = random(0, cards.length - 1);
        this.card = cards[index];
        const color = Math.floor(this.card / 13);
        this.multiple = calculateMul(this.color, color);
        this.totalWin = this.currentProfit * this.multiple;

    }
}

/**
 * 创建开奖工具
 */
export function createLotteryUtil(gameState: GameState, baseBet: number, limit: number) {
    return new LotteryUtil(gameState, baseBet, limit);
}

/**
 * 随机获取几张卡片
 * @param num
 */
export function getRandomOfCards(num: number): number[] {
    const cards = getCards(52);
    const cs = [];

    for (let i = 0; i < num; i++) {
        const index = random(0, cards.length - 1);
        const card = cards.splice(index, 1)[0];
        cs.push(card);
    }

    return cs;
}


/**
 * 获取一副牌
 * @param num
 */
function getCards(num: number) {
    const cards = [];
    for (let i = 0; i < num; i++) {
        cards.push(i);
    }

    return cards;
}

/**
 * 计算赔率
 * @param selectColor 选择的花色
 * @param color 开奖花色
 */
function calculateMul(selectColor: number, color: number) {
    let mul = 0;

    if (selectColor === 11 && color % 2 === 1) {
        // 红色
        mul = 2;
    } else if (selectColor === 22 && color % 2 === 0) {
        // 黑色
        mul = 2;
    } else if (color === selectColor) {
        mul = 4;
    }

    return mul;
}


