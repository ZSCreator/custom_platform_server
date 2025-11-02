import {ELEMENT_ODDS, Elements, probability, wheel} from '../constant';
import {random} from "../../../../utils";


/**
 * 幸运转盘开奖结果
 * @property result 结果
 * @property profit 收益
 */
export interface LWLotteryResult {
    result: number,
    profit: number,
}

/**
 * 开奖
 * @property totalBet 玩家总押注
 * @property totalWin 总收益
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 */
export class Lottery {
    totalBet: number = 0;
    totalWin: number = 0;
    value: Elements;
    controlState: 1 | 2 | 3 = 1;


    constructor(bet: number) {
        this.totalBet = bet;

    }

    private init() {
        this.totalWin = 0;
    }


    /**
     * 设置系统赢或者输
     * @param win
     */
    setSystemWinOrLoss(win: boolean) {
        this.controlState = win ? 2 : 3;
        return this;
    }

    /**
     * 获取最终结果
     */
    result() {
        if (this.controlState === 1) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        return this.stripResult();
    }

    /**
     * 包装结果
     */
    private stripResult(): LWLotteryResult {
        return {
            result: this.value,
            profit: this.totalWin,
        };
    }


    /**
     * 随机开奖
     */
    private randomLottery() {
        // 初始化
        this.init();

        // 开奖
        this.genResult();

        // 计算开奖结果
        this.calculateEarnings();
    }

    private genResult() {
        let num = 0, randomNum = random(0, 10000), item;
        for (let value in probability) {
            num += probability[value];

            if (randomNum <= num) {
                item = value;
                break;
            }
        }

        this.value = parseInt(item);
    }

    /**
     * 调控开奖
     */
    private controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();

            if (this.controlState === 2 && this.totalWin <= this.totalBet) {
                break;
            }

            if (this.controlState === 3 && this.totalWin > this.totalBet) {
                break;
            }
        }
    }



    /**
     * 计算收益
     */
    private calculateEarnings() {
       this.totalWin = ELEMENT_ODDS[this.value] * this.totalBet;
    }
}

/**
 * 创建slot开奖
 * @param bet 下注金额
 */
export function createLWLottery(bet: number): Lottery {
    return new Lottery(bet);
}

// for (let c = 0; c < 100000; c++) {
//     const lottery = createLWLottery(10);
//     const result = lottery.result();
//
//     if (result.result === undefined) {
//         console.error('23423432424')
//     }
//
//     if (result.result === Elements.TWO_HUNDRED) {
//         console.log('55555555555555555')
//     }
// }

// for (let i = 0; i < 100; i++) {
//     const result = test();
//
//     console.log(random(0, 4))
//
//     if (result.characters.length > 2) {
//         console.log(result.characterWindow.map(l => l.find(p => !!p.scatter)));
//     }
//
//     // console.log(test1());
// }




