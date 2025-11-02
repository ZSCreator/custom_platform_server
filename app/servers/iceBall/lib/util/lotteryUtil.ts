import {
    elementType,
    oddsList,
    anyElement, MAX_SPECIAL_COUNT, specialElement, FREE_SPIN_COUNT, freeSpinOverlay, lineNumList
} from '../constant';
import {clone, findLastIndex, random, selectEle, selectElement} from "../../../../utils";
import {weights} from "../config/weights";
import {winLines as winLinesConfig} from "../config/winLines";


/**
 * 中奖线
 * @property index 第几条中奖线
 * @property linkNum 几连
 * @property linkIds 连接的元素
 * @property money 这条线收益
 * @property type 开奖类型
 * @property multiple 赔率
 */
export interface WinLine {
    index: number,
    linkNum: number,
    linkIds: elementType[],
    money: number,
    type: elementType,
    multiple: number
}

/**
 * @property elementType 中奖类型 默认返回空为未中奖
 * @property rewardType 中奖类型 赔率的下标 默认返回0 根据下标查找赔率
 * @property linkNum 元素几连 默认0
 */
interface LineResult {
    elementType: elementType,
    rewardType: 0 | 1 | 2,
    linkNum: number,
}


/**
 * 冰球突破开奖结果
 * @property window 开奖窗口
 * @property totalWin 总收益
 * @property roundWindows 所有消除窗口
 * @property totalMultiple 总倍率
 * @property assist 是否助攻
 * @property yAxis 助攻的Y轴
 * @property freeSpin 免费开奖
 * @property freeSpinResult 免费开奖结果
 */
export interface IceBallLotteryResult {
    window: elementType[][],
    totalWin: number,
    roundWindows: any[],
    totalMultiple: number,
    assist: boolean;
    yAxis: number;
    freeSpin: boolean,
    freeSpinResult: any[],
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
 * @property splitElementsCount 分散符号计数
 * @property weights 权重轮盘
 * @property window 窗口
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property totalMultiple 总赔率
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 * @property assist 是否助攻
 * @property yAxis 助攻的Y轴
 * @property freeSpinResult 免费开奖结果
 */
export class Lottery {
    newer: boolean;
    bet: number;
    totalBet: number = 0;
    totalWin: number = 0;
    jackpot: number = 0;
    splitElementsCount = 0;
    weights: { [element: string]: number }[];
    window: Window = [];
    roundWindows: any[] = [];
    totalMultiple: number = 0;
    controlState: 1 | 2 | 3 = 1;
    freeSpin: boolean = false;
    freeSpinResult: any[] = [];
    lineNum: number = 0;
    assist: boolean = false;
    yAxis: number = 0;


    constructor(newer: boolean, jackpot: number) {
        this.newer = newer;
        this.jackpot = jackpot;
    }

    private init() {
        this.totalWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.splitElementsCount = 0;
        this.roundWindows = [];
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.assist = false;
        this.yAxis = 0;
    }


    /**
     * 设置总押注
     * @param bet 底注
     * @param lineNum 下注线的数量
     */
    setTotalBet(bet: number, lineNum: number) {
        this.bet = bet;
        this.lineNum = lineNum;
        this.totalBet = bet * lineNum;
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
    result(): IceBallLotteryResult {
        // 选择元素权重
        this.selectWights();

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
    private stripResult(): IceBallLotteryResult {
        return {
            window: this.window,
            totalWin: this.totalWin,
            roundWindows: this.roundWindows,
            totalMultiple: this.totalMultiple,
            assist: this.assist,
            yAxis: this.yAxis,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
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

        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.roundWindows = result.roundWindows;
        this.totalWin = result.totalWin;
        this.totalMultiple = result.totalMultiple;

        // 如果分散元素大于大于三个
        if (this.freeSpin) {
            this.freeSpinLottery();
        }
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
     * 免费摇奖
     * @private
     */
    private freeSpinLottery() {
        let overly = 1;

        // 摇奖几次
        for (let i = 0; i < FREE_SPIN_COUNT; i++) {
            // 新生成一个窗口
            const window = this.generateWindow();
            const _window = JSON.parse(JSON.stringify(window));

            // 计算结果
            const result = this.calculateEarnings(window) as any;
            result.window  = _window;
            result.overly = overly;

            this.freeSpinResult.push(result);
        }
    }

    /**
     * 选择权重
     */
    private selectWights() {
        this.weights = (Object.keys(weights) as elementType[]).map((element) => {
            return {[element]: weights[element].weight};
        });
    }

    /**
     * 生成初始窗口
     */
    generateWindow() {
        // 行数以及列数
        const num = 5;
        const window = [];

        // 是否需要开启助攻
        this.needAssist();

        // 开奖矩阵 长高等款
        for (let i = 0; i < num; i++) {
            let line = [];

            while (line.length !== num) {
                // 随机一个元素
                const element = selectEle(this.weights);

                // 如果是百搭元素 普通游戏不能出现在一轴和二轴  免费游戏不能出现在一轴
                if (element === anyElement && (i === 0 || (!this.freeSpin && i === 1))) {
                    continue;
                }

                // 如果是分散元素则调控状态和免费开奖状态以及超过了最大数量则跳过
                if (element === specialElement) {
                    if (this.controlState !== 1 || this.freeSpin || this.splitElementsCount >= MAX_SPECIAL_COUNT ||
                        this.assist) {
                        continue;
                    }
                    this.splitElementsCount++;
                }

                line.push(element);
            }

            window.push(line);
        }

        // 如果需要助攻把助攻的y轴全部变为百搭符号
        if (this.assist && !this.freeSpin) {
            window[this.yAxis] = window[this.yAxis].map(v => anyElement);

            // 如果助攻需要必须保证中奖
            const selectLines: number[][] = winLinesConfig.slice(0, this.lineNum);
            const result  = selectLines.find((line) => {
                // 这条线上的元素
                const elementLine: elementType[] = line.map((l, i) => window[i][l - 1]);
                // 如果其中存在百搭元素,将其转成其第一个元素 第一行不会有百搭元素 所以这里不会报错
                elementLine.forEach((element, index) => {
                    if (element === anyElement) {
                        elementLine[index] = elementLine[0];
                    }
                });

                // 计算元素线中奖结果
                const lineResult: LineResult = this.calculateLineResult(elementLine);

                return !!lineResult.elementType;
            });

            if (!result) {
                this.assist = false;
                this.yAxis = 0;
                return this.generateWindow();
            }
        }

        return window;
    }

    /**
     * 是否需要助攻
     */
    needAssist() {
        // 免费游戏和调控状态不能有助攻
        if (!this.freeSpin && Math.random() < 0.01 && this.controlState === 1) {
        // if (!this.freeSpin && this.controlState === 1 && this.splitElementsCount < 3) {
            this.assist = true;
            this.yAxis = [2, 3, 4][random(0, 2)];
        }
    }

    /**
     * 计算收益
     */
    private calculateEarnings(window: elementType[][]) {
        // 选择中奖线
        const selectLines: number[][] = winLinesConfig.slice(0, this.lineNum);

        // 初始窗口元素消除
        const roundWindows = [];
        let {winLines, profit, clearPositions, totalMultiple} = this.eliminateWindowElements(window, selectLines, roundWindows.length);
        const oneRound = {
            window,
            clearPositions,
            winLines,
            profit,
        };


        roundWindows.push(oneRound);

        // 如果可消除元素不为空
        while (winLines.length) {
            // 补齐新窗口
            const {newly, window: newWindow} = this.subsequentWindow(window, clearPositions);

            window = newWindow;
            const result = this.eliminateWindowElements(window, selectLines, roundWindows.length);
            const oneRound = {
                window: newWindow,
                clearPositions: result.clearPositions,
                winLines: result.winLines,
                profit: result.profit,
                newly,
            };

            profit += result.profit;
            winLines = result.winLines;
            clearPositions = result.clearPositions;
            totalMultiple += result.totalMultiple;

            roundWindows.push(oneRound);
        }

        const lastWinLines = roundWindows[roundWindows.length - 1].winLines;
        const scatterProfit = this.judgeFreeSpin(lastWinLines);
        roundWindows[roundWindows.length - 1].profit = roundWindows[roundWindows.length - 1].profit + scatterProfit;
        profit += scatterProfit;

        return {totalWin: profit, roundWindows, totalMultiple};
    }

    /**
     * 计算中奖线
     * @param window 窗口
     * @param selectLines 选择的中奖线
     * @param roundCount 第几小回合
     */
    private eliminateWindowElements(window: Window, selectLines: number[][], roundCount: number): {
        winLines: WinLine[], profit: number, clearPositions: {x: number, y: number}[], totalMultiple: number
    } {
        // 中奖线
        let winLines: WinLine[] = [],
            // 累积收益
            profit = 0,
            // 清理线的坐标
            clearPositions = [],
            totalMultiple = 0;

        selectLines.forEach((line, index) => {
            // 这条线上的元素
            const elementLine: elementType[] = line.map((l, i) => window[i][l - 1]);
            // 先克隆一个当前元素的副本
            const transcript = clone(elementLine);

            // 如果其中存在百搭元素,将其转成其第一个元素 第一行不会有百搭元素 所以这里不会报错
            elementLine.forEach((element, index) => {
                if (element === anyElement) {
                    elementLine[index] = elementLine[0];
                }
            });

            // 计算元素线中奖结果
            const lineResult: LineResult = this.calculateLineResult(elementLine);

            // 如果有中奖元素
            if (lineResult.elementType) {
                // 中奖赔率
                const odds = weights[lineResult.elementType].clearAward[lineResult.rewardType];
                const lineProfit = this.bet * odds;
                profit += lineProfit;

                // 累计总赔率
                totalMultiple += odds;
                const linkIds = transcript.slice(0, lineResult.linkNum);

                // 保存消除的坐标
                line.slice(0, lineResult.linkNum).map((l, i) => clearPositions.push({x: i, y: l - 1}));

                winLines.push({ index, linkNum: lineResult.linkNum,
                    linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });

        if (this.freeSpin) {
            let odds = roundCount + 1;
            if (roundCount >= 5) {
                odds = 8;
            }

            profit *= odds;
        }

        return {winLines, profit, clearPositions: this.deduplication(clearPositions), totalMultiple};
    }

    /**
     * 去重
     * @param arr
     */
    private deduplication(arr: {x: number, y: number}[]) {
        const strSet = new Set();
        return arr.filter(c => {
            const s = `${c.x}${c.y}`;
            if (!strSet.has(s)) {
                strSet.add(s);
                return true;
            }

            return false;
        })
    }

    /**
     * 判断是否需要免费摇奖
     * @param winLines
     */
    judgeFreeSpin(winLines: WinLine[]) {
        let profit = 0;
        // 如果特殊元素大于3 触发免费旋转
        if (this.splitElementsCount >= 3 && !this.freeSpin) {
            this.freeSpin = true;
            const odds = weights[specialElement].clearAward[this.splitElementsCount - 3];
            profit  = odds * this.bet;
            winLines.push({ index: 89, linkNum: this.splitElementsCount,
                linkIds: (new Array(this.splitElementsCount)).fill(specialElement), money: profit, type: specialElement, multiple: odds });
        }

        return profit;
    }

    /**
     * 后续补全界面
     * @param window 当前窗口
     * @param clearPositions 清除的坐标系
     */
    private subsequentWindow(window: any[][], clearPositions: {x: number, y: number}[]) {
        // 克隆一个当前界面的副本
        const tag = 'del';
        let windowTranscript = clone(window);
        clearPositions.forEach(c => windowTranscript[c.x][c.y] = tag);

        // 元素降落
        for (let i in windowTranscript) {
            for (let j = windowTranscript[i].length - 1; j > 0; j--) {
                if (windowTranscript[i][j] === tag) {
                    const index = findLastIndex(v => v !== tag)(windowTranscript[i].slice(0, j));
                    if (index !== -1) {
                        [windowTranscript[i][j],  windowTranscript[i][index]] =
                            [ windowTranscript[i][index], windowTranscript[i][j]];
                    }
                }
            }
        }

        // 如果是免费游戏或者助攻不再生成分散元素
        const completionWeights = Object.keys(weights).map(element => {
            return (element === specialElement && (this.freeSpin || this.assist)) ? { key: element, value: 0 } :
                { key: element, value: weights[element].weight };
        });


        // 补全的行信息
        const newly = [];
        for (let i in windowTranscript) {
            const completionColumn = [];
            for (let j = windowTranscript[i].length - 1; j >= 0; j--) {
                if (windowTranscript[i][j] !== tag) {
                    continue;
                }

                // 如果是助攻 补全的也必然是any元素
                let element = (this.assist && this.yAxis === parseInt(i)) ? anyElement :
                    selectElement(completionWeights);

                if (element === anyElement && (parseInt(i) === 0 || (!this.freeSpin && parseInt(i) === 1))) {
                    while (element === anyElement) {
                        element = selectElement(completionWeights);
                    }
                }

                if (element === specialElement) {
                    if (this.splitElementsCount === 5) {
                        while (element === specialElement) {
                            element = selectElement(completionWeights);
                        }
                    } else {
                        this.splitElementsCount++;
                    }
                }

                windowTranscript[i][j] = element;
                completionColumn.push(windowTranscript[i][j]);
            }
            newly.push(completionColumn);
        }

        return { window: windowTranscript, newly}
    }

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     */
    private calculateLineResult(elementLine: elementType[]): LineResult {
        // 取第一个元素
        const firstElement = elementLine[0];
        let result: LineResult = {elementType: null, rewardType: 0, linkNum: 0};

        // 如果第一个元素是分散元素 元素则不进行判断
        if (firstElement === specialElement) {
            return result;
        }

        // 如果不是特殊元素则判断第二元素是否相等 不相等也同样没有继续判断的价值
        if (firstElement !== elementLine[1]) {
            return result;
        }

        switch (true) {
            // 单元素五连
            case elementLine.every(element => element === firstElement): {
                result.linkNum = 5;
                result.elementType = firstElement;
                result.rewardType = 2;
                break;
            }

            // 单元素四连
            case elementLine.slice(0, 4).every(element => element === firstElement) : {
                result.elementType = firstElement;
                result.rewardType = 1;
                result.linkNum = 4;
                break;
            }

            // 元素3连
            case elementLine.slice(0, 3).every(element => element === firstElement): {
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
}


/**
 * 创建冰球突破开奖
 * @param newer 是否是新玩家
 * @param jackpotGoldNum 奖池金币数量
 */
export function crateIceBallLottery(newer: boolean, jackpotGoldNum: number): Lottery {
    return new Lottery(newer, jackpotGoldNum);
}

/**
 * 判断该下注数和下注倍数是否合理
 * @param betNum
 * @param lineNum
 */
export function isHaveBet (betNum: number, lineNum: number): boolean{
    return oddsList.includes(betNum) && lineNumList.includes(lineNum);
}



function test() {
    const lottery = crateIceBallLottery(false,  0);

    return lottery.setTotalBet(10, 18)
        // .setSystemWinOrLoss(false)
        .result();
}

// function test1() {
//     const lottery = crateIceBallLottery(false,  0);
//
//
//     return lottery.setTotalBet(3)
//         .setDetonatorCount(10)
//         .result();
// }


// for (let i = 0; i < 500; i++) {
//     const result = test();

    // console.log(result.window)
    //
    // if (result.totalWin > 3) {
    //     console.
    //     console.log(result.freeSpinResult.length);
    // }
    //
    //
    // console.log(test1());
// }
// console.timeEnd('1')



