import { bigMermaid, elementType, gold, map, smallMermaid } from "../constant";
import { random, sortProbability } from '../../../../utils';
import { baseWeights } from "../config/weights";
import { winLine } from "../config/winLine";
import { awards } from "../config/awards";
import {Big} from 'big.js'


/**
 * 中奖线
 * @property elements 中奖线的元素
 * @property winLine 记录偏移量这些 后端暂时不用
 * @property count 元素几连 默认0
 * @property hasWild 是否有wild且被替换过
 * @property win 单条线盈利
 */
interface LineResult {
    elements: elementType[],
    winLine: { offset: number, index: number }[],
    count: number,
    hasWild: boolean,
    type: elementType
    win?: number
}

/**
 * 开奖结果
 * @property window 显示结果
 * @property jackpotWin 奖池收益
 * @property winLines 赢得行
 * @property totalWin 总收益
 * @property goldCount 金币数量
 *
 */
export interface PirateResult {
    window: elementType[][],
    jackpotWin: number,
    totalWin: number,
    goldCount: number,
    winLines: LineResult[]
}

/**
 * 免费摇奖的结果
 * @property window 窗口
 * @property win 窗口盈利
 * @property winLines 中奖线结果
 */
interface FreeSpinResult {
    window: elementType[][],
    winLines: LineResult[],
    win: number
}


/**
 * 选择权重
 * @property roulette 权重轮盘
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property lineNum 选线
 * @property totalWin 总收益
 * @property jackpotWin 奖池收益
 * @property weights 权重轮盘
 * @property window 窗口
 * @property winLines 中奖线
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 * @property multiply 押注倍率
 * @property goldCount 金币个数
 * @property freeSpin 免费开奖
 */
export class Lottery {
    roulette: '1' | '2' | '3';
    bet: number;
    totalBet: number = 0;
    lineNum: number;
    totalWin: number = 0;
    jackpotWin: number = 0;
    weights: { [element in elementType]: number }[] = [];
    window: elementType[][] = [];
    winLines: LineResult[] = [];
    controlState: 1 | 2 | 3 = 1;
    multiply: number = 0;
    goldCount: number = 0;
    freeSpin: boolean = false;

    constructor(roulette: '1' | '2' | '3') {
        this.roulette = roulette;
    }

    private init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.winLines = [];
        this.goldCount = 0;
    }

    /**
     * 设置总押注和押注倍率
     * @param totalBet 总押注
     * @param multiply 倍率
     */
    setTotalBetAndMultiply(totalBet: number, multiply: number) {
        this.totalBet = totalBet;
        this.multiply = multiply;
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
     * 设置免费开奖
     * @param f 是否免费开奖
     */
    setFreeSpin(f: boolean) {
        this.freeSpin = f;
        return this;
    }

    /**
     * 获取最终结果
     */
    result(): PirateResult {
        // 选择轮盘
        this.selectWights();

        // 如果是不调控 随机开奖
        if (this.controlState === 1) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        return {
            window: this.window,
            jackpotWin: this.jackpotWin,
            totalWin: this.totalWin,
            goldCount: this.goldCount,
            winLines: this.winLines
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

        // 修改初始窗口 转化美人鱼
        modifyInitialWindow(this.window);

        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.winLines = result.currentLines;
        this.totalWin += result.jackpotProfit + result.baseProfit;
        this.jackpotWin += result.jackpotProfit;
    }

    /**
     * 免费开奖
     * @param count 开奖次数
     */
    freeSpinLottery(count: number): { freeSpinResults: FreeSpinResult[], totalWin: number } {
        const freeSpinResults: FreeSpinResult[] = [];

        // 标记免费开奖
        this.freeSpin = true;

        for (let i = 0; i < count; i++) {
            // 生成窗口
            const window = this.generateWindow();

            // 修改初始窗口 转化美人鱼
            modifyInitialWindow(window);

            // 计算收益
            const result = this.calculateEarnings(window);

            this.totalWin += result.jackpotProfit + result.baseProfit;

            freeSpinResults.push({
                win: result.jackpotProfit + result.baseProfit,
                window,
                winLines: result.currentLines,
            });
        }


        return {
            freeSpinResults,
            totalWin: this.totalWin,
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
    private selectWights() {
        this.weights = baseWeights[this.roulette];
    }

    /**
     * 生成窗口
     */
    generateWindow(): elementType[][] {
        // 如果是处于让系统赢的调控状态或者免费开奖 不出现金币
        // let hasGold = false || this.freeSpin, window: elementType[][] = [];
        let hasGold = this.controlState === 2 || this.freeSpin, window: elementType[][] = [];

        // 生成一个3 4 3 4 3 的窗口
        for (let i = 0, len = this.weights.length; i < len; i++) {
            // 列的长度
            const columnLen = (i + 1) % 2 == 0 ? 4 : 3;
            const elementsWeight = conversionElements(this.weights[i]);

            let column: elementType[] = [];
            for (let j = 0; j < columnLen; j++) {
                // 根据权重随机一个元素
                let element = sortProbability(Math.random(), elementsWeight);

                // 金币元素只能出现一个
                while (hasGold && element.name === gold) {
                    element = sortProbability(Math.random(), elementsWeight);
                }

                // 如果出现了金币 则记录
                if (element.name === gold) {
                    hasGold = true;
                    this.goldCount++;
                }

                column.push(element.name);
            }
            window.push(column as elementType[]);
        }
        return window;
    }

    /**
     * 计算收益
     * @param window 窗口
     */
    private calculateEarnings(window: elementType[][]) {
        // 查找中奖线
        let currentLines: LineResult[] = this.findWinLine(window);
        // 去掉含有金币的中奖线
        currentLines = this.removeGoldLine(currentLines);
        // 不走奖池的收益
        let baseProfit = new Big(0),
            // 走奖池的收益
            jackpotProfit = new Big(0);

        currentLines.forEach((line) => {
            // 第一个元素
            let first: any = line.elements[0];
            first = first[first.length - 1];

            // 地图元素走奖池奖励
            if (first !== map) {
                const profit = this.multiply === 0.1 ? awards[first][line.count - 3]  / 10
                    : awards[first][line.count - 3] * this.multiply;
                baseProfit = baseProfit.add(profit);
                line.win = profit;
            } else {
                const profit = this.multiply === 0.1 ? awards[first][line.count - 3]  / 10
                    : awards[first][line.count - 3] * this.multiply;
                jackpotProfit = baseProfit.add(profit);
                line.win = profit;
            }


        });

        return { currentLines, jackpotProfit: jackpotProfit.toNumber(), baseProfit: baseProfit.toNumber() };
    }

    /**
     * 查找中奖的连线
     * @param window
     */
    private findWinLine(window: elementType[][]) {
        // 这条线的元素
        let lines: LineResult[] = [], offsets = new Set();

        winLine.forEach(line => {
            const onceLine = { elements: [], winLine: [], count: 0, hasWild: false, type: null };
            window.forEach((elementLine, index) => {
                onceLine.elements.push(elementLine[line[index] - 1]);
            });

            line.forEach((pos, index) => {
                // 随机一个偏移量
                let offset = getOffset();

                // 偏移量只能出现一次
                while (offsets.has(offset)) {
                    offset = getOffset();
                }

                offsets.add(offset);

                onceLine.winLine[index] = { offset, index: pos };
            });

            lines.push(onceLine);
        });

        // 中奖线
        let currentWinLines = [];
        // 检索连线
        for (let i = 0; i < lines.length; i++) {
            // 替换wild元素
            const {hasWild, type} = this.replaceWild(lines[i].elements);
            lines[i].hasWild = hasWild;
            lines[i].type = type;
            // 计算这条线是元素几连
            let count = calculateLineResult(lines[i].elements, hasWild);

            // 如果连线大于3 则属于中奖
            if (count >= 3) {
                lines[i].count = count;
                currentWinLines.push(lines[i]);
            }
        }

        return currentWinLines;
    }

    /**
     * 去掉含有金币的中奖线
     * @param currentWinLines 中奖线
     */
    removeGoldLine(currentWinLines: LineResult[]) {
        let newLines = [];
        for (let i = 0; i < currentWinLines.length; i++) {
            if (currentWinLines[i].elements[0] !== gold &&
                currentWinLines[i].elements[1] !== gold &&
                currentWinLines[i].elements[2] !== gold) {
                newLines.push(currentWinLines[i]);
            }
        }
        return newLines;
    }

    /**
     * 替换wild也就是美人鱼元素
     * @param elementLine 元素线
     * @return 是否有特殊元素且被替换过
     */
    replaceWild(elementLine: elementType[]): {hasWild: boolean, type: elementType} {
        let hasWild = false, type = elementLine[0];

        // 如果有美人鱼wild元素
        if (elementLine.includes(smallMermaid)) {

            // 找到第一个不是wild的元素
            const other = elementLine.find(e => e !== smallMermaid);

            // 如果找到了 则代表必定会被替换
            if (other) {
                hasWild = true;
            }

            // 把这行是wild的元素替换成第一个不是wild的元素
            elementLine.forEach((e, index) => {
                if (e === smallMermaid) {
                    // 强制类型转换一下 前端需要
                    elementLine[index] = (other ? `${smallMermaid}-${other}` : smallMermaid) as elementType;

                    if (index === 0) {
                        type = other;
                    }
                }
            })
        }

        return {hasWild, type};
    }
}

/**
 * 创建slot开奖
 * @param roulette 轮盘
 */
export function createPirateLottery(roulette = calculateRoulette()): Lottery {
    return new Lottery(roulette);
}


/**
 * 计算这局使用轮盘
 * @return 返回轮盘
 */
function calculateRoulette(): '1' | '2' | '3' {
    const randomNum = Math.random();

    if (randomNum < 0.2) {
        return '1';
    } else if (randomNum < 0.5) {
        return '2';
    } else {
        return '3';
    }
}

/**
 * 修改初始窗口
 * 大美人鱼换小美人鱼
 */
function modifyInitialWindow(window: elementType[][]) {
    for (let i = 0; i < window.length; i++) {
        for (let j = 0; j < window[i].length; j++) {
            // 如果其中一个元素为大美人鱼 那么这一列都为小美人鱼
            if (window[i][j] === bigMermaid) {
                window[i].fill(smallMermaid);
            }
        }
    }
    return window;
}

/**
 * 转换元素
 * @param elements
 */
function conversionElements(elements: { [element in elementType]: number }) {
    return [
        { name: '0', probability: elements['0'] },
        { name: '1', probability: elements['1'] },
        { name: '2', probability: elements['2'] },
        { name: '3', probability: elements['3'] },
        { name: '4', probability: elements['4'] },
        { name: '5', probability: elements['5'] },
        { name: '6', probability: elements['6'] },
        { name: '7', probability: elements['7'] },
        { name: '8', probability: elements['8'] },
        { name: '9', probability: elements['9'] },
        { name: '10', probability: elements['10'] }
    ];
}

/**
 * 随机一个偏移量
 */
function getOffset(): number {
    let rand = Math.random() * random(-40, 40);
    while (rand < -40) {
        rand = Math.random() * 40;
    }
    return rand;
}


/**
 * 计算这条线几连
 * @param elementLine 元素线
 * @param hasWild 有wild元素并且被替换过
 */
function calculateLineResult(elementLine: elementType[], hasWild: boolean): number {
    // 元素几连线
    let count = 0;

    for (let i = 0; i < elementLine.length; i++) {
        if (i + 1 <= 4) {
            let current: any = elementLine[i];
            current = current[current.length - 1];
            let next: any = elementLine[i + 1];
            next = next[next.length - 1];

            // 如果当前元素不想等就退出
            if (current !== next) {
                break;
            }

            count = i + 2;
        } else {
            count = 5;
        }

    }
    return count;
}


function test() {
    const lottery = createPirateLottery('1');

    const result = lottery.setTotalBetAndMultiply(1000, 20)
        .setSystemWinOrLoss(false)
        .result();

    // if (result.totalWin > 3) {

    // console.log(result.winLines);
    console.log(result.totalWin);
    // }
}

//
// for (let i = 0; i < 10; i++) {
//     test();
// }