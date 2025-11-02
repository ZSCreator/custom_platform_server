import {anyList, anyOddsMap, ColorType, COLUMN_NUM, ElementEnum, ROW_NUM,} from "../constant";
import {clone, random, selectElement} from '../../../../utils';
import getWinLines from '../config/winLines';
import weightsConfig from '../config/weights';
import awardConfig from "../config/award";


/**
 * 调控状态
 */
enum ControlStatus {
    SystemWin,
    PlayerWin,
    Random
}

/**
 * 判断选线是否合理
 */
export const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= getWinLines().length;

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
 * @property prizeType 大奖类型 默认none 没有
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
 */
export interface SlotResult {
    window: ElementEnum[][],
    winLines: WinLine[],
    totalWin: number,
    multiple: number,
    freeSpin: boolean;
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
 * 选择权重
 * @property newer 是否是新玩家
 * @property roulette 权重轮盘
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property lineNum 选线
 * @property totalWin 总收益
 * @property weights 权重轮盘
 * @property window 窗口
 * @property winLines 中奖线
 * @property totalMultiple 总赔率
 * @property controlState 调控状态
 * @property freeSpin 免费摇奖
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
    winLines: WinLine[] = [];
    totalMultiple: number = 0;
    controlState: ControlStatus = ControlStatus.Random;
    freeSpin: boolean = false;

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
        this.freeSpin = this.countScatter(this.window) >= 3;
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
        const window: ElementEnum[][] = [];
        const elementKeys = Object.keys(this.weights);

        // 生成一个矩阵
        for (let i = 0; i < COLUMN_NUM; i++) {
            const elementSet = elementKeys.map(element => {
                // 如果是SAMBA的元素 如果数量超过了特殊元素数量或者不是随机状态则不开SAMBA元素
                if (this.controlState !== ControlStatus.Random &&
                    (anyList.includes(element as ElementEnum) || element === ElementEnum.SAMBA)) {
                    return {key: element, value: 0};
                }

                return {key: element, value: this.weights[element][i]};
            });

            // 一列
            const line = [];

            while (line.length < ROW_NUM) {
                // 随机选择一个元素
                const element = selectElement(elementSet);

                // 桑巴一列只出现一个
                if (element === ElementEnum.SAMBA && line.includes(ElementEnum.SAMBA)) continue;

                line.push(element);


                // 有一个any则不再开
                if (anyList.includes(element)) {
                    for (let es of elementSet) {
                        if (anyList.includes(element)) es.value = 0;
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
    private calculateEarnings(window: ElementEnum[][]): { winLines: WinLine[], totalWin: number} {
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
            const lines = [];
            const anyElement = elementLine.find(e => anyList.includes(e));
            if (!!anyElement) {
                const one = clone(elementLine);
                const two = clone(elementLine);
                one[2] = one[1];
                two[2] = two[3];
                lines.push(one, two);
            } else {
                lines.push(transcript);
            }

            const linesResult = lines.map(line => this.calculateLineResult(line));
            linesResult.sort((x, y) => {
                let one = !!x.elementType ? awardConfig[x.elementType][x.rewardType] : 0;
                let two = !!y.elementType ? awardConfig[y.elementType][y.rewardType] : 0;
                return two - one;
            });

            // 计算元素线中奖结果
            const lineResult: LineResult = linesResult[0];

            // 如果有中奖元素
            if (lineResult.elementType) {
                // 中奖赔率
                const odds = awardConfig[lineResult.elementType][lineResult.rewardType];
                const attach = !!anyElement ? anyOddsMap[anyElement] : 1;
                const lineProfit = this.bet * odds * attach;

                totalWin += lineProfit;

                // 累计总赔率
                this.totalMultiple += odds;

                const _index = transcript.findIndex(element => anyList.includes(element) || element === lineResult.elementType);
                const linkIds = transcript.slice(_index, _index + lineResult.linkNum);
                winLines.push({
                    index,
                    linkNum: lineResult.linkNum,
                    linkIds,
                    money: lineProfit,
                    type: lineResult.elementType,
                    multiple: odds
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

        // 单元素五连
        if (elementLine.every(element => element === firstElement)) {
            result.linkNum = 5;
            result.elementType = firstElement;
            result.rewardType = 2;
            return result;
        }

        let element = this.getsStraightForNum(elementLine, 4);
        if (!!element) {
            result.elementType = element;
            result.linkNum = 4;
            result.rewardType = 1;
            return result;
        }

        element = this.getsStraightForNum(elementLine, 3);
        if (!!element) {
            result.elementType = element;
            result.rewardType = 0;
            result.linkNum = 3;
            return result;
        }

        return result
    }

    getsStraightForNum(line: ElementEnum[], num: 4 | 3) {
        if (num === 4) {
            let str = line.slice(0, 4);
            if (str.every(s => s === str[0])) return str[0];
            str = line.slice(1, 5);
            return (str.every(s => s === str[0])) ? str[0] : null;
        }

        let str = line.slice(0, 3);
        if (str.every(s => s === str[0])) return str[0];
        str = line.slice(1, 4);
        if (str.every(s => s === str[0])) return str[0];
        str = line.slice(2, 5);
        return (str.every(s => s === str[0])) ? str[0] : null;
    }

    /**
     * 计算特殊字符数量
     * @param window
     */
    private countScatter(window: ElementEnum[][]): number {
        let count = 0;

        window.forEach(row => {
            row.forEach(e => {
                if (e === ElementEnum.SAMBA) count++;
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
    controlStatus: ControlStatus = ControlStatus.Random;

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


export function removeOneElement(list: number[]) {
    const index = random(0, list.length - 1);
    const num = list[index];

    list.splice(index, 1);

    return num;
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


function test() {
    const lottery = crateSlotLottery(false, '1');

    const result = lottery.setBetAndLineNum(1, 10)
        .result();

    if (result.freeSpin) {
    console.log(result);
    }
}

// for (let i = 0; i < 100; i++) {
//     test();
// }