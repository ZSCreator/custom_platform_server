import { default as config, elementType, prizeType, Points } from "../constant";
import { clone, random, selectElement } from '../../../../utils';
import * as utils from "../../../../utils";
import { award } from "../config/award";
import { fixNoRound } from "../../../../utils/lottery/commonUtil";




/**
 * 中奖线
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
    window: { e: elementType; p: number; value: number; }[],
    jackpotWin: number,
    winLines: WinLine,
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
    // freeSpin: boolean;
    // odds: number,
    window: { e: elementType; p: number; New?: number }[],
    totalWin: number,
    winLines: WinLine,
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
    window: { e: elementType; p: number; value: number; New?: number }[] = [];
    winLines: WinLine;
    totalMultiple: number = 0;
    controlState: 1 | 2 | 3 = 1;
    // scatterCount: number;
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
        this.winLines = null;
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
        try {
            // 初始化
            this.init();

            // 生成窗口
            this.window = this.generateWindow();

            // 是否生成 Wild
            const HasFree = this.get5BNumber(this.window);

            // 计算收益
            const result = this.calculateEarnings(this.window);
            this.winLines = result.winLines;
            this.totalWin += result.totalWin;
            if (HasFree) {
                this.freeSpinLottery();
            }
        } catch (err) {
            console.warn(err);
        }
    }

    /**
     * 调控开奖
     */
    private controlLottery() {
        for (let i = 0; i < 200; i++) {
            this.randomLottery();

            if (this.controlState === 2 && this.freeSpinResult.reduce((sum, value) => sum + value.totalWin, this.totalWin) <= this.totalBet) {
                break;
            }

            if (this.controlState === 3 && this.freeSpinResult.reduce((sum, value) => sum + value.totalWin, this.totalWin) > this.totalBet) {
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
        // if (this.newer) {
        weights = clone(config.weights['1']);
        // } else {
        // weights = clone(config.weights[roulette]);
        // }

        // 如果不开奖池奖 (第四列或者第五列不开wild和7)
        if (this.openPoolAward) {
            const index = Math.random() < 0.5 ? 3 : 4;

            if (index === 3) weights.W[index] = 0;

            // config.sevenElementGroup.forEach(element => weights[element][index] = 0);
        }

        this.weights = weights;
    }
    get5BNumber(window: { e: elementType; p: number; }[]) {
        const length = window.filter(c => c.e == "H").length;
        return length >= 5 || false;
    }

    /**
     * 生成窗口
     */
    generateWindow(twoStrategy = false) {
        let window: { e: elementType, p: number, value: number }[] = [];
        const elementKeys = Object.keys(this.weights);
        // 生成一个矩阵
        const elementSet = elementKeys.map(element => {
            return { key: element, value: this.weights[element][0] };
        });
        do {
            // 随机选择一个元素
            let element = selectElement(elementSet) as elementType;
            if (twoStrategy && element == "W") {
                continue;
            }
            let opt = { e: element, p: 0, value: 0 };
            if (element == "H") {
                opt.p = Points[utils.random(0, Points.length - 1)];
            }
            window.push(opt);
        } while (window.length < 9);
        let r = Math.random();
        if (r <= 0.8) {
            window[4] = { e: "W", p: 0, value: 0 };
        }
        // if (r <= 0.3) {
        //     window[0] = { e: "H", p: Points[utils.random(0, Points.length - 1)], value: 0 };
        //     window[1] = { e: "H", p: Points[utils.random(0, Points.length - 1)], value: 0 };
        //     window[2] = { e: "H", p: Points[utils.random(0, Points.length - 1)], value: 0 };
        //     window[3] = { e: "H", p: Points[utils.random(0, Points.length - 1)], value: 0 };
        //     window[5] = { e: "H", p: Points[utils.random(0, Points.length - 1)], value: 0 };
        // }
        return window;
    }

    /**
     * 计算收益
     */
    private calculateEarnings(window: { e: elementType; p: number; }[]) {
        // 中奖线
        let winLines: WinLine;
        let totalWin = 0;
        for (let idx = 0; idx < window.length; idx++) {
            const element = window[idx].e;
            if (idx == 5) {
                continue;
            }
            const length = window.filter(c => c.e == element || (c.e == "W" && element != "H")).length;
            if (length >= 5) {
                if (element == "H") {
                    winLines = { linkNum: length, type: element, multiple: 0, money: 0 };
                } else {
                    const multiple = award[element][length - 5];
                    const money = fixNoRound(this.totalBet * multiple);
                    winLines = { linkNum: length, type: element, multiple, money };
                    totalWin = money;
                }
                break;
            }
        }
        return { winLines, totalWin };
    }

    private freeSpinLottery() {
        this.freeSpin = true;
        let Num = 3;
        for (const el of this.window) {
            el.value = el.p / 50 * this.totalBet;
            this.totalWin += el.value;
        }
        let oldWindow = utils.clone(this.window);
        do {
            Num--;
            // 新生成一个窗口
            let window = this.generateWindow(true);
            // 计算结果
            let result = this.calculateEarnings(window);
            for (let x = 0; x < window.length; x++) {
                const ex = window[x];
                oldWindow[x].e = ex.e;
                oldWindow[x].p = ex.p;
                delete oldWindow[x]["New"];
                if (ex.e == "H") {
                    if (oldWindow[x].value == 0) {
                        oldWindow[x]["New"] = 1;
                        Num = 3;
                    }
                    oldWindow[x].value += ex.p / 50 * this.totalBet;
                    result.totalWin += ex.p / 50 * this.totalBet;
                }
            }
            this.freeSpinResult.push({ winLines: result.winLines, totalWin: result.totalWin, window: utils.clone(oldWindow) });
            if (Num == 0) {
                break;
            }
        } while (true);
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

    const result = lottery.setBetAndLineNum(3, 5)
        .setTotalBet(3)
        .setInternalControl(false, false, false)
        .setSystemWinOrLoss(false)
        .result();

    // if (result.totalWin > 3) {
    console.log(JSON.stringify(result));
    // }
}

// for (let i = 0; i < 100; i++) {
test();
// }

