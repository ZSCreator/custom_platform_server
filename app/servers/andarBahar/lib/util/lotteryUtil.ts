import {BetAreasName} from '../config/betAreas';
import BetArea from "../classes/betArea";
// import {getPai} from "../../../../utils/GameUtil";

/**
 * 开奖工具
 * @property result 开奖结果
 * @property winArea 赢的区域
 * @property killAreas 必杀区域
 * @property systemCard 系统牌
 * @property cards 当局使用牌
 * @property _cards 真实当局使用牌
 * @property betAreas 房间押注区域
 * @property second 再次开奖
 */
export class LotteryUtil {
    private result: {[key in BetAreasName]: number[]} = null;
    private winArea: BetAreasName = null;
    private killAreas: BetAreasName[] = [];
    // private systemCard: number = 0;
    public systemCard: number = 0;
    private cards: number[] = null;
    private _cards: number[] = [];
    private second: boolean = false;
    betAreas: {[key in BetAreasName]: BetArea};

    /**
     *
     * @param killAreas
     */
    setKillAreas(killAreas: BetAreasName[]) {
        this.killAreas = killAreas;
        return this;
    }

    /**
     * 设置押注区域详情
     * @param betAreas
     */
    setBetAreas(betAreas: {[key in BetAreasName]: BetArea}) {
        this.betAreas = betAreas;
    }

    /**
     * 设置一副牌
     * @param cards
     */
    setCards(cards: number[]) {
        this.cards = cards;
    }

    /**
     * 设置系统牌
     * @param card
     */
    setSystemCard(card: number) {
        this.systemCard = card;
    }

    /**
     * 获取必杀区域
     */
    getKillAreas(): BetAreasName[] {
        return this.killAreas;
    }

    /**
     * 开奖区域包含必杀区域
     */
    isContain() {
        return this.killAreas.includes(this.winArea);
    }

    /**
     * 结束
     */
    isOver(): boolean {
        return !!this.winArea;
    }

    /**
     * 设置位第二次开奖
     */
    setSecond() {
        this.second = true;
    }

    /**
     * 初始化
     */
    init() {
        this._cards = deepCopy(this.cards);
        this._cards.sort((x, y) => Math.random() - 0.5);
    }

    /**
     * 删除已经使用的牌
     */
    deleteCardsInUse() {
        for (let name in this.result) {
            this.result[name].forEach(c => {
                const index = this._cards.findIndex(card => card === c);
                this._cards.splice(index, 1);
            })
        }
    }

    /**
     * 开奖
     */
    lottery() {
        this.init();
        // 如果是第二次开奖
        this.second ? this.secondLottery() : this.firstLottery();

        // 计算赢的区域
        this.calculationWinArea();

        // 如果有必杀区域 则开出不包含必杀区域的结果
        if (this.killAreas.length > 0 && this.isContain()) {
            return this.lottery();
        }

        // 如果有赢的区域 则设置开奖
        if (!!this.winArea) {
            if (this.winArea === BetAreasName.ANDAR) {
                this.betAreas[BetAreasName.ANDAR].setWinResult();
                this.betAreas[BetAreasName.BAHAR].setLossResult();
            } else {
                this.betAreas[BetAreasName.BAHAR].setWinResult();
                this.betAreas[BetAreasName.ANDAR].setLossResult();
            }
        }

        // 删除使用的牌
        this.deleteCardsInUse();

        return this.result;
    }

    /**
     * 获取赢得区域
     */
    getWinArea() {
        return this.winArea;
    }

    /**
     * 获取开奖结果
     */
    getResult() {
        return this.result;
    }

    /**
     * 计算赢的位置
     */
    private calculationWinArea() {
        // 如果结果为一代表了只发了一张牌 而先发的bahar区域 则代表bahar赢
        const baharLen = this.result[BetAreasName.BAHAR].length;
        const andarLen = this.result[BetAreasName.ANDAR].length;

        if (this.result[BetAreasName.BAHAR][baharLen - 1] % 13 === this.systemCard % 13) {
            this.winArea = BetAreasName.BAHAR;
        } else if (this.result[BetAreasName.ANDAR][andarLen - 1] % 13 === this.systemCard % 13){
            // 反之发了两张牌 如果andar区域的牌跟系统点数相同则andar赢
            this.winArea = BetAreasName.ANDAR;
        }
    }

    /**
     * 第一次随机开奖
     */
    private firstLottery() {
        const result: {[key in BetAreasName]: number[]} = {
            [BetAreasName.BAHAR]: [],
            [BetAreasName.ANDAR]: [],
        };

        // 第一张牌
        const firstCard = this._cards.shift();

        result[BetAreasName.BAHAR].push(firstCard);

        // 如果不相等发第二张牌
        if (firstCard % 13 !== this.systemCard % 13) {
            result[BetAreasName.ANDAR].push(this._cards.shift());
        }

        this.result = result;
        return result;
    }

    /**
     * 第二次开奖
     */
    private secondLottery() {
        const result: {[key in BetAreasName]: number[]} = {
            [BetAreasName.BAHAR]: [],
            [BetAreasName.ANDAR]: [],
        };



        let card = -1;

        do {
            card = this._cards.shift();
            result[BetAreasName.BAHAR].push(card);

            if (card % 13 !== this.systemCard % 13) {
                card = this._cards.shift();
                result[BetAreasName.ANDAR].push(card);
            }
        } while (card % 13 !== this.systemCard % 13);

        this.result = result;
        return result;
    }
}

/**
 * 深拷贝
 * @param value
 */
function deepCopy(value: any) {
    return JSON.parse(JSON.stringify(value));
}


// /**
//  * 初始化下注详情
//  */
// function initBetAreas(): { [key in BetAreasName]: BetArea } {
//     return {
//         [BetAreasName.ANDAR]: new BetArea(betAreaOdds[BetAreasName.ANDAR]),
//         [BetAreasName.BAHAR]: new BetArea(betAreaOdds[BetAreasName.BAHAR]),
//     }
// }
//
//
//
//
//
// const betAreas = initBetAreas();
// const a = { '78003750': 1600, '90067541': 800 };
// const b = {
//     '28712664': 400,
//     '49774569': 200,
//     '78003750': 800,
//     '84210927': 400,
//     '90067541': 200
// };
//
// const lotteryUtil = new LotteryUtil();
//
// for (let [key, betArea] of Object.entries(betAreas)) {
//     betArea.init();
//
//     if (key === BetAreasName.ANDAR) {
//         for (let i in a) {
//             betArea.addPlayerBet(i, a[i]);
//         }
//     } else {
//         for (let i in b) {
//             betArea.addPlayerBet(i, b[i]);
//         }
//     }
// }
//
// lotteryUtil.setBetAreas(betAreas);
// lotteryUtil.setSystemCard(4);
// lotteryUtil.setCards([
//     9, 13, 18, 42, 20,  1, 41, 35, 44,  6,  8,
//     17, 29, 22,  2, 23, 28, 46, 21,  7, 47, 15,
//     27, 45, 24, 31,  3, 43, 36, 26, 16, 33, 40,
//     30,  5, 39, 49, 11, 25,  0, 48, 32, 34, 10,
//     37, 50, 51, 38, 12
// ]);
//
// lotteryUtil.setSecond();
//
//
// for (let i = 0; i < 100; i++) {
//
//     lotteryUtil.lottery();
//
//     // if (!lotteryUtil.isOver()) {
//     //     lotteryUtil.setSecond();
//     //     lotteryUtil.lottery();
//     //
//         console.log('33333333333', lotteryUtil.getResult(), lotteryUtil.systemCard, lotteryUtil.getWinArea(), i);
//     // }
// }

