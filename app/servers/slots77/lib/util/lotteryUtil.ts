import {default as config, elementType, prizeType} from "../constant";
import {clone, random, selectElement} from '../../../../utils';

// 一个scatter 图标生成概率
const ONE_SCATTER_PROBABILITY = 0.1555;
// 两个scatter 图标生成概率
const TWO_SCATTER_PROBABILITY = 0.0242;
// 3 - 5 scatter 图标生成概率
const OTHER_SCATTER_PROBABILITY = 0.0018;


/**
 * 判断选线是否合理
 */
export const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= config.winLines.length;

/**
 * 中奖线
 * @property linkNum 几连
 * @property linkIds 连接的元素
 * @property money 这条线收益
 * @property type 开奖类型
 * @property goldList 中奖金币
 * @property multiple 赔率
 */
interface WinLine {
    linkNum: number,
    linkIds: elementType[],
    money: number,
    type: elementType,
    goldList: any [],
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
 * @property freeSpin 是否免费开奖
 * @property freeSpinResult 免费开奖结果
 * @property goldList 金币数量
 */
export interface SlotResult {
    window: elementType[][],
    // jackpotWin: number,
    winLines: WinLine[],
    goldList: any [],
    jackpotType: prizeType,
    totalWin: number,
    // multiple: number,
    freeSpin: number;
    freeSpinResult: FreeSpinResult[];
    bankCard : number;
}

/**
 * 免费摇奖的结果
 * @property gold_window 窗口
 * @property totalWin 盈利
 */
interface FreeSpinResult {
    gold_window: any [],
    totalWin: number
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
 * @property goldList 金币记录
 * @property scatterCount 特殊字符个数
 * @property freeSpinResult 免费开奖结果
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
    weights: {[element: string]: number[]};
    window: elementType[][] = [];
    winLines: WinLine[] = [];
    totalMultiple: number = 0;
    controlState: 1 | 2 | 3 = 1;
    freeSpin: number = 0;
    goldList: any [];
    scatterCount: number = 0;
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
        this.scatterCount = 0;
        this.freeSpin = 0;
        this.goldList = [];
        this.freeSpinResult = [];
    }

    /**
     * 设置押注额和中将线
     * @param bet 下注
     * @param lineNum 几条线
     */
    setBetAndLineNum(bet: number, lineNum: number) {
        this.bet = bet;
        this.lineNum = 3;
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

        console.warn("this.weights",this.weights)

        // 如果是不调控 随机开奖
        // if (this.controlState === 1) {
            this.randomLottery();
        // } else {
        //     this.controlLottery();
        // }
        
        return {
            window: this.window,
            // jackpotWin: this.jackpotWin,
            winLines: this.winLines,
            jackpotType: this.jackpotType,
            totalWin: this.totalWin,
            // multiple: this.totalMultiple,
            freeSpin: this.freeSpin,
            freeSpinResult: this.freeSpinResult,
            goldList : this.goldList,
            bankCard : null,
        }
    }

    /**
     * 随机开奖
     */
    private randomLottery() {
        // 初始化
        this.init();

        // 生成窗口
        // this.window = this.generateWindow();

        this.window = [ [ 'F', 'E', 'B' ], [ 'W', 'W', 'W' ], [ 'E', 'C', 'G' ] ];
        console.warn(" this.window....", this.window)

        // 是否生成 scatter元素
        // this.modifyInitialWindow();
        
        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        // 如果scatter字符大于等于3免费开开奖
        if (this.freeSpin >= 3) {
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
                    weights.W = weights.W.map(element => element += config.overallControlSetting[roulette]);
                }

                // 单体调控一 属于放奖体调控 提高 wild元素出现的权重
                if (this.singleControlOne) {
                    weights.W = weights.W.map(element => element += config.singleControlSetting[roulette][0]);
                }

                // 单体调控二 属于放奖体调控 提高 wild元素出现的权重
                if (this.singleControlTwo) {
                    weights.W = weights.W.map(element => element += config.singleControlSetting[roulette][1]);
                }
            }
        }

        // 如果不开奖池奖 (第四列或者第五列不开wild和7)
        if (this.openPoolAward) {
            const index = Math.random() < 0.5 ? 3 : 4;

            if (index === 3) weights.W[index] = 0;

            config.sevenElementGroup.forEach(element => weights[element][index] = 0);
        }

        this.weights = weights;

    }

    /**
     * 生成窗口
     */
    generateWindow(): elementType[][] {
        const window:elementType[][] = [];
        const elementKeys = Object.keys(this.weights);

        // 生成一个矩阵
        for (let i = 0; i < config.column; i++) {
            const elementSet =  elementKeys.map(element => {
                return {key: element, value: this.weights[element][i]};
            });

            // 一列
            const line = [];

            for (let j = 0; j < config.row; j++) {
                // 随机选择一个元素
                line.push(selectElement(elementSet));
            }

           window.push(line);
        }

        return window;
    }

    /**
     * 修改初始窗口
     */
    // private modifyInitialWindow() {
    //     // 判断是否添加 scatter元素
    //     // this.scatterCount = this.getScatterNumber();
    //
    //     // 如果scatter元素为0 则直接返回
    //     // if (this.scatterCount === 0) {
    //     //     return;
    //     // }
    //
    //     // 中奖的元素坐标
    //     let winCoordinates: Set<string> = new Set();
    //
    //     // 选择中奖线
    //     const selectLines: number[][] = config.winLines.slice(0, this.lineNum);
    //
    //     selectLines.forEach((line) => {
    //         // 这条线上的元素
    //         const elementLine: elementType[] = line.map((l, i) => this.window[i][l - 1]);
    //
    //         // 如果其中存在wild元素,将其转成其前一个元素 第一行不会有 wild 元素 所以这里不会报错
    //         elementLine.forEach((element, index) => {
    //             if (element === config.wild) {
    //                 elementLine[index] = elementLine[index - 1];
    //             }
    //         });
    //
    //         // 计算元素线中奖结果
    //         const lineResult: LineResult = this.calculateLineResult(elementLine);
    //
    //         // 如果有中奖元素 则记录下元素的坐标
    //         if (lineResult.elementType) {
    //             const coordinates: string[] = line.slice(0, lineResult.linkNum).map((l, i) => `${i}-${l-1}`);
    //             coordinates.forEach(c => winCoordinates.add(c));
    //         }
    //     });
    //
    //     // 先转换窗口的所有坐标
    //     let allCoordinates: string[] = [];
    //     this.window.forEach((column, columnNumber) => {
    //         column.forEach((element, rowNumber) => allCoordinates.push(`${columnNumber}-${rowNumber}`));
    //     });
    //
    //     // 找出没有中奖的坐标
    //     const lossCoordinates: Set<string> = new Set();
    //     allCoordinates.forEach(c => !winCoordinates.has(c) && lossCoordinates.add(c));
    //
    //     // 如果没有未中奖的坐标或者够替换的坐标不够 则随机替换 4、5列的坐标
    //     if (lossCoordinates.size < this.scatterCount) {
    //         // 取所有的坐标的最后六个 为四五列坐标
    //         allCoordinates.slice(allCoordinates.length - 6).forEach(c => lossCoordinates.add(c));
    //     }
    //
    //     let alternateCoordinates = [...lossCoordinates];
    //
    //     // 替换元素
    //     for (let i = 0; i < this.scatterCount; i++) {
    //         // 随机一个坐标
    //         const coordinate = alternateCoordinates[random(0, alternateCoordinates.length - 1)];
    //
    //         const realCoordinate = coordinate.split('-').map(p => Number(p));
    //
    //         // 替换元素
    //         this.window[realCoordinate[0]][realCoordinate[1]] = (config.scatter as "S");
    //
    //         // 过滤掉已经替换的坐标
    //         alternateCoordinates = alternateCoordinates.filter(c => c !== coordinate);
    //     }
    // }

    /**
     * 计算收益
     */
    private calculateEarnings(window: elementType[][]): {winLines: WinLine[], totalWin: number} {
        // 选择中奖线
        const selectLines: number[][] = config.winLines.slice();



        // 中奖线
        let winLines: WinLine[] = [],
        // 累积收益
            totalWin = 0;

        selectLines.forEach((line) => {
            // 这条线上的元素
            const elementLine: elementType[] = line.map((l, i) => window[i][l - 1]);

            console.warn("elementLine..",elementLine)

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
                let  goldList = [];

                // 中奖赔率
                let  odds = config.award[lineResult.elementType][lineResult.rewardType];
                let lineProfit = this.bet * odds;
                totalWin += lineProfit;

                // 累计总赔率
                this.totalMultiple += odds;

                this.goldList = goldList;

                winLines.push({  linkNum: lineResult.linkNum, linkIds : transcript, money: lineProfit, type: lineResult.elementType,  multiple: odds , goldList });
            }
        });



        //处理金币元素
        let middle = window[1].filter(m=>m == config.gold);
        if(middle.length == 3){
            let  lineProfit = 0;
            let  odds = 0;
            let  goldList = [];
            //如果金币，那么就需要赋值金币的是什么数字
            let goldsKeys = Object.keys(config.golds)

            for (let i = 0; i < 3; i++) {
                const elementSet =  goldsKeys.map(gold => {
                    return {key: gold, value: config.golds[gold][0]};
                });
                let gold = selectElement(elementSet);

                this.window[1][i] = gold;

                goldList.push(gold);

                totalWin += Number(gold);

                lineProfit += Number(gold);

                //设置免费摇奖次数
                this.freeSpin = config.freeSpin;
            }

            winLines.push({  linkNum: 3, linkIds : middle, money: lineProfit, type: 'W', multiple: odds , goldList });

            this.goldList = goldList;

            this.jackpotType = 'bonus' ;

        }else if(middle.length > 0 &&  middle.length < 3){
            for(let m = 0 ; m < 3 ; m++){
                let index = random(1,10);
                // this.goldList.push(index);
                if( this.window[1][m] == config.gold){
                    // console.warn("index",index)
                    // @ts-ignore
                    this.window[1][m] = index.toString()
                }
            }


        }


        this.totalWin += totalWin;

        return {winLines, totalWin};
    }

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     */
    private calculateLineResult(elementLine: elementType[]): LineResult {
        // 取第一个元素
        const firstElement = elementLine[0];

        let result: LineResult = {elementType: null, rewardType: 0, linkNum: 0, prizeType: 'none'};

        let list = statisticalFieldNumber_string(elementLine);

        //查看所有元素是否都是一个元素
        if( list.length == 1){
                result.linkNum = 3;
                result.elementType = firstElement;
                result.rewardType = 0;
                // if(firstElement == config.gold){
                //     result.prizeType = 'bonus';
                // }

        }

        return result;
    }

    private freeSpinLottery() {

        while (this.freeSpin > 0){
            // 新生成一个窗口
            const gold_window = this.generateWindow_gold();

            // 计算结果
            const totalWin = this.freeSpin_calculateEarnings(gold_window);

            console.warn("  freeSpinLottery_totalWin..",  totalWin )

            this.freeSpinResult.push({ totalWin: totalWin, gold_window });

            //如果有金币掉落就充值免费次数
            if(totalWin > 0){

                this.totalWin += Number(totalWin);

                this.freeSpin = config.freeSpin;
            }else {
                this.freeSpin -= 1;
            }
            console.warn("  this.freeSpin ..",  this.freeSpin )
        }

        console.warn(" this.freeSpinResult..", this.freeSpinResult)
    }


    /**
     * 计算免费摇奖的收益
     */
    private freeSpin_calculateEarnings(gold_window : any []){


        console.warn("gold_window.....",gold_window)

        let totalWin = 0;
        //计算收益
        let first_line = gold_window[0].filter(x=> x == 'F_Y');

        let second_line = gold_window[1].filter(x=> x == 'F_Y');

        if(first_line.length !== 3){
            for(let i = 0 ;i < 3 ; i++){
                let key = gold_window[0][i];
                if(key !== 'F_Y' ){
                    console.warn("key....",key)
                    let gold = Number(key);
                    totalWin += gold;
                }
            }
        }


        if(second_line.length !== 3){
            for(let i = 0 ;i < 3 ; i++){
                let key = gold_window[1][i];
                if(key !== 'F_Y' ){
                    console.warn("key....",key)
                    let gold = Number(key);
                    totalWin += gold;
                }
            }
        }

        console.warn("this.goldList......",this.goldList , totalWin)
        if(this.goldList.length == 3){
            if(second_line.length !== 3 || first_line.length !== 3){
                this.goldList.map(gold=>{
                    totalWin += Number(gold);
                })
            }
        }


        return  totalWin;


    }

    /**
     * 获取金币数字
     */
    private getGold_key(){
        let goldsKeys = Object.keys(config.golds);
        const elementSet =  goldsKeys.map(gold => {
            return {key: gold, value: config.golds[gold][0]};
        });
        let gold = selectElement(elementSet);
        return gold;
    }



    /**
     * 免费摇奖获取金币和银币的数组
     */
    private generateWindow_gold(){

        let gold_window = [];

        const goldsKeys = Object.keys(config.weight_golds);
        // 生成一个矩阵
        for (let i = 0; i < 2; i++) {
            const elementSet =  goldsKeys.map(element => {
                return {key: element, value: config.weight_golds[element][0]};
            });

            // 一列
            const line = [];

            for (let j = 0; j < config.row; j++) {
                // 随机选择一个元素
                let key = selectElement(elementSet);
                if(key == 'F_G'){
                    //再从金币权重里面获取金币数字
                    key = this.getGold_key();
                }
                line.push(key);
            }

            gold_window.push(line);
        }


        return gold_window;
    }



    /**
     * 获取Scatter字符个数
     */
    private getScatterNumber(): number {
        // 如果是调控状态 则随机生成 0 - 2个
        if (this.controlState !== 1) {
            return [0, 1, 2][random(0, 2)];
        }

        let randomNumber = Math.random();

        // 满足概率随机生成 3 - 5 个x图标
        if (randomNumber < OTHER_SCATTER_PROBABILITY) {
            // 3 - 5的生成概率
            randomNumber = Math.random();

            // 1/7的概率生成5个图标
            if (randomNumber < 1/7) {
                return  5;
            }

            // 2/7 的概率生成4个
            if (randomNumber < 2/7) {
                return 4;
            }

            return 3;
        }

        // 满足概率生成 2 个图标
        if (randomNumber < TWO_SCATTER_PROBABILITY) {
            return 2;
        }

        // 满足概率生成1个图标
        if (randomNumber < ONE_SCATTER_PROBABILITY) {
            return 1;
        }

        return 0;
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
 * 玩家金币翻倍
 */

export function  goldDoubleResult(totalWin : number ) {
    let cards = [
        2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13,  14, //黑桃2-A
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, //红桃2-A
        28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, //梅桃2-A
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, //方桃2-A
        54, 55,											    // 小鬼，大鬼
    ];
    //判断哪个获胜
    let randomNumber = random(1,10);

    let bankWin = false;
    if(randomNumber > 6){
        bankWin = true;
    }
    let bankCard = 0;
    let idlerCard = 0;
    let finallyWin = 0;
    if(bankWin){
        //如果庄家获胜，那么庄家得牌就要比闲家得牌点数大
        let bankNumber = random(3,10);
        let idlerNumber = 0;
        if(bankNumber == 3){
            idlerNumber = 2;
        }else {
            idlerNumber = random(2,bankNumber - 1);
        }
         bankCard = getCard(bankNumber);
         idlerCard = getCard(idlerNumber);
    }else {
        //判断闲家能否拿王
        let m = random(1,10);
        if(m > 8){
            //如果大于8 那么就拿王
            idlerCard = m == 9 ? 54 : 55;
            bankCard = getCard(random(3,10)) ;

        }else {
            let idlerNumber = random(3,14);
            let bankNumber = 0;
            if(idlerNumber == 3){
                bankNumber = 2;
            }else if(idlerNumber > 10){
                bankNumber = random(2,10);
            }else {
                bankNumber = random(2,idlerNumber - 1);
            }

            bankCard = getCard(bankNumber);
        }

        finallyWin = totalWin * 2;

    }

    //删除庄家得牌
    let index_bank = cards.indexOf(bankCard);
    cards.splice(index_bank,1);

    //删除闲家得牌
    let index_idler = cards.indexOf(idlerCard);
    cards.splice(index_idler,1);

    cards.sort(() => 0.5 - Math.random());

    let lastCards = [cards[0],cards[1],cards[2]];

    let result = {
        lastCards : lastCards , //其余三张牌
        bankCard : bankCard , //其余三张牌
        idlerCard : idlerCard , //其余三张牌
        totalWin : totalWin,
        finallyWin : finallyWin,
    }

    return result ;


}

/**
 * 根据值获取牌点数
 */

function getCard(cardNumber : number) {
      let key = random(0,3);

      return  (key * 13 ) + cardNumber;

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
