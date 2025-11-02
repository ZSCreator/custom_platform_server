import {baseElements, ColorType, default as config, elementType, specialAward, specialElements} from "../constant";
import {clone, random, selectElement} from '../../../../utils';


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
 * @property scatterCount 特殊元素数量
 */
export interface SlotResult {
    window: elementType[][],
    winLines: WinLine[],
    totalWin: number,
    multiple: number,
    freeSpin: boolean;
    freeSpinResult: FreeSpinResult[];
    freeSpinSpecialElement: elementType;
    scatterCount: number;
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
 * @property scatterCount 特殊元素数量
 */
interface FreeSpinResult {
    window: elementType[][],
    totalWin: number,
    lastWindow: elementType[][]
    winLines: WinLine[],
    scatterCount: number,
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
 * @property lineNum 选线
 * @property totalWin 总收益
 * @property weights 权重轮盘
 * @property window 窗口
 * @property winLines 中奖线
 * @property totalMultiple 总赔率
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 * @property freeSpin 免费摇奖
 * @property scatterCount 特殊字符个数
 * @property freeSpinResult 免费开奖结果
 * @property freeSpinSpecialElement 免费游戏特殊元素
 */
export class Lottery {
    newer: boolean;
    roulette: '1' | '2' | '3';
    overallControl: boolean;
    singleControlOne: boolean;
    singleControlTwo: boolean;
    bet: number;
    totalBet: number = 0;
    lineNum: number;
    totalWin: number = 0;
    weights: {[element: string]: number[]};
    window: elementType[][] = [];
    winLines: WinLine[] = [];
    totalMultiple: number = 0;
    controlState: 1 | 2 | 3 = 1;
    freeSpin: boolean = false;
    scatterCount: number = 0;
    freeSpinResult: FreeSpinResult[] = [];
    freeSpinSpecialElement: elementType = null;

    constructor(newer: boolean, roulette: '1' | '2' | '3') {
        this.newer = newer;
        this.roulette = roulette;
    }

    private init() {
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.scatterCount = 0;
        this.freeSpin = false;
        this.freeSpinResult = [];
        this.freeSpinSpecialElement = null;
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
     * 设置内部调控
     * @param overallControl
     * @param singleControlOne
     * @param singleControlTwo
     */
    setInternalControl( overallControl: boolean, singleControlOne: boolean, singleControlTwo: boolean) {
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
            winLines: this.winLines,
            totalWin: this.totalWin,
            multiple: this.totalMultiple,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
            scatterCount: this.scatterCount,
            freeSpinSpecialElement: this.freeSpinSpecialElement,
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

        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        this.scatterCount = result.scatterCount;
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
        let weights: {[element: string]: number[]};

        const roulette = this.roulette;

        // 是新人就直接使用第一个轮盘
        if (this.newer) {
            weights = clone(config.weights['1']);
        } else {
            weights = clone(config.weights[roulette]);

            // 如果轮盘不为3
            if (roulette !== '3') {
                // 整体调控 属于收奖调控 降低 wild元素出现的权重
                if (this.overallControl) {
                    weights.W = weights.W.map(element => element + config.overallControlSetting[roulette]);
                }

                // 单体调控一 属于放奖体调控 提高 wild元素出现的权重
                if (this.singleControlOne) {
                    weights.W = weights.W.map(element => element + config.singleControlSetting[roulette][0]);
                }

                // 单体调控二 属于放奖体调控 提高 wild元素出现的权重
                if (this.singleControlTwo) {
                    weights.W = weights.W.map(element => element + config.singleControlSetting[roulette][1]);
                }
            }
        }

        this.weights = weights;
    }

    /**
     * 生成窗口
     */
    generateWindow(): elementType[][] {
        const window:elementType[][] = [];
        const elementKeys = Object.keys(this.weights);
        let scatterCount = 0;

        // 生成一个矩阵
        for (let i = 0; i < config.column; i++) {
            const elementSet =  elementKeys.map(element => {
                // 如果是wild的元素 如果数量超过了特殊元素数量或者不是随机状态则不开wild元素
                if (element === config.wild && ((scatterCount === 5) || this.controlState !== 1)) {
                    return {key: element, value: 0};
                }

                return {key: element, value: this.weights[element][i]};
            });

            // 一列
            const line = [];

            for (let j = 0; j < config.row; j++) {
                // 随机选择一个元素
                const element = selectElement(elementSet);
                if (element === config.wild) scatterCount++;
                line.push(element);
                // 数量超过3个则不再开
                if (scatterCount === 5) {
                    for (let es of elementSet) {
                        if (es.key === config.wild) es.value = 0;
                    }
                }
            }

           window.push(line);
        }

        return window;
    }

    /**
     * 计算收益
     */
    private calculateEarnings(window: elementType[][]): {winLines: WinLine[], totalWin: number, scatterCount: number} {
        // 选择中奖线
        const selectLines: number[][] = config.winLines.slice(0, this.lineNum);
        const scatterCount = this.countScatter(window);

        // 中奖线
        let winLines: WinLine[] = [],
        // 累积收益
            totalWin = 0;

        selectLines.forEach((line, index) => {
            // 这条线上的元素
            const elementLine: elementType[] = line.map((l, i) => window[i][l - 1]);

            // 先克隆一个当前元素的副本
            const transcript = clone(elementLine);

            // 如果其中存在wild元素,将其转成其前一个元素
            elementLine.forEach((element, index) => {
                if (element === config.wild) {
                    elementLine[index] = index === 0 ? elementLine.find(e => e !== config.wild) : elementLine[index - 1];
                }
            });

            // 计算元素线中奖结果
            const lineResult: LineResult = this.calculateLineResult(elementLine);

            // 如果有中奖元素
            if (lineResult.elementType) {

                // 中奖赔率
                const odds = config.award[lineResult.elementType][lineResult.rewardType];
                const lineProfit = this.bet * odds;
                totalWin += lineProfit;

                // 累计总赔率
                this.totalMultiple += odds;

                const linkIds = transcript.slice(0, lineResult.linkNum);
                winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType, multiple: odds });
            }
        });

        if (scatterCount >= 3) {
            totalWin += (specialAward[scatterCount] * this.totalBet);
        }

        return {winLines, totalWin, scatterCount};
    }

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     */
    private calculateLineResult(elementLine: elementType[]): LineResult {
        // 取第一个元素
        const firstElement = elementLine[0];

        let result: LineResult = {elementType: null, rewardType: 0, linkNum: 0};

        if (!!this.freeSpinSpecialElement) {
            const len = elementLine.filter(e => e === this.freeSpinSpecialElement).length;

            if (len === 5) {
                result.linkNum = 5;
                result.elementType = this.freeSpinSpecialElement;
                result.rewardType = specialElements.includes(this.freeSpinSpecialElement) ? 3 : 2;
            } else if (len === 4) {
                result.elementType = firstElement;
                result.linkNum = 4;
                result.rewardType = specialElements.includes(firstElement) ? 2 : 1;
            } else if (len === 3) {
                result.elementType = firstElement;
                result.rewardType = specialElements.includes(firstElement) ? 1 : 0;
                result.linkNum = 3;
            } else if (len === 2 && specialElements.includes(this.freeSpinSpecialElement)) {
                result.elementType = firstElement;
                result.rewardType = 0;
                result.linkNum = 2;
            }

            if (result.linkNum > 0) return result;
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
     * 选择特殊元素
     * @private
     */
    private chooseSpecialElement() {
        this.freeSpinSpecialElement = baseElements[random(0, baseElements.length - 1)] as any;
    }

    private freeSpinLottery() {
        this.freeSpin = true;

        // 选择特殊元素
        this.chooseSpecialElement();

        // 摇奖几次
        let len = 10;

        while (len > 0) {
            // 新生成一个窗口
            const window = this.generateWindow();

            // 改变窗口
            const lastWindow = this.changeWindow(JSON.parse(JSON.stringify(window)));

            // 计算结果
            const result = this.calculateEarnings(lastWindow);

            if (result.scatterCount >= 3) len += 10;

            this.freeSpinResult.push({
                winLines: result.winLines,
                totalWin: result.totalWin,
                window,
                lastWindow,
                scatterCount: result.scatterCount
            });

            len--;
        }
    }

    /**
     * 特殊元素
     * @param window
     */
    changeWindow(window: elementType[][]) {
        const num = window.reduce((num, row) => {
            return row.find(e => e === this.freeSpinSpecialElement) ? num + 1 : num;
        }, 0);

        if (num >= 3) {
            return window.map(row => {
                const has = row.find(e => e === this.freeSpinSpecialElement);
                if (has) return row.map(e => this.freeSpinSpecialElement);
                return row;
            })
        }

        return window;
    }

    /**
     * 计算特殊字符数量
     * @param window
     */
    private countScatter(window: elementType[][]): number {
        let count = 0;

        window.forEach(row => {
            row.forEach(e => {
                if (e === config.wild) count++;
            })
        });

        return count;
    }
}

/**
 * 获取一副牌
 */
function getCards() {
    return [0, 13, 26, 39];
}

/**
 * 调控状态
 */
enum ControlStatus {
    SystemWin,
    PlayerWin,
    Random
}

/**
 * 博一博开奖工具
 * @property disCards 弃牌堆
 * @property color 花色
 * @property card 搏一搏牌
 * @property multiple 赔率
 * @property profit 收益
 * @property totalWin 最后收益
 * @property controlStatus 调控状态
 */
export class BoLotteryUtil {
    disCards: number[] = [];
    color: ColorType;
    card: number;
    multiple: number;
    profit: number;
    totalWin: number;
    controlStatus : ControlStatus = ControlStatus.Random;

    constructor(disCards: number[], profit: number) {
        this.disCards = disCards;
        this.profit = profit;
    }

    /**
     * 初始化
     * @private
     */
    private init() {
        this.multiple = 0;
        this.totalWin = 0;
    }

    /**
     * 设置调控
     * @param systemWin
     */
    setSystemWinOrLoss(systemWin: boolean) {
        this.controlStatus = systemWin ? ControlStatus.SystemWin : ControlStatus.PlayerWin;
        return this;
    }

    /**
     * 设置弃牌堆和玩家选择的颜色
     * @param color 玩家选择的颜色
     */
    setColor(color: ColorType) {
        this.color = color;
        return this;
    }

    /**
     * 开奖
     */
    result(): BoResult {
        if (this.controlStatus === ControlStatus.Random) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        return {
            card: this.card,
            totalWin: this.totalWin,
            multiple: this.multiple,
        }
    }

    /**
     * 随机开奖
     */
    private randomLottery() {
        this.init();
        this.bo();
    }

    /**
     * 调控开奖
     * @private
     */
    private controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            // 如果系统赢则玩家总盈利必须输
            if (this.controlStatus === ControlStatus.SystemWin && this.totalWin < 0) {
                break;
            }

            if (this.controlStatus === ControlStatus.PlayerWin && this.totalWin >= 0) {
                break;
            }
        }
    }

    /**
     * 开出搏一搏结果
     */
    private bo() {
        let cards = getCards();

        // 随机从弃牌堆取出一张牌
        // this.disCards.forEach(c => {
        //     const index = cards.findIndex(cc => cc === c);
        //     if (index !== -1) cards.splice(index, 1);
        // })
        // cards = cards.filter(c => !this.disCards.includes(c));

        const index = random(0, cards.length - 1);
        this.card = cards[index];
        const color = Math.floor(this.card / 13);
        this.multiple = calculateMul(this.color, color);
        this.totalWin = this.profit * this.multiple;
    }
}

/**
 * 计算赔率
 * @param selectColor 选择的花色
 * @param color 开奖花色
 */
function calculateMul(selectColor: number, color: number) {
    let mul = 0;

    if (selectColor === 11 && color % 2 === 1) {
        // 红色
        mul = 2;
    } else if (selectColor === 22 && color % 2 === 0) {
        // 黑色
        mul = 2;
    } else if (color === selectColor) {
        mul = 4;
    }

    return mul;
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
 * 创建博一博开奖
 * @param disCards 已经开的牌
 * @param profit 收益
 */
export function createBoLottery(disCards: number[], profit: number): BoLotteryUtil {
    return new BoLotteryUtil(disCards, profit);
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

    const result = lottery.setBetAndLineNum(1, 10)
        .setInternalControl(false, false, false)
        .result();

    // if (result.totalWin > 3) {
        console.log(result);
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