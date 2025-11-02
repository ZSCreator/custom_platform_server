import {GoodLuckType, odds, kindSubSet, areaOdds, oddsSubSet, roulette} from "../FruitMachineConst";
import {sum} from "../../../../utils";


/**产生一个范围内随机数 */
function getRandomNumber(min: number, max: number) {
    if (max % 1 !== 0 || min % 1 !== 0) {
        throw "min, max不能为非整数";
    }

    const MAX = Math.max(min, max);
    const MIN = Math.min(min, max);
    const MM = MAX - MIN + 1;

    return Math.floor(Math.random() * MM) + MIN;
}


function judgeWinArea(results) {
    const winArea = {};

    // 过滤掉 good luck 的下标
    const colResults = results.filter(result => !kindSubSet.goodLuck.includes(result));

    // 判断赢的区域以及赔率
    for (let i = 0; i < colResults.length; i++) {
        let type, odds = 0;

        // 判断类型
        for (let name in kindSubSet) {
            if (kindSubSet[name].includes(colResults[i])) {
                type = name;
                break;
            }
        }

        // 判断赔率
        for (let resOdds in oddsSubSet) {
            if (oddsSubSet[resOdds].includes(colResults[i])) {
                odds = areaOdds[resOdds];
                break;
            }
        }

        if (!winArea[type]) {
            winArea[type] = odds;
        } else {
            winArea[type] += odds;
        }
    }

    return winArea;
}

/**
 * 获取一个结果集
 * 特殊规则
 * 当玩家摇中了“good luck”，会随机从⼤三元、⼤四喜、⼩三元、开⽕⻋中随机选择⼀个进⾏放奖。
 * ⼤三元为玩家同时中奖：蛇果、橘⼦、榴莲
 * ⼤四喜为玩家同时中奖：四个⻄⽠
 * ⼩三元为玩家同时中奖：⾹蕉、星星、苹果
 * 开⽕⻋为玩家同时中奖：任意2-5个图标（任意图标⽆红蓝bonus）
 * @return {Object} result 结果集 给前端
 * @return {Object} winArea 赢的区域 自用
 * */
// {data: { goodLuck: GoodLuckType, results: [] }, winArea: any}
export function getLotteryResult(): any {
    const data = { goodLuck: GoodLuckType.NONE, results: [] };
    let num = 0;

    // 根据区域产生一个随机数
    const count = getRandomNumber(1, sum(odds));

    // console.log(count);
    for (let oddsType in odds) {
        num += odds[oddsType];
        // console.log('5555', num);
        if (count <= num) {

            // 如果时good luck
            if (oddsType === "goodLuck") {
                data.goodLuck = randomType();
                data.results.push(...goodLuckLottery(data.goodLuck));
            } else {
                data.results.push(oddsSubSet[oddsType][getRandomNumber(0, oddsSubSet[oddsType].length - 1)]);
            }

            const winArea = judgeWinArea(data.results);

            return { data, winArea };
        }
    }
}

/**
 * 随机一个GoodLuck 类型
 */
function randomType(): GoodLuckType {
    const types =  [GoodLuckType.BIG_TERNARY, GoodLuckType.FOUR_HAPPY,
        GoodLuckType.MIN_TERNARY, GoodLuckType.TRAIN];

    return types[getRandomNumber(0, types.length - 1)]
}

/**
 * 幸运开奖
 */
function goodLuckLottery(type: GoodLuckType): number[] {
    switch (type) {
        case GoodLuckType.BIG_TERNARY:
            return bigTernary();
        case GoodLuckType.MIN_TERNARY:
            return minTernary();
        case GoodLuckType.TRAIN:
            return train();
        case GoodLuckType.FOUR_HAPPY:
            return fourHappy();
        default:
            throw new Error(`错误类型开奖: ${type}`);
    }
}

/**
 * 大三元
 * 同时中奖 蛇果、橘⼦、榴莲
 */
function bigTernary() {
    let result = [];

    result.push(...oddsSubSet.snakeFruit, ...oddsSubSet.orange, ...oddsSubSet.durian);

    return result;
}

/**
 * 小三元
 * 同时中奖⾹蕉、星星、苹果
 */
function minTernary() {
    let result = [];

    result.push(...oddsSubSet.apple, ...oddsSubSet.star, ...oddsSubSet.banana);

    return result;
}

/**
 * 开火车
 * 任意中 2 - 5 个图标 不包含bonus
 */
function  train() {
    const len = getRandomNumber(2, 5);
    const result: Set<number> = new Set();

    while(result.size < len) {
        const sub = roulette[getRandomNumber(0, roulette.length - 1)];

        if (!kindSubSet.redBonus.includes(sub) && !kindSubSet.blueBonus.includes(sub)) {
            result.add(sub);
        }
    }

    return [...result];
}

/**
 * 大四喜
 * 中四个西瓜
 */
function fourHappy() {
    return [...kindSubSet.watermelon];
}


/**
 * 获取一个结果集
 * @return {Object} userWin 给客户端使用 玩家的赢收情况
 *         {Object} winBigOdds 押注玩家赢的最大区域 自用
 *         {String} bigWinUid 赢得最多玩家的uid
 * */
export const settlement = (betSituation, winArea, data) => {
    const userWin = {},
        winKeys = Object.keys(winArea),
        winBigOdds = {};
    let maxWinCount = 0,
        bigWinUid = null,
        allWin = 0,
        playersWin = {};

    for (let uid in Object.getOwnPropertyDescriptors(betSituation)) {
        const userBet = betSituation[uid];
        userWin[uid] = 0;
        winBigOdds[uid] = 0;
        playersWin[uid] = {};

        for (let area in Object.getOwnPropertyDescriptors(userBet)) {
            if (winKeys.includes(area)) {
                // 只记纯利润
                const win = winArea[area] * userBet[area];
                playersWin[uid][area] = win;
                userWin[uid] += win;
                allWin += win;
                if (winBigOdds[uid] < winArea[area]) winBigOdds[uid] = winArea[area];
            }
        }

        if (maxWinCount < userWin[uid]) {
            maxWinCount = userWin[uid];
            bigWinUid = uid;
        }
    }

    return { userWin, winBigOdds, bigWinUid, allWin, winArea, data, playersWin };
};

/**
 * 过滤开奖结果
 * @param result
 * @param players
 * @param filterType
 */
export const filterLotteryResult = (result, players, filterType: number) => {
    result.allWin = 0;
    for (let uid in Object.getOwnPropertyDescriptors(result.userWin)) {
        const curPlayer = players.find(player => player.uid === uid);

        if (curPlayer.isRobot === filterType) {
            result.allWin += result.userWin[uid];
        }
    }
};

/**
 * 获取一个随机结果的
 */
export const getRandomLotteryResult = (userBets) => {
    // return () => {
    const lotteryResult = getLotteryResult();
    return settlement(userBets, lotteryResult.winArea, lotteryResult.data);
    // };
};


/**
 * 获取一个系统必赢或者一个必输的结果
 * @param players 玩家列表
 * @param userBet 玩家下注详情
 * @param filterType 过滤的类型
 * @param bet 如果过滤的类型是机器人或者系统 则bet统计的真实玩家的结果 如果庄家是真实玩家统计的则是机器人的押注结果
 * @param isSystemWin
 */
export const getWinORLossResult = (players, userBet, filterType: number, bet, isSystemWin) => {
    let result;
    for (let i = 0; i < 100; i++) {
        result = getRandomLotteryResult(userBet);

        if (filterType === 2) {
            if (isSystemWin && result.allWin > bet) {
                break;
            }

            if (!isSystemWin && result.allWin <= bet) {
                break;
            }
        } else {
            if (isSystemWin && result.allWin <= bet) {
                break;
            }

            if (!isSystemWin && result.allWin > bet) {
                break;
            }
        }
    }
    return result;
};


/**
 * 开奖结算 单机版
 * @param userBetAreas   玩家押注区域
 * @param lotteryResult  开奖结算区域
 */
export function settlementStandAlone(userBetAreas: { [key: string]: number }, lotteryResult: { [key: string]: number }) {
    // 玩家赢钱区域些
    let playerWinAreas: { [key: string]: number } = {},
        // 玩家总收益
        totalProfit: number = 0,
        // 最大倍率
        bigOdds = 0,
        records: {[key: string]: {bet: number, profit: number}} = {};

    // 赢的区域
    const winKeys = Object.keys(lotteryResult);

    for (let area in userBetAreas) {
        records[area] = {bet: 0, profit: 0};
        records[area].bet = userBetAreas[area];
        if (winKeys.includes(area)) {
            // 只记纯利润
            playerWinAreas[area] = userBetAreas[area] * lotteryResult[area];
            totalProfit += playerWinAreas[area];

            records[area].profit = playerWinAreas[area];

            if (lotteryResult[area] > bigOdds) bigOdds = lotteryResult[area];
        } else {
            records[area].profit = -userBetAreas[area];
        }
    }

    return { totalProfit, playerWinAreas, bigOdds, records };
}

/**
 * 获取一个随机开奖结果 单机版
 * @param userBetAreas
 */
export function getRandomLotteryResultStandAlone(userBetAreas: any) {
    const lotteryResult = getLotteryResult();
    const { totalProfit, playerWinAreas, bigOdds, records } = settlementStandAlone(userBetAreas, lotteryResult.winArea);

    return { totalProfit, playerWinAreas, lotteryResult, bigOdds, records };
}

/**
 * 获取一个系统赢或者系统输的开奖结果
 * @param userBetAreas  玩家押注区域详情
 * @param totalBet      玩家总押注
 * @param isSystemWin   是否是系统赢
 */
export function getWinORLossResultStandAlone(userBetAreas: { [key: string]: number }, totalBet: number, isSystemWin: boolean) {
    let result: {
        totalProfit: number,
        playerWinAreas: { [key: string]: number },
        lotteryResult: any,
        bigOdds: number
    };

    for (let i = 0; i < 100; i++) {
        result = getRandomLotteryResultStandAlone(userBetAreas);

        // console.log('33333333', result);

        // 如果系统赢
        if ((isSystemWin && result.totalProfit < totalBet) || (!isSystemWin && result.totalProfit > totalBet)) {
            break;
        }
    }
    return result;
}


// 测试代码
const bets = {
    banana: 10,
    apple: 10,
    durian: 10,
    snakeFruit: 10,
    redBonus: 10,
    blueBonus: 10,
    orange: 10,
    pear: 10,
    star: 10,
    watermelon: 10
};


// for (let i = 0; i < 10; i++) {
//     // const cc = getLotteryResult();
//     // console.log(cc);
//     // console.log(settlementStandAlone({star: 1000}, cc.winArea));
//
//
//     console.log(getWinORLossResultStandAlone(bets, 100, true).lotteryResult.winArea);
//
// }




