import {
    elementType,
    baseBetList,
} from '../constant';
import * as utils from "../../../../utils";


/**
 * 中奖详情
 * @property type 中奖类型
 * @property odds 中奖赔率
 * @property num 数量
 */
export interface WinningDetail {
    type: elementType,
    num: number,
    odds: number,
    win: number,
}


/**
 * 糖果派对开奖结果
 * @property window 开奖窗口
 * @property totalWin 总收益
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property awards 每回合的盈利结果
 * @property winningDetails 中奖具体详情
 * @property clearElements 消除元素 用以实况记录
 */
export interface PharaohLotteryResult {
    window: elementType[][],
    totalWin: number,
    roundWindows: any[],
    awards: number[],
    totalMultiple: number,
    winningDetails: WinningDetail[],
    clearElements: any[],
    freeSpin?: boolean,
    odds: number,
    freeSpinResult?: PharaohLotteryResult[],
}

// 单个窗口 一个矩阵
type Window = elementType[][];

/**
 * 选择权重
 * @property newer 是否是新玩家
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property totalWin 总收益
 * @property jackpot 房间奖池
 * @property window 窗口
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property totalMultiple 总赔率
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 */
export class Lottery {
    newer: boolean;
    bet: number;
    totalBet: number = 0;
    totalWin: number = 0;
    jackpot: number = 0;

    window: Window = [];
    roundWindows: { type: elementType; }[][][] = [];
    totalMultiple: number = 0;
    awards: number[] = [];

    controlState: 1 | 2 | 3 = 1;
    winningDetails: WinningDetail[] = [];
    clearElements: any[] = [];


    constructor(newer: boolean, jackpot: number) {
        this.newer = newer;
        this.jackpot = jackpot;
    }

    private init() {
        this.totalWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.roundWindows = [];
        this.awards = [];
        this.winningDetails = [];
        this.clearElements = [];
    }


    /**
     * 设置总押注
     * @param totalBet 总押注
     */
    setTotalBet(totalBet: number) {
        this.totalBet = totalBet;
        return this;
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
    result(): PharaohLotteryResult {
        // 根据调控状态看时随机开奖还是调控开奖
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
    private stripResult(): PharaohLotteryResult {
        return {
            window: this.window,
            totalWin: this.totalWin,
            // clearAll: this.clearAll,
            awards: this.awards,
            roundWindows: this.roundWindows,
            totalMultiple: this.totalMultiple,
            winningDetails: this.winningDetails,
            clearElements: this.clearElements,
            odds: 1
        };
    }

    /**
     * 随机开奖
     */
    private randomLottery() {
        // 初始化
        this.init();
        // 生成窗口
        this.window = this.generateWindow();

    }

    /**
     * 调控开奖
     */
    private controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();

            // 如果玩家输 收益小于总押注即可
            if (this.controlState === 2 && this.totalWin <= this.totalBet) {
                break;
            }

            // 如果系统输 收益大于押注即可
            if (this.controlState === 3 && this.totalWin > this.totalBet) {
                break;
            }
        }
    }


    /**
     * 生成初始窗口
     */
    generateWindow(twoStrategy: boolean = false) {
        const window: elementType[][] = [];
        // 开奖矩阵 长高等款
        for (let i = 0; i < 4; i++) {
            let line = [];

            while (line.length !== 4) {
                // 随机一个元素
                line.push("A");
            }

            window.push(line);
        }
        return window;
    }
}


/**
 * 创建糖果派对开奖
 * @param newer 是否是新玩家
 * @param jackpotGoldNum 奖池金币数量
 */
export function cratePharaohLottery(newer: boolean, jackpotGoldNum: number): Lottery {
    return new Lottery(newer, jackpotGoldNum);
}

/**
 * 判断该下注数和下注倍数是否合理
 * @param betNum
 * @param betOdds
 */
export function isHaveBet(betNum: number): boolean {
    return baseBetList.includes(betNum);
}


function test(totalBet: number) {
    const lottery = cratePharaohLottery(false, 0);

    return lottery.setTotalBet(totalBet)
        .setTotalBet(10)
        .result();
}

// function test1() {
//     const lottery = cratePharaohLottery(false,  0);
//
//
//     return lottery.setTotalBet(3)
//         .setDetonatorCount(10)
//         .result();
// }


console.time('1')

for (let i = 0; i < 1; i++) {
    let result = test(1)
    console.log(JSON.stringify(result));
}
console.timeEnd('1')
