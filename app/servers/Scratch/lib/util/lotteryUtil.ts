import  ScratchCardResultManager from '../../../../common/dao/daoManager/ScratchCardResult.manager'
import  ScratchCardResultMysqlDao from '../../../../common/dao/mysql/ScratchCardResult.mysql.dao'



/**
 * 开奖结果
 */
export interface ScratchCardResult {
    totalWin: number,
    card: {
        rebate: number,
        result: number[],
        jackpotId: number,
        status: number,
    }
}


/**
 * 选择权重
 * @property card 刮刮卡
 * @property jackpotId 刮奖型号
 * @property totalBet 总押注
 * @property totalWin 总收益
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 */
export class Lottery {
    card: any;
    jackpotId: number;
    totalBet: number = 0;
    totalWin: number = 0;
    controlState: 1 | 2 | 3 = 1;

    constructor() {
    }

    private init() {
        this.totalWin = 0;
        this.card = null;
    }

    /**
     * 设置押注额和开奖类型
     * @param bet
     * @param jackpotId
     */
    setTotalBetAndJackpotId(bet: number, jackpotId: number) {
        this.totalBet = bet;
        this.jackpotId = jackpotId;
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
    async result(): Promise<ScratchCardResult> {
        // 如果是不调控 或者 放水 随机开奖
        if (this.controlState === 1 || this.controlState === 3) {
            await this.randomLottery();
        } else {
            await this.controlLottery();
        }

        return {
            totalWin: this.totalWin,
            card: this.card
        }
    }

    /**
     * 随机开奖
     */
    private async randomLottery() {
        // 初始化
        this.init();

        // 随机获取一张卡
        this.card = await this.getCard();

        this.card.result = this.card.result.split(',').map(n => Number(n));

        // 一旦获取这张卡就当一开奖
        // await scratchCardsDoc.updateOne({cardNum: this.card.cardNum}, {$set: {status: 1}});
        await ScratchCardResultMysqlDao.updateOne({id: this.card.id},  {status: 1});

        // 计算收益
        this.calculateEarnings();
    }

    /**
     * 调控开奖
     */
    private async controlLottery() {
        for (let i = 0; i < 100; i++) {
            await this.randomLottery();

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
        this.totalWin = this.card.rebate * this.totalBet;
    }

    /**
     * 获取一张卡片
     */
    async getCard() {
        // 获取一张未刮的卡片
        // let cards = await scratchCardsDoc.aggregate([{$match: {jackpotId: this.jackpotId}}, {$sample: {size: 1}}]);
        let cards = await ScratchCardResultManager.findOneNotLottery(this.jackpotId);

        if (cards) {
            return cards;
        }
        // 如果没找到 则初始化
        await ScratchCardResultMysqlDao.updateMany({jackpotId: this.jackpotId, status: 1},  {status: 0});

        // 获取一张未刮的卡片
        cards = await ScratchCardResultManager.findOneNotLottery(this.jackpotId);

        if(!cards){
            throw new Error('未找到可用刮刮卡卡');
        }
        return cards;
    }
}

/**
 * 创建slot开奖
 */
export function crateSlotLottery(): Lottery {
    return new Lottery();
}


function test() {
    const lottery = crateSlotLottery();

    // const result = lottery.(1, 3)
    //     .setTotalBet(3)
    //     .result();

    // if (result.totalWin > 3) {
    // console.log(result);
    // }
}

// for (let i = 0; i < 100; i++) {
//     test();
// }

// 根据jackpots数组给出jackpotType
// function judgeJackPotType(jackpots) {
//     if (jackpots.length == 0) {
//         return null;
//     }
//     if (jackpots.includes('colossal')) {
//         return 'colossal';
//     } else if (jackpots.includes('monster')) {
//         return 'monster';
//     } else if (jackpots.includes('mega')) {
//         return 'mega';
//     } else {
//         return 'mini';
//     }
// }