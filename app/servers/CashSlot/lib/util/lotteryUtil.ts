import {
    default as config, elementType, prizeType, weightsConfig
    , bonusGame, FreeSpinResult
} from "../constant";
import { clone, random, selectElement, sortProbability_, } from '../../../../utils';
import { fixNoRound } from "../../../../utils/lottery/commonUtil";




/**
 * 判断选线是否合理
 */
export const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= config.winLines.length;

/**
 * 中奖线
//  * @property index 第几条中奖线
 * @property linkNum 几连
 * @property linkIds 连接的元素
 * @property money 这条线收益
 * @property type 开奖类型
 * @property multiple 赔率
 */
interface WinLine {
    // index: number,
    linkNum: number,
    // linkIds: elementType[],
    money: number,
    type: elementType,
    multiple: number
}

/**
 * @property elementType 中奖类型 默认返回空为未中奖
 * @property rewardType 中奖类型 赔率的下标 默认返回0 根据下标查找赔率 详情参见 award.ts 表
 * @property linkNum 元素几连 默认0
 * @property prizeType 大奖类型 默认none 没有
 */
interface LineResult {
    elementType: elementType,
    rewardType: 0 | 1 | 2,
    linkNum: number,
    prizeType: prizeType
}

/**
 * 开奖结果
 * @property window 显示结果
 * @property jackpotWin 奖池收益
 * @property winLines 赢得行
 * @property jackpotType 中奖池类型 默认为空
 * @property totalWin 总收益
 * @property bigBG 保险箱
 */
export interface SlotResult {
    window: elementType[][],
    jackpotWin: number,
    winLines: WinLine[],
    jackpotType: prizeType,
    totalWin: number,
    multiple: number,
    freeSpin: boolean;
    freeSpinResult: FreeSpinResult;
}



/**
 * 选择权重
 * @property newer 是否是新玩家
 * @property roulette 权重轮盘
 * @property overallControl 总体调控
 * @property singleControlOne 单人调控1
 * @property singleControlTwo 单人调控2
 * @property openPoolAward 是否开奖池大奖
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property lineNum 选线
 * @property totalWin 总收益
 * @property jackpotWin 奖池收益
 * @property jackpotType 中奖类型 已废弃不会开奖但是前端还需要
 * @property weights 权重轮盘
 * @property window 窗口
 * @property winLines 中奖线
 * @property totalMultiple 总赔率
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 * @property freeSpin 免费摇奖
 * @property scatterCount 特殊字符个数
 */
export class Lottery {
    newer: boolean;
    roulette: '1' | '2' | '3';
    overallControl: boolean;
    singleControlOne: boolean;
    singleControlTwo: boolean;
    // openPoolAward: boolean = false;
    bet: number;
    totalBet: number = 0;
    lineNum: number;
    totalWin: number = 0;
    jackpotWin: number = 0;
    jackpotType: prizeType = null;
    weights: { [element: string]: number[] };
    window: elementType[][] = [];
    winLines: WinLine[] = [];
    totalMultiple: number = 0;
    controlState: 1 | 2 | 3 = 1;
    scatterCount: number;
    freeSpin: boolean;
    freeSpinResult: FreeSpinResult = {};

    constructor(newer: boolean, roulette: '1' | '2' | '3') {
        this.newer = newer;
        this.roulette = roulette;
    }

    private init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        // this.bigBG = 0;
        this.freeSpin = false;
        this.freeSpinResult = { totalWin: 0, group: 0, odds: 0 };
    }

    /**
     * 设置押注额和中将线
     * @param bet 下注
     * @param lineNum 几条线
     */
    setBetAndLineNum(bet: number, lineNum: number) {
        this.bet = bet;
        this.lineNum = lineNum;
        return this;
    }

    /**
     * 设置是否奖池开奖
     * @param openPoolAward
     */
    setOpenPoolAward(openPoolAward: boolean) {
        // this.openPoolAward = openPoolAward;
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
            winLines: this.winLines,
            jackpotType: this.jackpotType,
            totalWin: this.totalWin,
            multiple: this.totalMultiple,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
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

        // 是否生成 scatter元素
        this.scatterCount = this.getScatterNumber(this.window);

        // this.modifyInitialWindow();

        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;


        // 如果scatter字符大于等于3免费开开奖
        if (this.scatterCount >= 3) {
            this.freeSpinLottery();
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
     * 选择轮盘
     */
    private selectWights(column: number) {
        let weights: { [element: string]: number[] };
        // const roulette = this.roulette;
        // 是新人就直接使用第一个轮盘
        const group = sortProbability_(weightsConfig[column].group);
        // if (this.newer) {
        weights = clone(config.weights[group]);
        // } else {
        //     weights = clone(config.weights[roulette]);
        // }
        // if (this.openPoolAward) {
        //     const index = Math.random() < 0.5 ? 3 : 4;
        //     if (index === 3) weights.W[index] = 0;
        // }
        this.weights = weights;
        return group;
    }

    /**
     * 生成窗口
     */
    generateWindow(): elementType[][] {
        const window: elementType[][] = [];
        // 生成一个矩阵
        for (let i = 0; i < config.column; i++) {
            // 选择轮盘
            const group = this.selectWights(i);
            const elementKeys = Object.keys(this.weights);
            const elementSet = elementKeys.map(element => {
                return { key: element, value: this.weights[element][i] };
            });

            // 一列
            const line = [];
            do {
                // 随机选择一个元素
                let element = selectElement(elementSet);
                // if (line.includes("E") && element == "E") {
                //     continue;
                // }
                line.push(element);
                if (line.length == 1 && group == 2) {
                    line.push(-1);
                }
            } while (line.length < config.row);
            window.push(line);
        }
        if (Math.random() < 0.3) {
            // window[0][1] = "bonus";
            // window[1][1] = "bonus";
            // window[2][1] = "bonus";
        }
        return window;
    }

    /**
     * 计算收益
     */
    private calculateEarnings(window: elementType[][]): { winLines: WinLine[], totalWin: number } {
        // 选择中奖线
        const selectLines = config.winLines.slice(0, this.lineNum);

        // 中奖线
        let winLines: WinLine[] = [],
            // 累积收益
            totalWin = 0;

        // 这条线上的元素  [2, 2, 2],
        const elementLine: elementType[] = selectLines[0].map((l, i) => window[i][l - 1]).reverse();
        // 先克隆一个当前元素的副本
        let transcript = clone(elementLine);

        // 中奖赔率
        transcript = transcript.filter(c => c != -1 as any && c != "bonus");

        let odds = 0;
        if (transcript.length > 0) {
            if (transcript.length == 3) {
                let frist = transcript[0];
                let two = transcript[1];
                let third = transcript[2];
                odds = config.award[frist][2] + config.award[two][1] + config.award[third][0];
            } else if (transcript.length == 2) {
                let frist = transcript[0];
                let two = transcript[1];
                odds = config.award[frist][1] + config.award[two][0];
            } else if (transcript.length == 1) {
                let frist = transcript[0];
                odds = config.award[frist][0];
            }
            const lineProfit = fixNoRound(this.bet * odds);
            totalWin += lineProfit;
            //     // 累计总赔率
            this.totalMultiple += odds;
            winLines.push({ linkNum: transcript.length, money: lineProfit, type: transcript.toString() as any, multiple: odds });
            // winLines[0].type = "" as any;
            // for (const item of transcript) {
            //     winLines[0].type += `${item}`;
            // }

        }
        return { winLines, totalWin };
    }

    private freeSpinLottery() {
        this.freeSpin = true;
        const group = sortProbability_(bonusGame);
        const result = bonusGame.find(c => c.group == group);
        this.freeSpinResult = {
            group: result.group,
            odds: result.value,
            totalWin: fixNoRound(result.value * this.bet),
        }
    }
    /**
     * 获取Scatter字符个数
     */
    private getScatterNumber(window: elementType[][]): number {
        // 选择中奖线
        const selectLines = config.winLines.slice(0, this.lineNum);
        // 这条线上的元素
        const elementLine: elementType[] = selectLines[0].map((l, i) => window[i][l - 1]);
        let scatterCount = 0;
        scatterCount += elementLine.filter(c => c == "bonus").length;
        return scatterCount;
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
    const lottery = crateSlotLottery(false, '1');

    const result = lottery.setBetAndLineNum(1, 3)
        .setTotalBet(3)
        .setInternalControl(false, false, false)
        .result();

    // if (result.totalWin > 3) {
    console.log(result);
    // }
}

// for (let i = 0; i < 100; i++) {
// test();
// }
