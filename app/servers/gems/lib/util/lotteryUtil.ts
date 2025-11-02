import { default as config, elementType, prizeType } from "../constant";
import { clone, random, selectElement } from '../../../../utils';


// 一个scatter 图标生成概率
const ONE_SCATTER_PROBABILITY = 0.1555;
// 两个scatter 图标生成概率
const TWO_SCATTER_PROBABILITY = 0.0242;
// 3 scatter 图标生成概率
const OTHER_SCATTER_PROBABILITY = 0.0018;


/**
 * 判断选线是否合理
 */
export const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= config.winLines.length;

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
    linkIds: elementType[],
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
    freeSpinResult: FreeSpinResult[];
}

/**
 * 免费摇奖的结果
 * @property window 窗口
 * @property totalWin 盈利
 * @property winLines 中奖线
 */
interface FreeSpinResult {
    freeSpin: boolean;
    odds: number,
    window: elementType[][],
    totalWin: number,
    winLines: WinLine[],
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
    openPoolAward: boolean = false;
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
    freeSpinResult: FreeSpinResult[] = [];

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
        this.freeSpinResult = [];
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
    private selectWights() {
        let weights: { [element: string]: number[] };

        const roulette = this.roulette;

        // 是新人就直接使用第一个轮盘
        if (this.newer) {
            weights = clone(config.weights['1']);
        } else {
            weights = clone(config.weights[roulette]);

            // 如果轮盘不为3
            // if (roulette !== '3') {
            //     // 整体调控 属于收奖调控 降低 wild元素出现的权重
            //     if (this.overallControl) {
            //         weights.W = weights.W.map(element => element += config.overallControlSetting[roulette]);
            //     }

            //     // 单体调控一 属于放奖体调控 提高 wild元素出现的权重
            //     if (this.singleControlOne) {
            //         weights.W = weights.W.map(element => element += config.singleControlSetting[roulette][0]);
            //     }

            //     // 单体调控二 属于放奖体调控 提高 wild元素出现的权重
            //     if (this.singleControlTwo) {
            //         weights.W = weights.W.map(element => element += config.singleControlSetting[roulette][1]);
            //     }
            // }
        }

        // 如果不开奖池奖 (第四列或者第五列不开wild和7)
        if (this.openPoolAward) {
            const index = Math.random() < 0.5 ? 3 : 4;

            if (index === 3) weights.W[index] = 0;

            // config.sevenElementGroup.forEach(element => weights[element][index] = 0);
        }

        this.weights = weights;
    }

    /**
     * 生成窗口
     */
    generateWindow(): elementType[][] {
        const window: elementType[][] = [];
        const elementKeys = Object.keys(this.weights);

        // 生成一个矩阵
        for (let i = 0; i < config.column; i++) {
            const elementSet = elementKeys.map(element => {
                return { key: element, value: this.weights[element][i] };
            });

            // 一列
            const line = [];
            do {
                // 随机选择一个元素
                let element = selectElement(elementSet);
                if (line.includes("E") && element == "E") {
                    continue;
                }
                line.push(element);
            } while (line.length < config.row);
            // if (i == 0 || i == 1) {
            //     let Line1: any[] = ["W", "W", "W"];
            //     window.push(Line1);
            // } else {
            window.push(line);
            // }

        }

        return window;
    }

    /**
     * 修改初始窗口
     */
    private modifyInitialWindow() {
        // 判断是否添加 scatter 元素
        // this.scatterCount = this.getScatterNumber();
        console.warn("scatterCount:", this.scatterCount);
        // 如果scatter元素为0 则直接返回
        if (this.scatterCount === 0) {
            return;
        }
        // 中奖的元素坐标
        let winCoordinates: Set<string> = new Set();

        // 选择中奖线
        const selectLines = config.winLines.slice(0, this.lineNum);

        selectLines.forEach((line) => {
            // 这条线上的元素
            const elementLine: elementType[] = line.map((l, i) => this.window[i][l - 1]);

            // 如果其中存在wild元素,将其转成其前一个元素 第一行不会有 wild 元素 所以这里不会报错
            //  elementLine.forEach((element, index) => {
            //      if (element === config.wild) {
            //          elementLine[index] = elementLine[index - 1];
            //      }
            //  });

            // 计算元素线中奖结果
            const lineResult: LineResult = this.calculateLineResult(elementLine);

            // 如果有中奖元素 则记录下元素的坐标
            if (lineResult.elementType) {
                const coordinates: string[] = line.slice(0, lineResult.linkNum).map((l, i) => `${i}-${l - 1}`);
                coordinates.forEach(c => winCoordinates.add(c));
            }
        });

        // 先转换窗口的所有坐标
        let allCoordinates: string[] = [];
        this.window.forEach((column, columnNumber) => {
            column.forEach((element, rowNumber) => allCoordinates.push(`${columnNumber}-${rowNumber}`));
        });

        // 找出没有中奖的坐标
        const lossCoordinates: Set<string> = new Set();
        allCoordinates.forEach(c => !winCoordinates.has(c) && lossCoordinates.add(c));

        // 如果没有未中奖的坐标或者够替换的坐标不够 则随机替换 4、5列的坐标
        if (lossCoordinates.size < this.scatterCount) {
            // 取所有的坐标的最后六个 为四五列坐标
            allCoordinates.slice(allCoordinates.length - 6).forEach(c => lossCoordinates.add(c));
        }

        let alternateCoordinates = [...lossCoordinates];

        // 替换元素
        for (let i = 0; i < this.scatterCount; i++) {
            // 随机一个坐标
            const coordinate = alternateCoordinates[random(0, alternateCoordinates.length - 1)];

            const realCoordinate = coordinate.split('-').map(p => Number(p));

            // 替换元素
            this.window[realCoordinate[0]][realCoordinate[1]] = "E";

            // 过滤掉已经替换的坐标
            alternateCoordinates = alternateCoordinates.filter(c => c !== coordinate);
        }
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

        selectLines.forEach((line, index) => {
            // 这条线上的元素
            const elementLine: elementType[] = line.map((l, i) => window[i][l - 1]);
            // 先克隆一个当前元素的副本
            const transcript = clone(elementLine);

            // 如果其中存在wild元素,将其转成其前一个元素 第一行不会有 wild 元素 所以这里不会报错
            // elementLine.forEach((element, index) => {
            //     if (element === config.wild) {
            //         elementLine[index] = elementLine[index - 1];
            //     }
            // });

            // 计算元素线中奖结果
            const lineResult: LineResult = this.calculateLineResult(elementLine);

            // 如果有中奖元素
            if (lineResult.elementType) {

                // 中奖赔率
                const odds = config.award[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds;
                totalWin += lineProfit;

                // 如果是跟7 相关的会扣除奖池金额
                // if (lineResult.rewardType === 2) {
                //     this.jackpotWin += lineProfit;
                // }

                // 累计总赔率
                this.totalMultiple += odds;

                let linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });
        let scatterCount = this.getScatterNumber(window);
        if (scatterCount >= 3) {
            const odds = config.award["E"][0];
            const lineProfit = this.bet * odds;
            totalWin += lineProfit;
            // winLines.push({ index: -1, linkNum: 3, linkIds: [], money: lineProfit, type: "E", multiple: odds });
        }
        return { winLines, totalWin };
    }

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     * @param direction 0左 1 右
     */
    private calculateLineResult(elementLine: elementType[]): LineResult {
        // 取第一个元素
        const firstElement = elementLine.find(c => c != "E");

        let result: LineResult = { elementType: null, rewardType: 0, linkNum: 0, prizeType: 'none' };

        switch (true) {
            // 元素3连
            case elementLine.slice(0, 3).every(element => element === firstElement ||
                element == "E"): {
                    result.elementType = firstElement;
                    result.rewardType = 0;
                    result.linkNum = 3;
                    break;
                }
            default:
                // throw new Error(`未判断的情况 元素线: ${elementLine}`);
                break;
        }

        return result;
    }
    private freeSpinLottery() {
        this.freeSpin = true;
        this.weights = clone(config.weights['1']);
        // 摇奖几次
        let len = config.freeSpinMapping;
        let Idx = 0;
        do {
            Idx++;
            // 新生成一个窗口
            let window = this.generateWindow();
            let scatterCount = this.getScatterNumber(window);
            if (scatterCount >= 3) {
                len = 18;
            }
            // 计算结果
            let result = this.calculateEarnings(window);
            let odds = Idx > 9 ? 9 : Idx;
            this.freeSpinResult.push({ odds, freeSpin: scatterCount >= 3 ? true : false, winLines: result.winLines, totalWin: result.totalWin * odds, window });
        } while (Idx < len);
    }
    /**
     * 获取Scatter字符个数
     */
    private getScatterNumber(window: elementType[][]): number {
        let scatterCount = 0;
        for (const Tmp of window) {
            scatterCount += Tmp.filter(c => c == "E").length;
        }
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
/**
 * 
 * @param NewGrid 抽中的球
 * @param Grid 存档网格
 */
export function GetTotalMultiple(NewGrid: number[], Grid: number[]) {
    let lin1 = Grid.slice(0, 5);
    let lin2 = Grid.slice(5, 10);
    let lin3 = Grid.slice(10, 15);
    // console.warn(lin1);
    // console.warn(lin2);
    // console.warn(lin3);
    let res1 = lin1.every(c => NewGrid.includes(c));
    let res2 = lin2.every(c => NewGrid.includes(c));
    let res3 = lin3.every(c => NewGrid.includes(c));
    // console.warn(NewGrid);
    // console.warn(res1, res2, res3);
    if (res1 && res2 && res3) {
        return 1000;
    }

    if ([0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14].every(c => NewGrid.includes(Grid[c])) &&
        [6, 7, 8].every(c => !NewGrid.includes(Grid[c]))) {
        return 500;
    } else if ([0, 4, 5, 6, 7, 8, 9, 10, 14].every(c => NewGrid.includes(Grid[c])) &&
        [1, 2, 3, 11, 12, 13].every(c => !NewGrid.includes(Grid[c]))) {
        return 300;
    } else if (res1 && res3) {
        return 200;
    }

    if (res1 && res2) {
        return 100;
    } else if (res2 && res3) {
        return 100;
    }
    if (res1) {
        return 50;
    } else if (res2) {
        return 50;
    } else if (res3) {
        return 50;
    }
    return 0;
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