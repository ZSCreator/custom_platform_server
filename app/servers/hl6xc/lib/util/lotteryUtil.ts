import math = require('mathjs');
import { clone, random, sortProbability_, RangeRandOne } from '../../../../utils';
import { odds, XingYunKaPConfig, XingYunKaPConfig2 } from '../constant';
import { genereteBall } from '../hl_Logic';



/**
 * 开奖结果
 * @property window 显示结果
 * @property jackpotWin 奖池收益
 * @property totalWin 总收益
 */
export interface SlotResult {
    window: number[],
    jackpotWin: number,
    totalWin: number,
    result: {
        totalWin1: number;
        totalWin2: number;
        totalWin3: number;
    },
    luckyBall: number[],
    /**是否幸运卡片 */
    islucky: boolean;
    Multiple?: number,
    Multiples?: number[];
}


/**
 * 选择权重
 * @property newer 是否是新玩家
 * @property roulette 权重轮盘
 * @property overallControl 总体调控
 * @property singleControlOne 单人调控1
 * @property singleControlTwo 单人调控2
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property totalWin 总收益
 * @property jackpotWin 奖池收益
 * @property jackpotType 中奖类型 已废弃不会开奖但是前端还需要
 * @property window 窗口
//  * @property totalMultiple 总赔率
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 */
export class Lottery {
    newer: boolean;
    roulette: '1' | '2' | '3';
    overallControl: boolean;
    singleControlOne: boolean;
    singleControlTwo: boolean;
    openPoolAward: boolean = false;
    bet: number;
    totalBet: number = 0;
    totalWin: number;
    jackpotWin: number = 0;
    window: number[] = [];
    controlState: 1 | 2 | 3 = 1;
    Grid1: number[] = [];
    Grid2: number[] = [];
    Grid3: number[] = [];
    Grid4: number[] = [];
    win_result: { totalWin1: number; totalWin2: number; totalWin3: number; };
    luckyBall: number[];
    /**是否幸运卡片 */
    islucky: boolean;
    Multiples: number[];
    Multiple: number;
    constructor(newer: boolean, roulette: '1' | '2' | '3') {
        this.newer = newer;
        this.roulette = roulette;
    }

    private init() {
        this.jackpotWin = 0;
        this.window = [];
        this.islucky = false;
        this.Multiples = [];
        this.Multiple = 0;
    }

    /**
     * 设置押注额和中将线
     * @param bet 下注
     */
    setBetAndLineNum(bet: number) {
        this.bet = bet;
        return this;
    }
    setArchiveGrid(Grid1: number[], Grid2: number[], Grid3: number[], Grid4: number[]) {
        this.Grid1 = Grid1.slice();
        this.Grid2 = Grid2.slice();
        this.Grid3 = Grid3.slice();
        this.Grid4 = Grid4.slice();
        return this;
    }
    /**
     * 设置是否奖池开奖
     * @param openPoolAward
     */
    setOpenPoolAward(openPoolAward: boolean) {
        this.openPoolAward = openPoolAward;
        return this;
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
     * 设置内部调控
     * @param overallControl
     * @param singleControlOne
     * @param singleControlTwo
     */
    setInternalControl(overallControl: boolean, singleControlOne: boolean, singleControlTwo: boolean) {
        this.overallControl = overallControl;
        this.singleControlOne = singleControlOne;
        this.singleControlTwo = singleControlTwo;
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
    result(): SlotResult {

        // 如果是不调控 随机开奖
        if (this.controlState === 1) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        return {
            window: this.window,
            jackpotWin: this.jackpotWin,
            result: this.win_result,
            totalWin: this.totalWin,
            luckyBall: this.luckyBall,
            islucky: this.islucky,
            Multiples: this.Multiples,
            Multiple: this.Multiple,
        }
    }

    /**
     * 随机开奖
     */
    private randomLottery() {
        // 初始化
        this.init();

        // 生成窗口
        this.window = this.generateWindow();

        // 生成幸运卡片
        this.modifyInitialWindow();

        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.win_result = result;
        this.totalWin = result.totalWin1 + result.totalWin2 + result.totalWin3;
        if (this.islucky) {
            const ret = sortProbability_(XingYunKaPConfig2);
            this.Multiples = ret.map(c => c.group);
            this.Multiple = sortProbability_(ret);
            this.totalWin = this.Multiple * this.totalWin;
        }
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
     * 生成窗口
     */
    generateWindow(): number[] {
        let window: number[] = [];
        let arr = genereteBall();
        if (random(1, 100) <= 3) {
            window.push(0);
        }
        do {
            if (window.length == 6) {
                break;
            }
            let item = arr.shift();
            // if (!window.includes(item)) {
            window.push(item);
            // }
        } while (true);
        // window.push(...arr.splice(0, 6 - window.length));
        window.sort((a, b) => 0.5 - Math.random());
        return window;
    }

    /**
     * 修改初始窗口
     */
    private modifyInitialWindow() {
        let group = sortProbability_(XingYunKaPConfig);
        let arr: number[] = [0, 1, 2, 3];
        arr.sort((a, b) => 0.5 - math.random());
        this.luckyBall = arr.slice(0, group);
    }

    /**
     * 计算收益
     */
    private calculateEarnings(Ball: number[]): { totalWin1: number, totalWin2: number, totalWin3: number } {
        let totalWin1 = 0;
        let totalWin2 = 0;
        let totalWin3 = 0;

        let Grid: number[][] = [];
        Grid.push(this.Grid1, this.Grid2, this.Grid3, this.Grid4);
        for (let idx = 0; idx < Grid.length; idx++) {
            const item = Grid[idx];
            let result = item.filter(c => Ball.includes(c));
            result.push(...Ball.filter(c => c == 0));

            if (result.length == 4) {
                totalWin1 += this.bet * odds['4'];
                if (this.luckyBall.includes(idx)) {
                    this.islucky = true;
                }
            } else if (result.length == 5) {
                totalWin2 += this.bet * odds['5'];
                if (this.luckyBall.includes(idx)) {
                    this.islucky = true;
                }
            } else if (result.length == 6) {
                totalWin3 += this.bet * odds['6'];
                if (this.luckyBall.includes(idx)) {
                    this.islucky = true;
                }
            }
        }
        return { totalWin1, totalWin2, totalWin3 };
    }
}

/**
 * 创建slot开奖
 * @param newer 是否是新玩家
 * @param roulette 轮盘
 */
export function crateSlotLottery(newer: boolean, roulette: '1' | '2' | '3'): Lottery {
    return new Lottery(newer, roulette);
}

/**
 * 游戏内部个控
 * @param recordCount 游戏次数
 * @param roulette 轮盘
 * @param winPercentage 输赢比
 * @param overallControl 游戏内总控 根据奖池决定
 */
export function personalInternalControl(recordCount: number,
    roulette: '1' | '2' | '3',
    winPercentage: number,
    overallControl: boolean): [boolean, boolean] {
    // 放奖期间和十局之前(可以重置)不触发个体调控
    if (!overallControl && recordCount >= 10) {
        // 使用第一个轮盘不使用调控
        if (roulette === '1') {
            return [false, false];
        }

        const rightValue: number = roulette === '2' ? 0.45 : 0.25;
        const leftValue: number = roulette == '2' ? 0.25 : 0.05;

        // 如果输赢比处于这个区间加大点调控
        if (leftValue < winPercentage && winPercentage < rightValue) {
            return [true, false];
        }

        // 如果输赢比比左值还低加大调控
        if (winPercentage <= leftValue) {
            return [false, true];
        }
    }

    return [false, false];
}


function test() {

    let arr: number[] = [];
    for (let idx = 1; idx <= 32; idx++) {
        arr.push(idx);
    }
    arr.sort((a, b) => 0.5 - Math.random());
    let ArchiveGrid1 = arr.splice(0, 8);
    let ArchiveGrid2 = arr.splice(0, 8);
    let ArchiveGrid3 = arr.splice(0, 8);
    let ArchiveGrid4 = arr.splice(0, 8);

    let resultZ: {
        totalWin?: number, bet: number, profit: number,
        Win1: number, Win2: number, Win3: number, islucky: number,
        isluckyWin: number, Multiple: any[]
    } = {
        totalWin: 0,
        bet: 0,
        profit: 0,
        Win1: 0,
        Win2: 0,
        Win3: 0,
        islucky: 0,
        isluckyWin: 0,
        Multiple: []
    };
    for (let i = 0; i < 100000; i++) {
        const lottery = crateSlotLottery(false, '1');
        const result = lottery.setBetAndLineNum(3)
            .setArchiveGrid(ArchiveGrid1, ArchiveGrid2, ArchiveGrid3, ArchiveGrid4)
            .setTotalBet(3)
            .setInternalControl(false, false, false)
            .result();
        resultZ.totalWin += result.totalWin;
        resultZ.bet -= 3;
        if (result.result.totalWin1 > 0) {
            resultZ.Win1 += 1;
        }
        if (result.result.totalWin2 > 0) {
            resultZ.Win2 += 1;
        }
        if (result.result.totalWin3 > 0) {
            resultZ.Win3 += 1;
        }
        if (result.islucky) {
            resultZ.islucky += 1;
            resultZ.isluckyWin += result.totalWin;
            if (result.Multiple == 50) {
                // resultZ.Multiple.push(result.Multiple);
                // console.log(result.window);
            }
        }
    }
    resultZ.profit = resultZ.totalWin + resultZ.bet
    console.log((resultZ));
}

// for (let i = 0; i < 100; i++) {
// test();
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