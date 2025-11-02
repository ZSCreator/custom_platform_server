import {
    linesNum,
    elementType,
    monkey,
    maxAward,
    column,
    wild,
    bonus,
    row,
    specialElements,
    characterIcon
} from '../constant';
import {clone, difference, findLastIndex, random, selectEle, selectElement} from "../../../../utils";
import {defaultWeights, freeSpinWeight} from "../config/weights";
import {winLines as winLinesConfig} from "../config/winLines";
import {award} from "../config/award";

// wild元素数量限制
const WILD_MAX_NUM = 4;

// bonus元素限制
const BONUS_MAX_NUM = 3;

/**
 * @property elementType 中奖类型 默认返回空为未中奖
 * @property rewardType 中奖类型 赔率的下标 默认返回0 根据下标查找赔率 详情参见 award.ts 表
 * @property linkNum 元素几连 默认0
 */
interface LineResult {
    elementType: elementType,
    rewardType: 0 | 1 | 2 | 3,
    linkNum: number,
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
    linkIds: elementType[],
    money: number,
    type: elementType,
}

/**
 * 单个窗口开奖结果 兼容以前的写法
 * @property totalWin 这个窗口的累积收益
 * @property winLines 中奖线
 * @property luckyFiveLines 是否是幸运五线
 * @property bonusGame 是否触发Bonus 游戏
 * @property jackpotWin 从奖池中应取得的收益
 * @property dispears 这个串口需要消除的元素坐标
 * @property fiveLines 是否是五线
 * @property bigWin 是否中大奖
 * @property multiple 赔率
 */
interface WindowResult {
    totalWin: number,
    winLines: WinLine[],
    luckyFiveLines: boolean,
    bonusGame: boolean,
    jackpotWin: number,
    dispears:  Set<string>,
    fiveLines: boolean,
    bigWin: boolean,
    multiple: number
}

/**
 * 西游记开奖结果
 * @property window 开奖界面元素
 * @property luckyFiveLines 是否是幸运五线
 * @property rounds 补的窗口结果
 * @property fiveLines 是否是五线
 * @property roundsAward 每个窗口的收益 包含第一个窗口
 * @property allTotalWin 所有收益
 * @property jackpotWin 需要从奖池扣除的收益
 * @property multiple 总赔率
 * @property peachNum 桃子数量
 * @property bonusGame 是否触发bonus 游戏
 * @property characters 集字数组
 * @property characterWindow 集字界面
 */
export interface XYJLotteryResult {
    window: elementType[][],
    luckyFiveLines: boolean,
    rounds: any[],
    fiveLines: boolean,
    roundsAward: WindowResult[],
    allTotalWin: number,
    jackpotWin: number,
    multiple: number,
    peachNum: number,
    bonusGame: boolean
    characters: string[],
    characterWindow: {id: elementType, scatter: string}[][]
}

/**
 * 免费开奖结果
 * @property results 结果集
 * @property totalWin 总收益
 * @property boom 大奖
 * @property jackpotWin 从奖池扣除的收益
 * @property multiple 总倍率
 */
export interface FreeSpinResult{
    results: {firstRound: elementType[][], oneFreeResult: any}[],
    totalWin: number,
    boom: boolean,
    jackpotWin: number,
    multiple: number
}

/**
 * 判断选线是否合理
 * @param lineNum 选线数量
 */
export const isHaveLine = (lineNum: number) => linesNum.includes(lineNum);

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
 * @property jackpotWin 奖池收益
 * @property jackpot 房间奖池
 * @property bonusCount bonus 数量
 * @property weights 权重轮盘
 * @property window 窗口
 * @property characterWindow 集字窗口
 * @property winLines 中奖线
 * @property windowsAward 每个窗口开奖结果
 * @property bigWin 中大奖
 * @property luckyFiveLine 幸运五线 默认为false
 * @property fiveLine 五线
 * @property bonusGame 触发bonus游戏
 * @property rounds 补全窗口结果
 * @property characters “如意金箍棒“ 集字的结果
 * @property originCharacters “如意金箍棒“ 原始字符集
 * @property hasAddCharacter 是否补字
 * @property winPercentage 赢/押注 比例
 * @property totalMultiple 总赔率
 * @property peachCount 桃子数量统计
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
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
    jackpotWin: number = 0;
    jackpot: number = 0;
    bonusCount: number = 0;
    weights: { [element in  elementType]: number[] };
    freeSpin: boolean = false;
    window: elementType[][] = [];
    characterWindow: {id: elementType, scatter: string}[][] = [];
    winLines: WinLine[] = [];
    windowsAward: WindowResult[] = [];
    bigWin: boolean = false;
    luckyFiveLine: boolean = false;
    fiveLine: boolean = false;
    bonusGame: boolean = false;
    rounds: any[] = [];
    characters: string[] = [];
    originCharacters: string[] = [];
    hasAddCharacter: string = '';
    addCharacterProbability: number = 0;
    winPercentage: number = 0;
    totalMultiple: number = 0;
    peachCount: 0 | 1 | 2 | 3 | 4 | 5 = 0;
    controlState: 1 | 2 | 3 = 1;


    constructor(newer: boolean, roulette: '1' | '2' | '3', jackpot: number) {
        this.newer = newer;
        this.roulette = roulette;
        this.jackpot = jackpot;
    }

    private init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.winLines = [];
        this.totalMultiple = 0;
        this.bonusCount = 0;
        this.peachCount = 0;
        this.luckyFiveLine = false;
        this.fiveLine = false;
        this.bonusGame = false;
        this.bigWin = false;
        this.windowsAward = [];
        this.characterWindow = [];
        this.hasAddCharacter = '';
        this.rounds = [];
        this.characters = [];
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
     * 设置集字数组
     * @param characters 字符集
     * @param winPercentage 赢/押注 比例
     */
    setCharacterAndWinPercentage(characters: string[],  winPercentage: number) {
        this.originCharacters = [...characters];
        this.winPercentage = winPercentage;
        return this;
    }


    /**
     * 设置免费开奖
     * @param free
     */
    setFreeSpin(free: boolean) {
        this.freeSpin = free;
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
    result(): XYJLotteryResult {
        // 选择轮盘
        this.selectWights();

        // 集字的概率
        this.addCharacterProbability = getIconProbability(this.winPercentage, this.lineNum);

        if (this.controlState === 1) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        this.characters = [...this.originCharacters];
        // 如果是集字则开添加入集字
        if (this.hasAddCharacter) {
            this.characters.push(this.hasAddCharacter);
        }

        return this.stripResult();
    }

    /**
     * 包装结果
     */
    private stripResult(): XYJLotteryResult {
        return {
            window: this.window,
            luckyFiveLines: this.luckyFiveLine,
            fiveLines: this.fiveLine,
            roundsAward: this.windowsAward,
            allTotalWin: this.totalWin,
            jackpotWin: this.jackpotWin,
            multiple: this.totalMultiple,
            peachNum: this.peachCount,
            bonusGame: this.bonusGame,
            rounds: this.rounds,
            characters: this.characters,
            characterWindow: this.characterWindow
        };
    }

    /**
     * 免费开奖
     */
    freeResult(): FreeSpinResult {
        this.setFreeSpin(true);

        // 选择轮盘 这时候会选择免费开奖轮盘
        this.selectWights();

        const freeSpinResult: FreeSpinResult = {
            results: [],
            totalWin: 0,
            boom: false,
            jackpotWin: 0,
            multiple: 0,
        };

        // 开五次
        for (let i = 0; i < 5; i++) {
            // 随机开奖
            this.randomLottery();

            // 设置结果
            setFreeSpinResult(freeSpinResult, this.stripResult());
        }

        // 如果收益零 必须让他中一次
        if (freeSpinResult.totalWin === 0) {
            this.randomLottery();
            let onceResult = this.stripResult();

            while(onceResult.allTotalWin === 0) {
                this.randomLottery();
                onceResult = this.stripResult();
            }

            // 去掉一个
            freeSpinResult.results.pop();

            // 设置结果
            setFreeSpinResult(freeSpinResult, this.stripResult());
        }

        return freeSpinResult;
    }

    /**
     * 随机开奖
     */
    private randomLottery() {
        // 初始化
        this.init();

        // 生成窗口
        this.generateWindow();

        // 计算收益
        this.calculateEarnings();
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
     * 选择权重轮盘
     */
    private selectWights() {
        const roulette = this.roulette;

        // 如果是新人使用第一个权重轮盘
        if (this.newer) {
            this.weights = clone(defaultWeights['1']);

        // 如果是免费开奖则使用免费开奖的权重轮盘
        } else if (this.freeSpin) {
            this.weights = clone(freeSpinWeight);
        } else {
            this.weights = clone(defaultWeights[roulette]);

            // 整体调控 属于收奖调控 降低 wild元素出现的权重
            if (this.overallControl) {
                this.weights.wild = this.weights.wild.map((element, index) => {
                    if (index !== 0 && index !== 4) {
                        return element - (roulette === '1' ? 23.5 : roulette === '2' ? 15 : 13.6);
                    }
                    return element;
                });
            }

            // 单体调控一 属于放奖体调控 提高 wild元素出现的权重
            if (this.singleControlOne) {
                this.weights.wild = this.weights.wild.map((element, index) => {
                    if (index !== 0 && index !== 4) {
                        return element + (roulette === '2' ? 18.4 : 11.8);
                    }
                    return element;
                });
            }

            // 单体调控二 属于放奖体调控 提高 wild元素出现的权重
            if (this.singleControlTwo) {
                this.weights.wild = this.weights.wild.map((element, index) => {
                    if (index !== 0 && index !== 4) {
                        return element + (roulette === '2' ? 9 : 19.9);
                    }
                    return element;
                });
            }
        }

        // 如果奖池过小 降低重要元素的权重
        if (this.jackpot < this.bet * 70 * 2) {
            this.weights[monkey][1] = 0;
            this.weights.wild[1] = 0;
        } else if (this.jackpot < this.bet * maxAward) {
            this.weights[monkey][4] = 0;
        }
    }

    /**
     * 生成初始窗口
     */
    generateWindow() {
        const elementKeys = Object.keys(this.weights);

        // wildCount 元素统计
        let wildCount = 0;

        // 生成一个矩阵
        for (let i = 0; i < column; i++) {
            const elementSet = elementKeys.map(element => {
                return {[element]: this.weights[element][i]};
            });

            // 一列
            let line = [], characterLine = [];

            while(line.length < row) {
                const element: elementType = selectEle(elementSet);

                // wild 元素数量控制
                if (element === wild) {
                    if (wildCount === WILD_MAX_NUM) {
                        continue;
                    }

                    wildCount++;
                }

                // bonus 元素数量控制
                if (element === bonus) {
                    if (this.bonusCount === BONUS_MAX_NUM) {
                        continue;
                    }

                    this.bonusCount++;
                }

                // 集字元素
                const characterElement = {id:element, scatter: null};

                // 查看是否可以集字 且 满足概率 如果元素为bonus和wild元素不出现集字
                if (!this.hasAddCharacter && this.isNeedAddCharacters() && element !== bonus && element !== wild) {
                    // 查看差异元素
                    const differences = difference(characterIcon, this.originCharacters);

                    if (differences.length > 0) {
                        characterElement.scatter = differences[Math.floor(random(0, differences.length - 1))];
                        this.hasAddCharacter = characterElement.scatter
                    }
                }

                // 集字元素
                characterLine.push(characterElement);
                line.push(element);
            }

            this.characterWindow.push(characterLine);
            this.window.push(line);
        }
    }

    /**
     * 计算收益
     */
    private calculateEarnings() {
        // 计算初始窗口的收益
        let windowResult:WindowResult = this.calculateWindowEarnings(this.window);

        // 生成第一个窗口后 无论如何清空第一个bonus元素统计
        this.bonusCount = 0;

        // 根据开奖结果设置特殊奖项和累积值
        this.accumulateAwardResult(windowResult);

        // 引用
        let window = this.window;

        // 如果有消除的元素
        while (windowResult.dispears.size > 0) {
            // 桃子加一
            this.peachCount++;

            // 补全窗口
            const result = this.subsequentWindow(window, windowResult);

            this.rounds.push(result.clientClearPoints, result.completion);

            // 计算这个窗口的收益
            windowResult = this.calculateWindowEarnings(result.window);

            // 累积收益
            this.accumulateAwardResult(windowResult);

            // 新窗口
            window = result.window;
        }
    }

    /**
     * 后续补全界面
     * @param window 当前窗口
     * @param lastWindowResult 最后的开奖结果
     */
    private subsequentWindow(window: elementType[][], lastWindowResult: WindowResult) {
        // 克隆一个当前界面的副本
        let windowTranscript = clone(window);

        // 记录前端显示数据 兼容以前写法
        let clientClearPoints: [number, number][] = [];

        // 元素消除
        lastWindowResult.dispears.forEach((point) => {
            // 把需要消除的元素置位空
            windowTranscript[point[0]][point[1]] = null;

            // 把坐标点push进去
            clientClearPoints.push([Number(point[0]) + 1, Number(point[1]) + 1]);
        });

        // 元素降落
        elementsLanded(windowTranscript);

        // 获取一个权重表 由于是补全 所以不采用 this.weights
        const weights  = defaultWeights[this.roulette];

        const elementKeys: elementType[] = (Object.keys(weights) as any);

        // 奖池限制
        const jackpotLimitOne = this.jackpot < this.bet * 300 * 2;

        // 补上的元素
        let completion: {x: number, y: number, id: elementType}[] = [];

        // 元素补全 不出现 wild元素
        for (let i = 0; i < windowTranscript.length; i++) {
            const elementSet = elementKeys.map((element) => {
                 if (element === bonus || element === wild) {
                     return {[element]: 0};
                 }

                 // 如果奖池限制 那么第五列 出现猴子
                if (jackpotLimitOne && i === 4 && element === monkey) {
                    return { [element]: 0 };
                }
                return { [element]: weights[element][i] };
            });

            // 补齐空元素
            for (let j = 0; j < windowTranscript[i].length; j++) {
                if (windowTranscript[i][j] == null) {
                    windowTranscript[i][j] = selectEle(elementSet);

                    // 补齐的元素
                    completion.push({ x: i + 1, y: j + 1, id: windowTranscript[i][j] });
                }
            }
        }


        return {
            window: windowTranscript,
            completion,
            clientClearPoints
        }
    }

    /**
     * 设置特殊奖项
     * @param windowResult 一个窗口的开奖结果
     */
    private accumulateAwardResult(windowResult: WindowResult) {
        // 累积总收益
        this.totalWin += windowResult.totalWin;

        // 累积扣除需扣除的奖池收益
        this.jackpotWin += windowResult.jackpotWin;

        // 添加开奖结果
        this.windowsAward.push(windowResult);

        // 累积总赔率
        this.totalMultiple += windowResult.multiple;

        // 如果触发bonus 游戏
        if (windowResult.bonusGame) {
            this.bonusGame = true;
        }

        // 如果是幸运五线
        if (windowResult.luckyFiveLines) {
            this.luckyFiveLine = true;
        }

        // 如果是五线
        if (windowResult.fiveLines) {
            this.fiveLine = true;
        }
    }


    /**
     * 计算单个窗口收益
     * @param window 单个开奖窗口
     * @return windowResult 单个窗口结果
     */
    private calculateWindowEarnings(window: elementType[][]): WindowResult {
        // 根据桃子数量获取桃子的赔率
        const peachOdds = calculatePeachOdds(this.peachCount);

        // 选择中奖线
        const selectLines: number[][] = winLinesConfig.slice(0, this.lineNum);

        /**
         * 单窗口结果 老的写法为了适配前端
         */
        const windowResult: WindowResult = {
            totalWin: 0,
            winLines: [],
            luckyFiveLines: false,
            bonusGame: false,
            jackpotWin: 0,
            dispears: new Set(),
            fiveLines: false,
            bigWin: false,
            multiple: 0
        };

        selectLines.forEach((line, index) => {
            // 这条线上的元素
            const elementLine: elementType[] = line.map((l, i) => window[i][l - 1]);

            // 先克隆一个当前元素的副本
            const transcript = clone(elementLine);

            // 如果其中存在wild元素,且前一个元素不能为bonus 将其转成其前一个元素 第一行不会有 wild 元素 所以这里不会报错
            elementLine.forEach((element, index) => {
                if (element === wild && elementLine[index - 1] !== bonus) {
                    elementLine[index] = elementLine[index - 1];
                }
            });

            // 计算这条线的中奖情况
            const lineResult:LineResult = this.calculateLineResult(elementLine);

            // 如果有中奖元素
            if (lineResult.elementType) {
                // 把需要消除的位置记录下来
                line.slice(0, lineResult.linkNum).forEach((num, i) => {
                    windowResult.dispears.add(i.toString() + (num - 1));
                }) ;

                // 获取赔率
                const odds = award[lineResult.elementType][lineResult.rewardType];

                // 累计总赔率
                windowResult.multiple += odds;

                // 这条线的收益 如果是免费开奖收益 * 5倍
                const lineProfit = this.freeSpin ? odds * this.bet * 5 * peachOdds : odds * this.bet * peachOdds;

                // 累加总收益
                windowResult.totalWin += lineProfit;

                // 如果是五线
                if (lineResult.linkNum === 5) {
                    windowResult.fiveLines = true;

                    // 如果第一条线就是猴子 则就是幸运五线
                    if (lineResult.elementType === monkey && index === 0) {
                        windowResult.luckyFiveLines = true;
                    }
                }

                // 如果开奖元素是猴子会累积奖池收益
                if (lineResult.elementType === monkey) {
                    windowResult.jackpotWin += lineProfit;
                }

                const linkIds = transcript.slice(0, lineResult.linkNum);
                windowResult.winLines.push({ index, linkNum: lineResult.linkNum, linkIds, money: lineProfit, type: lineResult.elementType });
            }
        });

        // 如果bonus元素元素最多 触发bonus游戏
        if (this.bonusCount === BONUS_MAX_NUM) {
            windowResult.bonusGame = true;

            // 消除bonus元素
            window.forEach((column, index) => {
                column.forEach((element, i) => {
                    if (element === bonus) {
                        windowResult.dispears.add(index.toString() + i);
                    }
                })
            })
        }

        // 如果收益较大 表示中的大奖
        if (windowResult.totalWin >= this.bet * this.lineNum * 5) {
            windowResult.bigWin = true;
        }

        return windowResult;
    }

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     */
    private calculateLineResult(elementLine: elementType[]): LineResult {
        // 取第一个元素
        const firstElement = elementLine[0];

        let result: LineResult = {elementType: null, rewardType: 0, linkNum: 0};

        switch (true) {
            // 单元素五连
            case elementLine.every(element => element === firstElement) : {
                result.elementType = firstElement;
                result.rewardType = 3;
                result.linkNum = 5;

                break;
            }

            // 单元素四连
            case elementLine.slice(0, 4).every(element => element === firstElement) : {
                result.elementType = firstElement;
                result.rewardType = 2;
                result.linkNum = 4;

                break;
            }

            // 元素3连
            case elementLine.slice(0, 3).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = 1;
                result.linkNum = 3;

                break;
            }

            // 如果是特殊元素 表示可以二连
            case specialElements.includes(firstElement) &&
            elementLine.slice(0, 2).every(element => element === firstElement): {
                result.elementType = firstElement;
                result.rewardType = 0;
                result.linkNum = 2;

                break;
            }
        }

        return result;
    }

    /**
     * 是否添加字符
     */
    private isNeedAddCharacters() {
        // 如果免费开奖 或者 处于调控状态 不允许集字
        if (this.freeSpin || this.controlState !== 1) {
            return false;
        }

        // 如果满足倍率条件才进行加字
        return Math.random() < this.addCharacterProbability;
        // return Math.random() < 1;
    }
}

/**
 * 根据桃子数量返回赔率
 * @param peachNum
 */
function calculatePeachOdds(peachNum: 0 | 1 | 2 | 3 | 4 | 5) {
    const num = peachNum + 1;

    // 预防措施
    if (num > 6) return 6;

    return num;
}

/**
 * 元素降落
 * @param window 窗口
 * @return wild元素数量
 */
function elementsLanded(window: elementType[][]): number {
    let wildCount = 0;

    for (let i = 0; i < window.length; i++) {
        for (let j = window[i].length - 1; j > 0; j--) {
            // 如果当前元素为空说明上一个元素需要降落下来
            if (window[i][j] === null) {
                // 查找一个最后一个元素不为空的下标
                const index = findLastIndex(p => p !== null)(window[i].slice(0, j));

                // 如果找到了
                if (index !== -1) {
                    [window[i][j], window[i][index]] = [window[i][index], window[i][j]];
                }
            }

            // 统计局部的wild元素
            if (window[i][j] === wild) {
                wildCount++;
            }
        }
    }

    return wildCount;
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

        const rightValue: number = roulette === '2' ? 0.55 : 0.25;
        const leftValue: number = roulette == '2' ? 0.35 : 0.05;

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
 * 获取图标生成的概率
 * @param winPercentage 赢/押注 比例
 * @param lineNum 选线值
 */
export function getIconProbability(winPercentage: number, lineNum: number) {
    if (lineNum === 25) return 0.0027;
    if (lineNum === 15) return 0.0035;
    if (lineNum === 9) return 0.0025;
    if (lineNum < 5) return 0.007;

    return winPercentage < 0.25 ? (0.25 - winPercentage) / 85 : 0.004;
}


/**
 * 创建slot开奖
 * @param newer 是否是新玩家
 * @param roulette 轮盘
 * @param jackpotGoldNum 奖池金币数量
 */
export function crateXYJLottery(newer: boolean, roulette: '1' | '2' | '3', jackpotGoldNum: number): Lottery {
    return new Lottery(newer, roulette, jackpotGoldNum);
}


/**
 * 设置免费开奖结果
 * @param freeSpinResult 免费开奖结果集
 * @param onceResult 一次的开奖结果
 */
function setFreeSpinResult(freeSpinResult: FreeSpinResult, onceResult: XYJLotteryResult) {
    freeSpinResult.jackpotWin += onceResult.allTotalWin;
    freeSpinResult.totalWin += onceResult.allTotalWin;
    freeSpinResult.multiple += onceResult.multiple;

    // 如果有幸运五线 表示中大奖
    if (onceResult.luckyFiveLines) {
        freeSpinResult.boom = true;
    }

    // 兼容老写法
    const firstRound = Reflect.get(onceResult, 'window');
    // 删除不需要及字段
    Reflect.deleteProperty(onceResult, 'window');
    Reflect.deleteProperty(onceResult, 'characters');
    Reflect.deleteProperty(onceResult, 'characterWindow');

    freeSpinResult.results.push({firstRound, oneFreeResult: onceResult});
}



function test() {
    const lottery = crateXYJLottery(false, '1', 0);

    const result = lottery.setBetAndLineNum(1, 3)
        .setTotalBet(3)
        .setCharacterAndWinPercentage(['1'], 0.3)
        .setInternalControl(false, false, false)
        .result();

    return result;
}

function test1() {
    const lottery = crateXYJLottery(false, '1', 0);

    const result = lottery.setBetAndLineNum(1, 3)
        .setTotalBet(3)
        .setCharacterAndWinPercentage(['1'], 0.3)
        .setInternalControl(false, false, false)
        .freeResult();

    return result;
}


// for (let i = 0; i < 100; i++) {
//     const result = test();
//
//     console.log(random(0, 4))
//
//     if (result.characters.length > 2) {
//         console.log(result.characterWindow.map(l => l.find(p => !!p.scatter)));
//     }
//
//     // console.log(test1());
// }




