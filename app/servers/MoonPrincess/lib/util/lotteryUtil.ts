import {
    elementType,
    specialElements,
    specialElementType,
    detonator,
    gameLevelMappingElementsNum,
    // squib,
    // clearSpecialElements,
    ordinaryElements,
    // bonus,
    baseBetList,
    oddsList,
    scatter,
    Multiples, moonElements,

} from '../constant';
import * as utils from "../../../../utils";
import * as weightsC from "../config/weights";
import {selectEle} from "../../../../utils";

/**
 * 中奖详情
 * @property type 中奖类型
 * @property odds 中奖赔率
 * @property num  充能数量，0 就不充能， 1 就是充能1次，2就是充能 2次，3 就是充能3次
 */
export interface WinningDetail {
    type?: elementType,
    num: number,
    win: number,
    multiple? : number,
    weights? : any,
}


/**
 * 开奖结果
 * @property window 开奖窗口
 * @property totalWin 总收益
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property awards 每一回合产生的
 * @property clearAll 一个界面所有需要消除的元素
 * @property winningDetails 中奖具体详情
 * @property clearElements 消除元素 用以实况记录
 */
export interface PharaohLotteryResult {
    window: elementType[][],
    totalWin: number,
    roundWindows: any[],
    awards: number[],
    totalMultiple: number,
    winningDetails: WinningDetail[],
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
 * @property detonatorCount 雷管（也就是雷管 这里沿用以前的字段写法和叫法以免前端不适配）数量


 * @property weights 权重轮盘
 * @property window 窗口
 * @property roundWindows 所有消除窗口 包含初始窗口 数据结构很混乱 读的时候要仔细
 * @property totalMultiple 总赔率
 * @property awards 每个窗口的盈利结果
 * @property cont rolState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 * @property winningDetails 中奖具体详情
 */
export class Lottery {
    newer: boolean;
    bet: number;
    totalBet: number = 0;
    totalWin: number = 0;
    jackpot: number = 0;
    detonatorCount: number = 0;
    /**关卡等级 */
    gameLevel: number = 0;
    /**是否需要生成大雷管 */
    clearAll: elementType;
    weights: { [element: string]: number }[];
    window: Window = [];
    /**本局的特殊元素 */
    specialElement: specialElementType;
    roundWindows: { type: elementType; }[][][] = [];
    totalMultiple: number = 0;
    awards: number[] = [];
    controlState: 1 | 2 | 3 = 1;
    winningDetails: WinningDetail[] = [];
    clearElements: any[] = [];
    scatterCount: boolean;
    freeSpinResult: PharaohLotteryResult[] = [];
    freeSpin: boolean;
    moonRecharge : number = 0;


    constructor(newer: boolean, jackpot: number) {
        this.newer = newer;
        this.jackpot = jackpot;
    }

    private init() {
        this.totalWin = 0;
        this.window = [];
        this.totalMultiple = 0;
        this.roundWindows = [];
        this.clearAll = undefined;
        this.specialElement = undefined;
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

        // 选择元素权重
        this.selectWights();
        console.warn("this.....",this.weights)
        // 根据调控状态看时随机开奖还是调控开奖
        // if (this.controlState === 1) {
        if (true) {
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
        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.roundWindows = result.roundWindows;
        this.totalWin = result.totalWin;
        this.awards = result.awards;
        this.totalMultiple = result.totalMultiple;
        this.winningDetails = result.winningDetails;
        this.clearElements = result.clearElements;

        // 如果scatter字符大于等于3免费开开奖
        if (this.scatterCount) {
            this.freeSpinLottery();
        }
    }

    freeSpinLottery() {
        this.freeSpin = true;
        // let odds = utils.random(1, 5);

        let odds = utils.sortProbability_(Multiples);
        for (let i = 0; i < 10; i++) {
            // 新生成一个窗口
            const window = this.generateWindow();

            // 计算结果
            const result = this.calculateEarnings(window);
            result.winningDetails;
            for (const item of result.winningDetails) {
                item.win *= odds;
            }
            result.totalWin *= odds;
            result.window = window;
            result.odds = odds;
            this.freeSpinResult.push(result);
        }
        //console.warn(this.freeSpin);
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
            return { [element]: weightsC.weights[element].weight };
        });
    }

    /**
     * 生成初始窗口
     */
    generateWindow() {
        // 计算关卡
        // this.gameLevel = calculateGameLevel(this.detonatorCount);
        const window: elementType[][] = [];
        // 行数以及列数
        const num = 5;
        // 开奖矩阵 长高等款
        for (let i = 0; i < num; i++) {
            let line = [];

            while (line.length !== num) {
                // 随机一个元素
                const element = selectEle(this.weights);
                // if (this.freeSpin && element == detonator) {
                //     continue;
                // }
                // 如果为特殊元素
                // if (specialElements.includes(element)) {
                //     // 如果已经存在特殊元素或者处于杀控状态 则跳过
                //     if (this.specialElement || this.controlState === 2) {
                //         continue;
                //     }
                //
                //     // 如果是雷管
                //     if (element === detonator) {
                //         this.roundDetonatorCount++;
                //     }
                //
                //     this.specialElement = element;
                // }

                line.push(element);
            }

            window.push(line);
        }

        console.warn("window.........",window)
        return window;
    }


    /**
     * 计算收益
     */
    private calculateEarnings(window: elementType[][]) {
        // 改变首个窗口
        // this.roundWindows.push(this.changeFirstWindow());
        let roundWindows: { type: elementType; }[][][] = [];
        roundWindows.push(this.changeFirstWindow());

        // 初始窗口元素消除
        let { clearCoordinates } = this.eliminateWindowElements(window);

        // this.clearAll = randomType;
        let clearElements: any[] = [];
        let totalMultiple = 0;
        let awards: number[] = [];
        let winningDetails: WinningDetail[] = [];
        //是否是第一小回合
        let multiple = 1;

        // 如果可消除元素不为空
        while (!utils.isVoid(clearCoordinates)) {
            // 查看可消除元素盈利情况
            const { result: winAward, winningDetails: Tmp } = this.calculateClearElementProfit(clearCoordinates , this.window , multiple);
            winningDetails.push(...Tmp)
            // this.clearElements.push(clearCoordinates);
            clearElements.push(clearCoordinates);

            totalMultiple += winAward.windowAward / 10;


            awards.push(winAward.windowAward * this.totalBet / 10);

            // 补齐新窗口
            const result = this.subsequentWindow(window, clearCoordinates);
            // 把要删除的位置放入
            roundWindows.push(result.position);
            // 新的界面
            roundWindows.push(result.newly);

            window = result.window;
            clearCoordinates = this.eliminateWindowElements(window).clearCoordinates;
        }

        // 最终收益
        let totalWin = totalMultiple * this.totalBet;
        let result: PharaohLotteryResult = {
            clearElements,
            totalMultiple,
            awards,
            totalWin,
            window,
            winningDetails,
            roundWindows,
            odds: 1,
        }
        return result;
    }

    /**
     * 消除窗口元素
     * @param window 窗口
     */
    private eliminateWindowElements(window: Window): { clearCoordinates: { [key: string]: any[] } } {
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

        console.warn(`元素数组坐标typePoints: ${JSON.stringify(typePoints)}`);

        // 需要被消除的元素
        let conversionPoints: { [x: string]: number[][][] } = {};

        //所有元素进行一次
        for (let type in typePoints) {
            // 如果是普通元素则原样保存 否则返回需要消除元素坐标的集合
            conversionPoints[type] =  isLine(typePoints[type])
        }

        //对所有元素+ 百搭元素进行一次筛选
        let moon_wild_list = typePoints[weightsC.moon_wild];

        let list : any = [];
        // 不同公主元素的混搭
        for (let type in typePoints) {
            if(moonElements.includes(type)){
                list = list.concat(typePoints[type])
            }
        }

        list = list.concat(moon_wild_list);

        //不同公主元素得混搭
        conversionPoints[weightsC.moon_dif] = isLine(list);

        for (let type in typePoints) {
            if(ordinaryElements.includes(type)) {
                // 如果是普通元素则原样保存 否则返回需要消除元素坐标的集合
                let list_ = [];
                list_ = moon_wild_list.concat(typePoints[type]);
                conversionPoints[type] = isLine(list_)
            }
        }


        console.warn(`需要被消除的元素conversionPoints: ${JSON.stringify(conversionPoints)}`)
        // 过滤掉为空数组的值 保留存在的元素
        const clearCoordinates: { [key: string]: any[] } = utils.filter((coordinates: any) => coordinates.length > 0)(conversionPoints);


        console.warn(`过滤掉的空数组保留空元素clearCoordinates: ${JSON.stringify(clearCoordinates)}`)

        for (let i in clearCoordinates) {
            // 如果要消除得为普通元素 把坐标转换为正常坐标
            if (ordinaryElements.includes(i) ) {
                clearCoordinates[i] = clearCoordinates[i].map(e => Array.from(e).map((k: any) => k.split('-')));
            }
        }

        // 转换前端坐标
        for (let i in clearCoordinates) {
            for (let j in clearCoordinates[i]) {
                clearCoordinates[i][j] = utils.sortWith([
                    (r1, r2) => r2[1] - r1[1],
                    (r1, r2) => r1[0] - r2[0]
                ])(clearCoordinates[i][j])
            }
            clearCoordinates[i] = utils.sortWith([
                (r1, r2) => r2[0][1] - r1[0][1],
                (r1, r2) => r1[0][0] - r2[0][0],
            ])(clearCoordinates[i])
        }
        console.warn(`过滤掉的空数组保留空元素clearCoordinates2222222222: ${JSON.stringify(clearCoordinates)}`)
        return { clearCoordinates };
    }





    /**
     * 查看数组中相同得元素有几个
     * arr：[1,1,1,1,3]
     * prev:{'1':4,'3' :1,}
     * @param arr
     */
    private statisticalFieldNumber_key(arr : number []) {
        let list = arr.reduce(function (prev, next) {
            prev[next] = (prev[next] + 1) || 1;
            return prev;
        }, {});

        let resultList = [];
        for (let key in list) {
            resultList.push({ key: Number(key), value: list[key] })
        }
        return resultList ;
    }



    /**
     * 改变第一个窗口元素 老写法
     */
    private changeFirstWindow() {
        return this.window.map(line => {
            return line.map(e => {
                return { type: e }
            })
        });
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
                    const index = utils.findLastIndex(v => v !== 'del')(windowTranscript[i].slice(0, j));
                    if (index !== -1) {
                        [windowTranscript[i][j], windowTranscript[i][index]] =
                            [windowTranscript[i][index], windowTranscript[i][j]];
                    }
                }
            }
        }

        // 新补全窗口不再生成特殊元z素
        const completionWeights = Object.keys(weightsC.weights).map(element => {
            return ordinaryElements.includes(element) ? { key: element, value: weightsC.weights[element].weight } :
                { key: element, value: 0 };
        });

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

        return { window: windowTranscript, newly, position }
    }



    /**
     * 计算消除元素的收益
     * @param clearCoordinates 消除的元素以及坐标
     */
    private calculateClearElementProfit(clearCoordinates: { [key: string]: any[] } ,windows : any [] , multiple : number) {
        let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0 };
        let winningDetails: WinningDetail[] = [];
        for (let e in clearCoordinates) {
            if (ordinaryElements.includes(e)) {
                // 如果是普通元素
                result[e] = {};
                // 先获取赔率
                const elementOddsConfig = weightsC.weights[e].clearAward;
                console.warn("elementOddsConfig......",elementOddsConfig)
                for (let i in clearCoordinates[e]) {
                    let weights_index = clearCoordinates[e][i];
                    const len = weights_index.length;
                    let odds: number ;

                    // 如果开出了引爆元素且元素是 被随机消除的元素 但消除元素不足的情况 默认 2倍
                    // if (e === this.clearAll && len < gameLevelMappingElementsNum[this.gameLevel]) {
                    //     odds = 2;
                    // } else if (!elementOddsConfig[len - 3 ]) {
                    //     odds = elementOddsConfig[elementOddsConfig.length - 1];
                    // } else {
                    //     odds = elementOddsConfig[len - 3 ];
                    // }

                    let length = len - 3;
                    let num = 0;
                    odds = elementOddsConfig[length];
                    let weights = [];
                    for(let m of weights_index){
                        weights.push(findWeightInWindows(windows , m))
                    }

                    //判断元素是否是月亮公主
                    if(weightsC.moon_weights.includes(e)){
                        //判断是否是一个元素，如果是一个元素就跳过，如果是不同的月亮公主那么就判断
                        if(weights.filter(x=>x == e || x == weightsC.moon_wild).length !== weights.length){
                            odds = weightsC.clearAward_princess[length];
                        }
                        //判断是有几个公主然后可以充能
                        if(weights.length == 3){
                            num = 1;
                        }else if(weights.length == 4){
                            num = moon_recharge(weights);
                        }else if(weights.length == 5){
                            num = 3;
                        }
                        //公主充能
                        this.moonRecharge += num;
                    }

                    winningDetails.push({ type: e as elementType, num: num, win: odds * 100 * multiple  , multiple : multiple , weights  })
                }
            }
        }
        // result.jackpotMoney = this.jackpot;
        console.warn("winningDetails....",winningDetails)
        return { result, winningDetails };
    }
}


/**
 * 创建月亮公主开奖
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
export function isHaveBet(betNum: number, betOdds: number): boolean {
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
 * 消除同类元素
 * @param similarElementPoints 同类
 * @param gameLevel 关卡等级
 */
function clearSimilarElements(similarElementPoints: number[][]) {

    console.warn(`similarElementPoints:${JSON.stringify(similarElementPoints)}`)


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

    console.warn("mid11",mid)

    for (let i in mid) {
        mid[i].forEach((value) => {
            mid[value.split('-').toString()].forEach((v) => {
                mid[i].add(v);
            })
        })
    }
    // 获取所有相邻坐标
    const coordinatesList: any[] = utils.values(mid);
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
    const num = 3;

    console.warn("222" , coordinatesList.filter(e => e !== null && e.size >= num))

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



/**
 * 判断两个集合数据结构是否相等
 * @param setOne 集合一
 * @param setTwo 集合二
 */
function isLine( similarElementPoints: number[][]) {
    let list_x = [];
    let list_y = [];

    for(let m of similarElementPoints){
        list_x.push(m[0]);
        list_y.push(m[1]);
    }

    let list_x_ = this.statisticalFieldNumber_key(list_x);
    let list_y_ = this.statisticalFieldNumber_key(list_y);


    list_x_ = list_x_.filter(x=>x.value >= 3);
    list_y_ = list_y_.filter(x=>x.value >= 3);

    let list = [];
    if(list_x_.length > 0){
        for(let x of list_x_){
            let list_xx = [];
            for(let m of similarElementPoints){
                if(m[0] == x.key){
                    list_xx.push(m);
                }
            }
            if(list_xx.length >= 3){
                list = list.concat(clearSimilarElements(list_xx));
            }
        }

    }

    if(list_y_.length > 0){
        for(let y of list_y_){
            let list_yy = [];
            for(let m of similarElementPoints){
                if(m[1] == y.key){
                    list_yy.push(m);

                }
            }
            if(list_yy.length >= 3) {
                list = list.concat(clearSimilarElements(list_yy));
            }
        }
    }
    return list;
}



//根据坐标查找是什么元素
function findWeightInWindows(windows : any , index : string []) {

    let index_x = Number(index[0]);
    let index_y = Number(index[1]);

    return windows[index_x][index_y];
}


/**
 * 查看数组中相同得元素有几个
 * arr：[1,1,1,1,3]
 * prev:{'1':4,'3' :1,}
 * @param arr
 */
function statisticalFieldNumber_string(arr : string []) {
    let list = arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});

    let resultList = [];
    for (let key in list) {
        resultList.push({ key: key, value: list[key] })
    }
    return resultList ;
}


//判断公主充能
function moon_recharge( weights : string [] ) {
    let ss = statisticalFieldNumber_string(weights);
    let z = ss.find(x=>x.key == 'Z');
    if(ss.length == 1){
        return 2;
    }else if(z && z.value == 2 && ss.length == 3){
        return 3;
    }else if(ss.length == 2 && !z ){
        if(ss[0].value == 3 || ss[1].value == 3){
            return 3;
        }
    }
    return 2;
}


//
// function test(roundDetonatorCount: number, totalBet: number) {
//     const lottery = cratePharaohLottery(false, 0);
//     //
//     // return lottery.setTotalBet(totalBet)
//     //     .setDetonatorCount(roundDetonatorCount)
//     //     // .setSystemWinOrLoss(false)
//     //     .result();
//     lottery.window = lottery.generateWindow();
//     console.warn(" lottery.window........", lottery.window)
//
// }
//
// test(0,10)
// function test1() {
//     const lottery = cratePharaohLottery(false,  0);
//
//
//     return lottery.setTotalBet(3)
//         .setDetonatorCount(10)
//         .result();
// }


// console.time('1')
// const totalBet = 10 * 100;
// let totalWin = 0;
// let FreetotalWin = 0;
// let roundDetonatorCount = 0;
// let freeSpin = 0;
// for (let i = 0; i < 100000; i++) {
//     const result = test(roundDetonatorCount, totalBet);
//     roundDetonatorCount += result.roundDetonatorCount;
//     if (roundDetonatorCount >= 45) {
//         roundDetonatorCount = 0;
//     }
//     totalWin -= totalBet;
//     totalWin += result.totalWin;
//     if (result.freeSpinResult.length > 0) {
//         freeSpin++;
//         for (const freeSpinResult of result.freeSpinResult) {
//             totalWin += freeSpinResult.totalWin;
//             FreetotalWin += freeSpinResult.totalWin;
//         }
//     }

//     // if (result.totalWin > 3) {
//     // console.
//     // console.log(JSON.stringify(result));
//     // }

//     // test()
//     // console.log(test1());
// }
// console.log(`totalWin=${totalWin / 100}金币|freeSpin=${freeSpin}|FreetotalWin=${FreetotalWin/100}金币`);
// console.timeEnd('1')