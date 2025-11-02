import {
    elementType,
    specialElements,
    specialElementType,
    detonator,
    gameLevelMappingElementsNum,
    squib,
    clearSpecialElements,
    ordinaryElements,
    bonus,
    baseBetList,
    oddsList,
    coinList,
    dice, littleBonus
} from '../constant';
import {clone, findLastIndex, random, selectEle, selectElement, sortWith, values} from "../../../../utils";
import {weights} from "../config/weights";
import {filter, isVoid} from "../../../../utils";
import {awardOdds, littleGameBonusOdds} from "../config/littleGame";

// bonus 大奖
const BIG_AWARDS = {
    '4': { name: 'king', ratio: 0.0008 },
    '3': { name: 'diamond', ratio: 0.00008 },
    '2': { name: 'platinum', ratio: 0.00005 },
    '1': { name: 'gold', ratio: 0.00001 },
};

/**
 * 中奖详情
 * @property type 中奖类型
 * @property odds 中奖赔率
 * @property num 数量
 */
export interface WinningDetail {
    type: elementType,
    num: number,
    win: number,
}


/**
 * 埃及夺宝开奖结果
 * @property window 开奖窗口
 * @property totalWin 总收益
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property awards 每回合的盈利结果
 * @property roundDetonatorCount 这个回合的雷管数量
 * @property jackpotTypeList 中bonus奖类型
 * @property jackpotWinList 中bonus奖开奖结果
 * @property clearAll 一个界面所有需要消除的元素
 * @property jackpotWin 从奖池获取到的收益
 * @property winningDetails 中奖具体详情
 * @property clearElements 消除元素 用以实况记录
 */
export interface PharaohLotteryResult {
    window: elementType[][],
    totalWin: number,
    roundWindows: any[],
    awards: number[],
    roundDetonatorCount: number,
    jackpotTypeList: string[],
    jackpotWinList: number[],
    clearAll: string,
    jackpotWin: number,
    totalMultiple: number,
    winningDetails: WinningDetail[],
    clearElements: any[],
}

// 单个窗口 一个矩阵
type Window = elementType[][];

/**
 * 选择权重
 * @property newer 是否是新玩家
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property totalWin 总收益
 * @property jackpotWin 奖池收益
 * @property jackpot 房间奖池
 * @property detonatorCount 雷管（也就是雷管 这里沿用以前的字段写法和叫法以免前端不适配）数量
 * @property gameLevel 关卡等级
 * @property needGenerateBigDetonator 是否需要生成大雷管
 * @property weights 权重轮盘
 * @property window 窗口
 * @property specialElement 本局的特殊元素
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property totalMultiple 总赔率
 * @property awards 每个窗口的盈利结果
 * @property jackpotTypeList bonus中奖的类型数组
 * @property jackpotWinList bonus中奖的收益数组
 * @property roundDetonatorCount 回合雷管数量
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 * @property winningDetails 中奖具体详情
 */
export class Lottery {
    newer: boolean;
    bet: number;
    totalBet: number = 0;
    totalWin: number = 0;
    jackpotWin: number = 0;
    jackpot: number = 0;
    detonatorCount: number = 0;
    gameLevel: number = 0;
    needGenerateBigDetonator: boolean = false;
    clearAll: elementType;
    weights: { [element: string]: number }[];
    window: Window = [];
    specialElement: specialElementType;
    roundWindows: any[] = [];
    totalMultiple: number = 0;
    awards: number[] = [];
    jackpotTypeList: string[] = [];
    jackpotWinList: number[] = [];
    roundDetonatorCount: number = 0;
    controlState: 1 | 2 | 3 = 1;
    winningDetails: WinningDetail[] = [];
    clearElements: any[] = [];

    constructor(newer: boolean, jackpot: number) {
        this.newer = newer;
        this.jackpot = jackpot;
    }

    private init() {
        this.totalWin = 0;
        this.jackpotWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.needGenerateBigDetonator = false;
        this.roundWindows = [];
        this.clearAll = undefined;
        this.specialElement = undefined;
        this.awards = [];
        this.jackpotTypeList = [];
        this.jackpotWinList = [];
        this.roundDetonatorCount = 0;
        this.winningDetails = [];
        this.clearElements = [];
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
     * 设置当前累积了多少个雷管 用以计算当前所关卡
     * @param detonatorCount
     */
    setDetonatorCount(detonatorCount: number) {
        this.detonatorCount = detonatorCount;
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
        // 计算关卡
        this.gameLevel = calculateGameLevel(this.detonatorCount);

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
            jackpotTypeList: this.jackpotTypeList,
            jackpotWinList: this.jackpotWinList,
            roundDetonatorCount: this.roundDetonatorCount,
            clearAll: this.clearAll,
            awards: this.awards,
            roundWindows: this.roundWindows,
            jackpotWin: this.jackpotWin,
            totalMultiple: this.totalMultiple,
            winningDetails: this.winningDetails,
            clearElements: this.clearElements
        };
    }

    /**
     * 随机开奖
     */
    private randomLottery() {
        // 初始化
        this.init();

        // 是否生成大雷管
        this.calculateGenerateBigDetonator();

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
        this.weights = (Object.keys(weights) as elementType[]).map((element) => {
            // 如果是特殊元素
            if (specialElements.includes(element)) {
                // 如果已经生成了大雷管 则不进行生成
                if (this.needGenerateBigDetonator) {
                    return {[element]: 0};
                }

                return {[element]: weights[element].weight[this.gameLevel]};
            }

            return {[element]: weights[element].weight};
        });
    }

    /**
     * 生成初始窗口
     */
    generateWindow() {
        // 如果需要生成大雷管
        if (this.needGenerateBigDetonator) {
            this.specialElement = detonator;
            this.roundDetonatorCount = 4;
        }

        // 行数以及列数
        const num = gameLevelMappingElementsNum[this.gameLevel];

        // 开奖矩阵 长高等款
        for (let i = 0; i < num; i++) {
            let line = [];

            while (line.length !== num) {
                // 随机一个元素
                const element = selectEle(this.weights);

                // 如果为特殊元素
                if (specialElements.includes(element)) {
                    // 如果已经存在特殊元素或者处于杀控状态 则跳过
                    if (this.specialElement || this.controlState === 2) {
                        continue;
                    }

                    // 如果是雷管
                    if (element === detonator) {
                        this.roundDetonatorCount++;
                    }

                    this.specialElement = element;
                }

                line.push(element);
            }

            this.window.push(line);
        }

        // 如果有大雷管 在窗口内部随机一个 2*2 的矩阵 置换成雷管
        if (this.needGenerateBigDetonator) {
            randomSquare(num).forEach(e => this.window[e[0]][e[1]] = detonator);
        }
    }


    /**
     * 计算收益
     */
    private calculateEarnings() {
        // 改变首个窗口
        this.roundWindows.push(this.changeFirstWindow());

        // 初始窗口元素消除
        let {randomType, clearCoordinates} = this.eliminateWindowElements(this.window);

        this.clearAll = randomType;

        let window = this.window;

        // 如果可消除元素不为空
        while (!isVoid(clearCoordinates)) {
            // 查看可消除元素盈利情况
            const winAward = this.calculateClearElementProfit(clearCoordinates);

            this.clearElements.push(clearCoordinates);

            // 统计bonus产生的奖池收益
            if (winAward[bonus]) {
                this.jackpotWinList.push(winAward[bonus].award);
                this.jackpotTypeList.push(winAward[bonus].type);
            }

            // 这里赔率除10
            this.totalMultiple += winAward.windowAward / 10;

            // 收益除10 赔率缩小十倍
            this.awards.push(winAward.windowAward * this.totalBet / 10);

            // 补齐新窗口
            const result = this.subsequentWindow(window, clearCoordinates);
            // 把要删除的位置放入
            this.roundWindows.push(result.position);
            // 新的界面
            this.roundWindows.push(result.newly);

            window = result.window;
            clearCoordinates = this.eliminateWindowElements(window).clearCoordinates;
        }

        this.jackpotWin = this.jackpotWinList.reduce((num, v) => num + v, 0);
        // 最终收益
        this.totalWin = this.totalMultiple * this.totalBet + this.jackpotWin;
    }

    /**
     * 消除窗口元素
     * @param window 窗口
     */
    private eliminateWindowElements(window: Window): {
        clearCoordinates: {[key: string]: any[]}, randomType:  elementType
    } {
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


        // 先消除特殊元素  再消除普通元素
        for (let element of clearSpecialElements) {
            // 如果有特殊元素 只保留特殊元素
            if (!!typePoints[element]) {
                typePoints = {[element]: typePoints[element]};
                break;
            }
        }

        // 需要被消除的元素
        let conversionPoints: { [x: string]: number[][][] } = {},
            // 随机消除元素
            randomType;

        // 是否有爆破元素 则随机一个普通元素消除
        if (!!typePoints[squib]) {
            // 随机一个消除的普通元素
            const ordinaryList = Object.keys(typePoints).filter(type => ordinaryElements.includes(type));
            randomType = ordinaryList[random(0, ordinaryList.length - 1)];

            for (let type in typePoints) {
                // 如果是随机的消除元素或者不是普通元素则原样保存 否则返回需要消除元素坐标的集合
                conversionPoints[type] = type === randomType || !ordinaryElements.includes(type) ?
                    [typePoints[type]] : clearSimilarElements(typePoints[type], this.gameLevel);
            }
        } else {
            for (let type in typePoints) {
                // 如果是随机的消除元素或者不是普通元素则原样保存 否则返回需要消除元素坐标的集合
                conversionPoints[type] = !ordinaryElements.includes(type) ? [typePoints[type]] :
                    clearSimilarElements(typePoints[type], this.gameLevel);
            }
        }

        // 过滤掉为空数组的值 保留存在的元素
        const clearCoordinates: {[key: string]: any[]} = filter((coordinates: any) => coordinates.length > 0)(conversionPoints);

        for (let i in clearCoordinates) {
            // 如果要消除得为普通元素 把坐标转换为正常坐标
            if (ordinaryElements.includes(i) && i !== randomType) {
                clearCoordinates[i] = clearCoordinates[i].map(e => Array.from(e).map((k: any) => k.split('-')));
            }
        }

        // 转换前端坐标
        for (let i in clearCoordinates) {
            for (let j in clearCoordinates[i]) {
                clearCoordinates[i][j] = sortWith([
                    (r1, r2) => r2[1] - r1[1],
                    (r1, r2) => r1[0] - r2[0]
                ])(clearCoordinates[i][j])
            }
            clearCoordinates[i] = sortWith([
                (r1, r2) => r2[0][1] - r1[0][1],
                (r1, r2) => r1[0][0] - r2[0][0],
            ])(clearCoordinates[i])
        }


        return { clearCoordinates, randomType };

    }

    /**
     * 改变第一个窗口元素 老写法
     */
    private changeFirstWindow() {
        return this.window.map(line => {
            return line.map(e => {
                return {type: e}
            })
        });
    }

    /**
     * 后续补全界面
     * @param window 当前窗口
     * @param clearCoordinates 需要消除的坐标
     */
    private subsequentWindow(window: any[][], clearCoordinates: {[key: string]: any[]}) {
        // 克隆一个当前界面的副本
        let windowTranscript = clone(window);

        let clears = [];
        for (let e in clearCoordinates) {
            clearCoordinates[e].forEach(coordinates => {
                e === this.clearAll ? coordinates.forEach(c => clears.unshift(c)) :
                    coordinates.forEach(c => clears.push(c));
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
                    const index = findLastIndex(v => v !== 'del')(windowTranscript[i].slice(0, j));

                    if (index !== -1) {
                        [windowTranscript[i][j],  windowTranscript[i][index]] =
                            [ windowTranscript[i][index], windowTranscript[i][j]];
                    }
                }
            }
        }

        // 新补全窗口不再生成特殊元z素
        const completionWeights = Object.keys(weights).map(element => {
            return ordinaryElements.includes(element) ? { key: element, value: weights[element].weight }:
                { key: element, value: 0 };
        });

        // 补全的行信息
        const newly = [];
        for (let i in windowTranscript) {
            const completionColumn = [];
            for (let j in windowTranscript) {
                if (windowTranscript[i][j] === 'del') {
                    windowTranscript[i][j] = selectElement(completionWeights);
                    completionColumn.push({ type: windowTranscript[i][j] });
                } else {
                    break;
                }
            }
            newly.push(completionColumn);
        }

        return { window: windowTranscript, newly, position }
    }



    /**
     * 计算是否生成大雷管
     */
    private calculateGenerateBigDetonator() {
        // 如果是随机状态才补生成大雷管
        if (this.controlState === 1) {
            this.needGenerateBigDetonator = Math.random() < 0.012;
            // this.needGenerateBigDetonator = true;
        }
    }

    /**
     * 计算消除元素的收益
     * @param clearCoordinates 消除的元素以及坐标
     */
    private calculateClearElementProfit(clearCoordinates: {[key: string]: any[]}) {
        let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0};

        for (let e in clearCoordinates) {
            // 如果是雷管
            if (e === detonator) {
                result.detonatorCount = clearCoordinates[e][0].length;
            } else if (e === bonus) {
                // 先根据坐标的个数得出bonus元素的个数
                const bonusCount = clearCoordinates[e][0].length;
                // 根据bonus个数获取bonus大奖配置
                const bonusAwards = BIG_AWARDS[bonusCount];
                // 基础奖
                const baseAwards = 7.5 * this.totalBet;
                // 奖池奖 这里除10 是保留以前逻辑
                const jackpotAwards = Math.ceil(this.jackpot * bonusAwards.ratio * (this.totalBet / 10));
                // 扣除奖池
                const allAwards = baseAwards + jackpotAwards;
                this.jackpot -= allAwards;

                result[e] = { bonusNum: bonusCount, award: allAwards, type: bonusAwards.name };
                this.winningDetails.push({type: bonus, num: bonusCount, win: 0})
            } else if (ordinaryElements.includes(e)) {
                // 如果是普通元素

                result[e] = {};
                // 先获取赔率
                const elementOddsConfig = weights[e].clearAward[this.gameLevel];

                for (let i in clearCoordinates[e]) {
                    const len = clearCoordinates[e][i].length;
                    let odds: number;

                    // 如果开出了引爆元素且元素是 被随机消除的元素 但消除元素不足的情况 默认 2倍
                    if (e === this.clearAll && len < gameLevelMappingElementsNum[this.gameLevel]) {
                        odds = 2;
                    } else if (!elementOddsConfig[len - 3 - this.gameLevel]) {
                        odds = elementOddsConfig[elementOddsConfig.length - 1];
                    } else {
                        odds = elementOddsConfig[len - 3 - this.gameLevel];
                    }

                    this.winningDetails.push({type: e as elementType, num: len, win: odds * this.totalBet / 10})


                    result.windowAward += odds;
                    result[e]['group' + i] = {award: odds};
                }
            }
        }

        result.jackpotMoney = this.jackpot;

        return result;
    }
}


/**
 * 创建埃及夺宝开奖
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
export function isHaveBet (betNum: number, betOdds: number): boolean{
    return baseBetList.includes(betNum) && oddsList.includes(betOdds);
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
    return random(1, 6);
}


/**
 * 根据投掷结果计算结果
 * @param totalBet 总押注
 * @param awardType 当前位置的类型
 * @param littleGameAccumulate 小游戏个人累积
 * @param jackpot 房间奖池
 */
export function throwingDiceResult(totalBet: number,
                                   awardType: string,
                                   littleGameAccumulate: number,
                                   jackpot: number) {
    // 开奖结果 第一个是 普通投掷结果开奖 第二个是最后奖池开奖
    let award = [0, 0],
        // 收益
        littleGameWin = 0,
        // 投掷次数
        throwNum = 0,
        // 选择的参数 需要传给前端
        select,
        // 选择的bonus宝箱类型
        selectType,
        // 奖池收益
        jackPotGain = 0,
        // 大奖类型 只有在通关的情况下得到宝箱大奖才会触发
        bigPrizeType;

    // 如果开奖的位金 银 铜 币
    if (coinList.includes(awardType)) {
        // 这里保留以前的写法传给前端
        award[0] += Math.floor(littleGameAccumulate * awardOdds[awardType]);
        littleGameWin += award[0];
    } else if (awardType === dice) {
        // 如果为dice类型 投掷次数加一
        throwNum++;
    } else if (awardType === littleBonus) {
        const awards = { r0: 'g', r1: 'king', r2: 'g', r3: 'diamond', r4: 'g', r5: 'platinum', r6: 'g', r7: 'gold' };
        const weight = [21, 6, 21, 5, 21, 3, 21, 2];

        // 如果玩家的押注的7.5倍大于奖池则不开奖池大奖
        if (totalBet * 7.5 > jackpot) {
            [1, 3, 5, 7].forEach(p => weight[p] = 0);
        }

        // 转换每个元素的权重
        const weightArray = weight.map((e, i) => {
            return { ['r' + i]: e };
        });

        select = selectEle(weightArray);
        selectType = awards[select];

        // 如果是g 则按照普通金币处理
        if (select.selectType === 'g') {
            award[0] += Math.floor(littleGameAccumulate * awardOdds.gold);
        } else {
            bigPrizeType = selectType;
            // 至少让他赢押注的7.5倍
            const baseWin = totalBet * 7.5;

            // 奖池奖 (奖池 - 下注金额 * 7.5） * （玩家总押注 / 10) * 宝箱类型的比例（eg: 0.00001）
            let jackpotWin = (jackpot - baseWin) * (totalBet / 10) * littleGameBonusOdds[selectType];

            if (jackpotWin < 0) jackpotWin = 0;

            // 累积
            awards[1] = Math.floor(baseWin + jackpotWin);

            jackPotGain = award[1];
        }
    }

    return {award, jackPotGain, select, selectType, throwNum, littleGameWin, bigPrizeType};
}

/**
 * 在n*n的数组中随机一个2*2的矩形
 * @param n
 */
function randomSquare(n): string[] {
    if (n < 2) {
        throw new Error(`参数有误 ${n}`);
    }
    const first = [random(0, n - 1), random(0, n - 1)];
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
 * 消除同类元素
 * @param similarElementPoints 同类
 * @param gameLevel 关卡等级
 */
function clearSimilarElements(similarElementPoints: number[][], gameLevel: number) {
    let mid: { [x: string]: Set<string> } = {};
    for (let i in similarElementPoints) {
        for (let j in similarElementPoints) {
            // 如果两个坐标相邻 则把相临坐标加入集合
            if (isAdjacent(similarElementPoints[i], similarElementPoints[j])) {
                const key = similarElementPoints[i].toString();
                if (!mid[key]) {
                    mid[key] = new Set();
                }

                mid[key].add(similarElementPoints[j].join('-'));
            }
        }
    }

    for (let i in mid) {
        mid[i].forEach((value) => {
            mid[value.split('-').toString()].forEach((v) => {
                mid[i].add(v);
            })
        })
    }

    // 获取所有相邻坐标
    const coordinatesList: any[]  = values(mid);

    const len = coordinatesList.length;
    coordinatesList.forEach((coordinates, index) => {
        if (!coordinates) {
            return;
        }

        for (let i = index + 1; i < len; i++) {
            if (!coordinatesList[i]) continue;

            // 如果两个集合相等 则消除
            if (isEqualSet(coordinates, coordinatesList[i])) {
                coordinatesList[i] = null;
            }
        }
    });

    // 对应得关卡 应该有多少元素被消除
    const num = gameLevelMappingElementsNum[gameLevel];

    return coordinatesList.filter(e => e !== null && e.size >= num);
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


function test() {
    const lottery = cratePharaohLottery(false,  0);

    return lottery.setTotalBet(3)
        .setDetonatorCount(5)
        .setSystemWinOrLoss(false)
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


// console.time('1')
// for (let i = 0; i < 1; i++) {
//     const result = test();
//
//     // if (result.totalWin > 3) {
//         // console.
//         console.log(result);
//     // }
//
//     // test()
//
//     // console.log(test1());
// }
// console.timeEnd('1')



