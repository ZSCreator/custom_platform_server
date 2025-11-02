import {
    elementType,
    ordinaryElements,
    baseBetList,
    // oddsList,
    scatter,
    Multiples,
} from '../constant';
import * as utils from "../../../../utils";
import * as weightsC from "../config/weights";

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
    winningDetails: WinningDetail[][],
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
 * @property weights 权重轮盘
 * @property window 窗口
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property totalMultiple 总赔率
 * @property awards 每个窗口的盈利结果
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 * @property winningDetails 中奖具体详情
 */
export class Lottery {
    newer: boolean;
    bet: number;
    totalBet: number = 0;
    totalWin: number = 0;
    jackpot: number = 0;

    // clearAll: elementType;
    weights: { [element: string]: number }[];
    window: Window = [];
    roundWindows: { type: elementType; }[][][] = [];
    totalMultiple: number = 0;
    awards: number[] = [];

    controlState: 1 | 2 | 3 = 1;
    winningDetails: WinningDetail[][] = [];
    clearElements: any[] = [];
    scatterCount: number;
    freeSpinResult: PharaohLotteryResult[] = [];
    freeSpin: boolean;


    constructor(newer: boolean, jackpot: number) {
        this.newer = newer;
        this.jackpot = jackpot;
    }

    private init() {
        this.totalWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        // this.needGenerateBigDetonator = false;
        this.roundWindows = [];
        // this.clearAll = undefined;
        this.awards = [];
        this.winningDetails = [];
        this.clearElements = [];
        this.freeSpinResult = [];
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
        // this.gameLevel = calculateGameLevel(this.detonatorCount);

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
            freeSpinResult: this.freeSpinResult,
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
        // 
        this.scatterCount = this.calculatefreeSpin(this.window);
        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.roundWindows = result.roundWindows;
        this.totalWin = result.totalWin;
        // this.clearAll = result.clearAll as any;
        this.awards = result.awards;
        this.totalMultiple = result.totalMultiple;
        this.winningDetails = result.winningDetails;
        this.clearElements = result.clearElements;

        // 如果scatter字符大于等于3免费开开奖
        if (this.scatterCount >= 4) {
            this.freeSpinLottery();
        }
    }

    freeSpinLottery() {
        this.freeSpin = true;
        // 摇奖几次
        let len = 10;
        let Idx = 0;
        do {
            Idx++;
            // 新生成一个窗口
            const window = this.generateWindow(true);
            let scatterCount = this.calculatefreeSpin(window);

            // 计算结果
            const result = this.calculateEarnings(window);
            result.winningDetails;
            result.window = window;
            result.freeSpin = false;
            if (scatterCount >= 3 && len < 20) {
                len += 5;
                result.freeSpin = true
            }
            this.freeSpinResult.push(result);
        } while (Idx < len);
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
     * 选择权重
     */
    private selectWights() {
        this.weights = (Object.keys(weightsC.weights) as elementType[]).map((element) => {
            // 如果是特殊元素
            // if (specialElements.includes(element)) {
            //     // 如果已经生成了大雷管 则不进行生成
            //     if (this.needGenerateBigDetonator) {
            //         return { [element]: 0 };
            //     }
            //     let V = weightsC.weights[element].weight[this.gameLevel];
            //     return { [element]: V };
            // }

            return { [element]: weightsC.weights[element].weight };
        });
    }

    /**
     * 生成初始窗口
     */
    generateWindow(twoStrategy: boolean = false) {
        // return [
        //     ["F", "B", "G", "A", "A"],
        //     ["H", "A", "F", "A", "A"],
        //     ["D", "A", "E", "G", "D"],
        //     ["A", "D", "B", "I", "I"],
        //     ["A", "C", "D", "I", "H"],
        //     ["A", "B", "I", "D", "Scatter"]
        // ] as elementType[][];
        const window: elementType[][] = [];
        // 开奖矩阵 长高等款
        for (let i = 0; i < 6; i++) {
            let line = [];

            while (line.length !== 5) {
                // 随机一个元素
                const element = utils.selectEle(this.weights);
                line.push(element);
            }

            window.push(line);
        }
        // console.warn(window);
        if (twoStrategy && utils.random(0, 100) <= 30) {
            window[utils.random(0, 5)][utils.random(0, 4)] = "BOW";
        }
        return window;
    }


    /**
     * 计算收益
     */
    private calculateEarnings(window: elementType[][]) {
        // 改变首个窗口
        // this.roundWindows.push(this.changeFirstWindow());
        // let roundWindows: { type: elementType; }[][][] = [];
        let roundWindows = [];
        // roundWindows.push(this.changeFirstWindow());

        // 初始窗口元素消除
        let conversionPoints = this.eliminateWindowElements(window);

        // this.clearAll = randomType;
        // let clearAll: elementType = randomType;
        let clearElements: any[] = [];
        let totalMultiple = 0;
        let awards: number[] = [];
        let winningDetails: WinningDetail[][] = [];
        // 如果可消除元素不为空
        while (!utils.isVoid(conversionPoints)) {
            // 查看可消除元素盈利情况
            const { result: winAward, winningDetails: Tmp } = this.calculateClearElementProfit(conversionPoints);
            winningDetails.push(Tmp)
            // this.clearElements.push(clearCoordinates);
            clearElements.push([conversionPoints]);

            totalMultiple += winAward.windowAward;


            awards.push(winAward.windowAward * this.totalBet);

            // 补齐新窗口
            const result = this.subsequentWindow(window, conversionPoints);
            // 把要删除的位置放入
            roundWindows.push(result.position);
            // 新的界面
            roundWindows.push(result.newly);
            roundWindows.push(result.window);
            window = result.window;
            conversionPoints = this.eliminateWindowElements(window);
        }
        let odds = 1;
        if (this.IsHasBOW(window)) {
            odds = 2;
        }
        // 最终收益
        let totalWin = totalMultiple * this.totalBet * odds;
        let result: PharaohLotteryResult = {
            // clearAll,
            clearElements,
            totalMultiple,
            awards,
            totalWin,
            window,
            winningDetails,
            roundWindows,
            odds: odds,
        }
        return result;
    }

    /**
     * 消除窗口元素
     * @param window 窗口
     */
    private eliminateWindowElements(window: Window): { [x: string]: number[][] } {
        // 根据元素类型归类坐标
        let typePoints: { [x: string]: number[][] } = {};
        window.forEach((elements, index) => {
            elements.forEach((element, i) => {
                if (!typePoints[element]) {
                    typePoints[element] = [];
                }

                typePoints[element].push([index, i]);
            });
        });
        // console.warn("window", window);
        // console.warn("typePoints", typePoints);
        // 需要被消除的元素
        let conversionPoints: { [x: string]: number[][] } = {};
        // 随机消除元素
        // randomType;

        for (let type in typePoints) {
            let Count = 8;
            if (type == "Scatter") {
                Count = 4;
            }
            if (typePoints[type].length >= Count) {
                conversionPoints[type] = typePoints[type];
            }
        }
        // console.warn("conversionPoints", conversionPoints);
        return conversionPoints;
    }

    /**
     * 后续补全界面
     * @param window 当前窗口
     * @param clearCoordinates 需要消除的坐标
     */
    private subsequentWindow(window: any[][], clearCoordinates: { [key: string]: any[] }) {
        // 克隆一个当前界面的副本
        let windowTranscript = utils.clone(window);

        let clears = [];
        for (let e in clearCoordinates) {
            clearCoordinates[e].forEach(coordinates => {
                clears.push(coordinates);
                // coordinates.forEach(c => clears.push(c));
            })
        }

        // 标记要删除的元素
        let position = [];
        clears.forEach(c => {
            windowTranscript[c[0]][c[1]] = 'del';
            position.push({ x: Number(c[0]), y: Number(c[1]) });
        });

        // 元素降落
        for (let i in windowTranscript) {
            for (let j = windowTranscript[i].length - 1; j > 0; j--) {
                if (windowTranscript[i][j] === 'del') {
                    const index = utils.findLastIndex(v => v !== 'del')(windowTranscript[i].slice(0, j));
                    if (index !== -1) {
                        [windowTranscript[i][j], windowTranscript[i][index]] =
                            [windowTranscript[i][index], windowTranscript[i][j]];
                    }
                }
            }
        }
        // console.warn("windowTranscript", windowTranscript);
        // 新补全窗口不再生成特殊元z素
        let completionWeights = Object.keys(weightsC.weights).map(element => {
            return { key: element, value: weightsC.weights[element].weight };
        });
        completionWeights = completionWeights.filter(c => c.key != "Scatter");
        // 补全的行信息
        const newly = [];
        for (let i in windowTranscript) {
            const completionColumn = [];
            for (let j in windowTranscript) {
                if (windowTranscript[i][j] === 'del') {
                    windowTranscript[i][j] = utils.selectElement(completionWeights);
                    completionColumn.push({ type: windowTranscript[i][j] });
                } else {
                    break;
                }
            }
            newly.push(completionColumn);
        }
        // console.warn("windowTranscript", windowTranscript);
        // console.warn("newly", newly);
        // console.warn("position", position);
        return { window: windowTranscript, newly, position }
    }

    /**
     * 计算是否Scatter
     */
    private calculatefreeSpin(window: Window) {
        let Count = 0;
        for (const elements of window) {
            for (const element of elements) {
                if (element == "Scatter") {
                    Count++;
                }
            }
        }
        return Count;
    }
    private IsHasBOW(window: Window) {
        let Count = 0;
        for (const elements of window) {
            for (const element of elements) {
                if (element == "BOW") {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * 计算消除元素的收益
     * @param clearCoordinates 消除的元素以及坐标
     */
    private calculateClearElementProfit(clearCoordinates: { [key: string]: any[] }) {
        let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0 };
        let winningDetails: WinningDetail[] = [];
        for (let e in clearCoordinates) {

            // if (ordinaryElements.includes(e)) {
            // 如果是普通元素
            result[e] = {};
            // 先获取赔率
            const elementOddsConfig = weightsC.weights[e].clearAward;

            // for (let i in clearCoordinates[e]) {
            const len = clearCoordinates[e].length;
            let odds: number;
            if (e == "Scatter") {
                if (len == 4) {
                    odds = elementOddsConfig[0];
                } else if (len == 5) {
                    odds = elementOddsConfig[1];
                } else if (len >= 6) {
                    odds = elementOddsConfig[2];
                }
            } else {
                if (len == 8 || len == 9) {
                    odds = elementOddsConfig[0];
                } else if (len == 10 || len == 11) {
                    odds = elementOddsConfig[1];
                } else if (len >= 12) {
                    odds = elementOddsConfig[2];
                }
            }
            winningDetails.push({ type: e as elementType, num: len, odds, win: odds * this.totalBet })
            result.windowAward += odds;
            result[e]['group'] = { award: odds };
        }
        result.jackpotMoney = this.jackpot;
        return { result, winningDetails };
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


/**
 * 根据雷管计算当前计算当前关卡等级
 * @param detonatorCount
 */
export function calculateGameLevel(detonatorCount: number) {
    return Math.floor(detonatorCount / 15) % 3 + 1;
}

/**
 * 获取投掷点数
 */
export function getThrowingCount(): number {
    return utils.random(1, 6);
}




/**
 * 在n*n的数组中随机一个2*2的矩形
 * @param n
 */
function randomSquare(n): string[] {
    if (n < 2) {
        throw new Error(`参数有误 ${n}`);
    }
    const first = [utils.random(0, n - 1), utils.random(0, n - 1)];
    const others = [first[0] + '' + first[1]];

    // 随即一个和first距离为根号2的点
    (function () {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (Math.pow(i - first[0], 2) + Math.pow(j - first[1], 2) == 2) {  //(i ,j)满足条件
                    others.push(i + '' + j);
                    if (i > first[0]) {
                        others.push(first[0] + '' + j, i + '' + first[1]);
                        return;
                    } else {
                        others.push(i + '' + first[1], first[0] + '' + j);
                        return;
                    }
                }
            }
        }
    })();
    return others;
}


/**
 * 检查两个坐标是否相等
 * @param pointOne 坐标一
 * @param pointTwo 坐标二
 */
function isAdjacent(pointOne: number[], pointTwo: number[]): boolean {
    return Math.sqrt(Math.pow(pointOne[0] - pointTwo[0], 2) + Math.pow(pointOne[1] - pointTwo[1], 2)) === 1;
}



/**
 * 判断两个集合数据结构是否相等
 * @param setOne 集合一
 * @param setTwo 集合二
 */
function isEqualSet(setOne: Set<string>, setTwo: Set<string>) {
    return new Set([...setOne].filter(x => !setTwo.has(x))).size == 0 &&
        new Set([...setTwo].filter(x => !setOne.has(x))).size == 0
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
