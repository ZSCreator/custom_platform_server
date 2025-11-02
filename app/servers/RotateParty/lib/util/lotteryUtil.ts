import {COLUMN_NUM, ElementEnum, ROW_NUM, specialElements} from "../constant";
import {clone, selectElement} from '../../../../utils';
import getWinLines from "../config/winLines";
import awardConfig from "../config/award";
import weightsConfig from "../config/weights";


/**
 * 判断选线是否合理
 */
export const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= getWinLines().length;

/**
 * 调控状态
 */
enum ControlStatus {
    SystemWin,
    PlayerWin,
    Random
}

/**
 * 中奖线
 * @property index 第几条中奖线
 * @property linkNum 几连
 * @property linkIds 连接的元素
 * @property money 这条线收益
 * @property type 开奖类型
 * @property multiple 赔率
 */
interface WinLine {
    index: number,
    linkNum: number,
    linkIds: ElementEnum[],
    money: number,
    type: ElementEnum,
    multiple: number
}

/**
 * @property elementType 中奖类型 默认返回空为未中奖
 * @property rewardType 中奖类型 赔率的下标 默认返回0 根据下标查找赔率 详情参见 award.ts 表
 * @property linkNum 元素几连 默认0
 */
interface LineResult {
    elementType: ElementEnum,
    rewardType: 0 | 1 | 2 | 3,
    linkNum: number,
}

/**
 * 开奖结果
 * @property window 显示结果
 * @property winLines 赢得行
 * @property totalWin 总收益
 * @property freeSpin 是否免费开奖
 * @property freeSpinResult 免费开奖结果
 * @property freeSpinTimesList 免费游戏次数
 */
export interface SlotResult {
    window: ElementEnum[][],
    winLines: WinLine[],
    totalWin: number,
    multiple: number,
    freeSpin: boolean;
    freeSpinResult: FreeSpinResult[];
    lastWindow: ElementEnum[][],
    freeSpinTimesList: number[],
}

/**
 * 开奖结果
 * @property totalWin 总收益
 * @property multiple 赔率
 * @property card 开牌
 */
export interface BoResult {
    totalWin: number,
    multiple: number,
    card: number,
}


/**
 * 免费摇奖的结果
 * @property window 窗口
 * @property totalWin 盈利
 * @property winLines 中奖线
 * @property lastWindow 最终窗口
 */
interface FreeSpinResult {
    window: ElementEnum[][],
    totalWin: number,
    lastWindow: ElementEnum[][]
    winLines: WinLine[],
}


/**
 * 选择权重
 * @property newer 是否是新玩家
 * @property roulette 权重轮盘
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property lineNum 选线
 * @property totalWin 总收益
 * @property weights 权重轮盘
 * @property window 窗口
 * @property lastWindow 最终的窗口
 * @property winLines 中奖线
 * @property totalMultiple 总赔率
 * @property controlState 调控状态
 * @property freeSpin 免费摇奖
 * @property freeSpinResult 免费开奖结果
 * @property freeSpinCount 免费开奖次数
 * @property rowWildsCount 一列的row元素统计
 * @property freeSpinTimesList 免费游戏次数
 * @property trigger 是否已经触发了五次免费游戏
 */
export class Lottery {
    newer: boolean;
    roulette: '1' | '2' | '3';
    bet: number;
    totalBet: number = 0;
    lineNum: number;
    totalWin: number = 0;
    weights: { [element: string]: number[] };
    window: ElementEnum[][] = [];
    lastWindow: ElementEnum[][] = [];
    winLines: WinLine[] = [];
    totalMultiple: number = 0;
    controlState: ControlStatus = ControlStatus.Random;
    freeSpin: boolean = false;
    freeSpinResult: FreeSpinResult[] = [];
    freeSpinCount: number = 0;
    rowWildsCount: { [key: number]: number } = {};
    freeSpinTimesList: number[] = [];
    trigger: boolean = false;

    constructor(newer: boolean, roulette: '1' | '2' | '3') {
        this.newer = newer;
        this.roulette = roulette;
    }

    private init() {
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.rowWildsCount = {};
        this.freeSpinCount = 0;
        this.lastWindow = [];
        this.freeSpinTimesList = [];
        this.trigger = false;
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
        this.controlState = win ? ControlStatus.SystemWin : ControlStatus.PlayerWin;
        return this;
    }

    /**
     * 获取最终结果
     */
    result(): SlotResult {
        // 选择轮盘
        this.selectWights();

        // 如果是不调控 随机开奖
        if (this.controlState === ControlStatus.Random) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        return {
            window: this.window,
            winLines: this.winLines,
            totalWin: this.totalWin,
            multiple: this.totalMultiple,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
            lastWindow: this.lastWindow,
            freeSpinTimesList: this.freeSpinTimesList,
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
        const freeSpinCount = this.calculateFreeSpinCount(this.window);
        this.lastWindow = this.changeWindow(this.window);

        // 计算收益
        const result = this.calculateEarnings(this.lastWindow);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;

        this.freeSpinTimesList.push(freeSpinCount);

        if (freeSpinCount > 0) {
            this.freeSpinLottery(freeSpinCount);
        }
    }

    /**
     * 调控开奖
     */
    private controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();

            if (this.controlState === ControlStatus.SystemWin && this.totalWin <= this.totalBet) {
                break;
            }

            if (this.controlState === ControlStatus.PlayerWin && this.totalWin > this.totalBet) {
                break;
            }
        }
    }


    /**
     * 选择轮盘
     */
    private selectWights() {
        let weights: { [element: string]: number[] };

        const roulette = this.roulette;

        // 是新人就直接使用第一个轮盘
        if (this.newer) {
            weights = clone(weightsConfig['1']);
        } else {
            weights = clone(weightsConfig[roulette]);
        }

        this.weights = weights;
    }

    /**
     * 生成窗口
     */
    generateWindow(): ElementEnum[][] {
        // return [
        //     [ElementEnum.CJ, ElementEnum.LEMON, ElementEnum.CTEN],
        //     [ElementEnum.WILD, ElementEnum.LEMON, ElementEnum.CTEN],
        //     [ElementEnum.WILD, ElementEnum.LEMON, ElementEnum.CTEN],
        //     [ElementEnum.CA, ElementEnum.BAR, ElementEnum.CJ],
        //     [ElementEnum.CQ, ElementEnum.CA, ElementEnum.BAR],
        // ]
        const window: ElementEnum[][] = [];
        const elementKeys = Object.keys(this.weights);

        // 生成一个矩阵
        for (let i = 0; i < COLUMN_NUM; i++) {
            const elementSet = elementKeys.map(element => {
                // 如果是wild的元素 如果数量超过了特殊元素数量或者不是随机状态则不开wild元素
                if (element === ElementEnum.WILD && this.controlState !== ControlStatus.Random) {
                    return {key: element, value: 0};
                }

                return {key: element, value: this.weights[element][i]};
            });

            // 一列
            const line = [];

            const keys = Object.keys(this.rowWildsCount);
            if (keys.includes(i.toString())) {
                line.push(ElementEnum.WILD, ElementEnum.WILD, ElementEnum.WILD);
            } else {
                for (let j = 0; j < ROW_NUM; j++) {
                    // 随机选择一个元素
                    const element = selectElement(elementSet);
                    line.push(element);
                }
            }

            window.push(line);
        }

        return window;
    }

    /**
     * 计算收益
     */
    private calculateEarnings(window: ElementEnum[][]): { winLines: WinLine[], totalWin: number } {
        // 选择中奖线
        const selectLines: number[][] = getWinLines().slice(0, this.lineNum);

        // 中奖线
        let winLines: WinLine[] = [],
            // 累积收益
            totalWin = 0;

        selectLines.forEach((line, index) => {
            // 这条线上的元素
            const elementLine: ElementEnum[] = line.map((l, i) => window[i][l - 1]);

            // 先克隆一个当前元素的副本
            const transcript = clone(elementLine);

            // 如果其中存在wild元素,将其转成其前一个元素
            elementLine.forEach((element, index) => {
                if (element === ElementEnum.WILD) {
                    elementLine[index] = index === 0 ? elementLine.find(e => e !== ElementEnum.WILD) : elementLine[index - 1];
                }
            });

            // 计算元素线中奖结果
            const lineResult: LineResult = this.calculateLineResult(elementLine);

            // 如果有中奖元素
            if (lineResult.elementType) {

                // 中奖赔率
                const odds = awardConfig[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds;
                totalWin += lineProfit;

                // 累计总赔率
                this.totalMultiple += odds;

                const linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({
                    index, linkNum: lineResult.linkNum, linkIds, money: lineProfit,
                    type: lineResult.elementType, multiple: odds
                });
            }
        });


        return {winLines, totalWin};
    }

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     */
    private calculateLineResult(elementLine: ElementEnum[]): LineResult {
        // 取第一个元素
        const firstElement = elementLine[0];

        let result: LineResult = {elementType: null, rewardType: 0, linkNum: 0};

        // 如果不是特殊元素则判断第二元素是否相等 不相等也同样没有继续判断的价值
        if (firstElement !== elementLine[1]) {
            return result;
        }


        switch (true) {
            // 单元素五连
            case elementLine.every(element => element === firstElement): {
                result.linkNum = 5;
                result.elementType = firstElement;
                result.rewardType = specialElements.includes(firstElement) ? 3 : 2;
                break;
            }

            // 单元素四连
            case elementLine.slice(0, 4).every(element => element === firstElement) : {
                result.elementType = firstElement;
                result.linkNum = 4;
                result.rewardType = specialElements.includes(firstElement) ? 2 : 1;
                break;
            }

            // 元素3连
            case elementLine.slice(0, 3).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = specialElements.includes(firstElement) ? 1 : 0;
                result.linkNum = 3;

                break;
            }

            // 元素2连
            case (specialElements.includes(firstElement) &&
                elementLine.slice(0, 2).every(element => element === firstElement)): {
                result.elementType = firstElement;
                result.rewardType = 0;
                result.linkNum = 2;

                break;
            }

            default:
                // throw new Error(`未判断的情况 元素线: ${elementLine}`);
                break;
        }

        return result;
    }

    /**
     * len 摇几次
     * @param len
     * @private
     */
    private freeSpinLottery(len: number) {
        this.freeSpin = true;

        while (len > 0) {
            // 新生成一个窗口
            const window = this.generateWindow();

            len = this.calculateFreeSpinCount(window, len);

            // 改变窗口
            const lastWindow = this.changeWindow(window);

            // 计算结果
            const result = this.calculateEarnings(lastWindow);



            this.freeSpinResult.push({
                winLines: result.winLines,
                totalWin: result.totalWin,
                window,
                lastWindow,
            });

            len--;

            this.freeSpinTimesList.push(len);
        }
    }

    /**
     * 特殊元素
     * @param window
     */
    changeWindow(window: ElementEnum[][],) {
        return window.map((row, index) => {
            if (!!this.rowWildsCount[index]) {
                this.rowWildsCount[index]--;
                if (this.rowWildsCount[index] === 0) Reflect.deleteProperty(this.rowWildsCount, index.toString());
                return [ElementEnum.WILD, ElementEnum.WILD, ElementEnum.WILD];
            }
            return row;
        });
    }

    calculateFreeSpinCount(window: ElementEnum[][], len: number = 0) {
        const indexList = [];

        window.filter((row, index) => {
            if (row.includes(ElementEnum.WILD)) indexList.push(index);
        });

        const keys = Object.keys(this.rowWildsCount);

        keys.forEach(k => {
            let _k = parseInt(k);
            const index = indexList.findIndex(i => i === _k);
            // 如果不为一则出现过
            if (index !== -1) indexList.splice(index, 1);
        });

        // 如果已经触发过了 就保留以前的 如果是作为新增 次数加一
        if (this.trigger) {
            // 没有新增
            if (indexList.length === 0) return len;

            indexList.forEach(i => {
                this.rowWildsCount[i] = 2;
                len++;
            });

            for (let i in this.rowWildsCount) {
                this.rowWildsCount[i] = 2;
            }

            return len;
        }

        let trigger = indexList.length >= 2 || (keys.length === 1 && indexList.length > 0);

        if (trigger) {
            this.trigger = true;
            len += 5;
            indexList.forEach(i => this.rowWildsCount[i] = 2);
            for (let i in this.rowWildsCount) {
                this.rowWildsCount[i] = 2;
            }
        } else {
            indexList.forEach(i => {
                this.rowWildsCount[i] = 2;
                len++;
            });

            for (let i in this.rowWildsCount) {
                this.rowWildsCount[i] = 2;
            }
        }


        return len;
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


function test() {
    const lottery = crateSlotLottery(false, '1');

    const result = lottery.setBetAndLineNum(0.1, 10)
        .setTotalBet(1)
        .result();

    if (result.window.every(row => row.every(e => e === ElementEnum.SEVEN))) {
        console.warn('333333333333')
    }

    return result;
}
//
// const count = {
//     _gold: 1000000,
//     gold: 1000000,
//     winCount: 0,
//     reOdds: 0,
//     odds: 0,
//     free: 0,
//     freeOdds: 0,
//     freeWin: 0,
// }
//
// for (let i = 1; i <= 10; i++) {
//     // test();
// // }
//     if (count.gold === 0) break;
//     const result = test();
//
//     count.gold -= 1;
//     count.gold += result.totalWin;
//
//     if (result.freeSpin) {
//         count.free++;
//         count.freeOdds = count.free / i;
//         const totalWin = result.freeSpinResult.reduce((num, r) => r.totalWin + num, 0);
//         count.freeWin += totalWin;
//         count.gold += totalWin;
//     }
//
//     if (result.totalWin > 0 && result.totalWin >= 1 || result.freeSpin) {
//         count.winCount++;
//     }
//
//     count.reOdds = count.gold / count._gold;
//     count.odds = count.winCount / i;
// }
//
// console.log(`本金:${count._gold} 现有金币:${count.gold} 回收率: ${count.reOdds * 100}% 中奖率: ${count.odds * 100}%
// 免费游戏次数: ${count.free} 免费游戏触发率: ${count.freeOdds * 100}% 免费游戏总赢取: ${count.freeWin}`)
