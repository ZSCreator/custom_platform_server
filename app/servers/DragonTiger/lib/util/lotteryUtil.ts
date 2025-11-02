import DragonTigerConst = require('../DragonTigerConst');
import { CommonControlState } from "../../../../domain/CommonControl/config/commonConst";
// import { filterLotteryResult } from "../../../../utils/GameUtil";
import dtPlayer from '../dtPlayer';
import dtplayer from '../dtPlayer';
import { RoleEnum } from "../../../../common/constant/player/RoleEnum";

export const pukes = [
    '', '黑桃A', '黑桃2', '黑桃3', '黑桃4', '黑桃5', '黑桃6', '黑桃7', '黑桃8', '黑桃9', '黑桃10', '黑桃J', '黑桃Q', '黑桃K',
    '红桃A', '红桃2', '红桃3', '红桃4', '红桃5', '红桃6', '红桃7', '红桃8', '红桃9', '红桃10', '红桃J', '红桃Q', '红桃K',
    '梅花A', '梅花2', '梅花3', '梅花4', '梅花5', '梅花6', '梅花7', '梅花8', '梅花9', '梅花10', '梅花J', '梅花Q', '梅花K',
    '方块A', '方块2', '方块3', '方块4', '方块5', '方块6', '方块7', '方块8', '方块9', '方块10', '方块J', '方块Q', '方块K',
];

/**生成52张扑克牌 */
function puke() {
    let arr: number[] = [];
    for (let index = 1; index < 52; index++) {
        arr.push(index);
    }
    // 打乱数组
    arr.sort((a, b) => Math.random() > 0.5 ? -1 : 1);
    return arr;
};

export function getCardValue(card: number) {
    let CardValue = card % 13 == 0 ? 13 : card % 13;
    // let CardValue = card % 13;
    return CardValue;
};

/**获取牌的花色 */
export function getPokerFlowerColor(poker: number) {
    if (poker >= 39 && poker <= 51) {//方块
        return 0;
    } else if (poker >= 26 && poker <= 38) {//梅花
        return 1;
    } else if (poker >= 13 && poker <= 25) {//红桃
        return 2;
    } else {//黑桃
        return 3;
    }
}

/**判断花色 */
function judge(card: number) {
    let ass = [];

    if (getPokerFlowerColor(card) == 0 || getPokerFlowerColor(card) == 2) {
        ass.push('r');
    } else {
        ass.push('b');
    }

    if (getCardValue(card) % 2 === 0) {
        ass.push('d');
    } else if (getCardValue(card) % 2 !== 0) {
        ass.push('s');
    }
    return ass;
}


/**判断赢的区域 */
function winAreas(results: { d: number, t: number }) {
    let winArea: string[] = [];

    if (getCardValue(results.d) == getCardValue(results.t)) {
        winArea.push('f');
    } else if (getCardValue(results.d) > getCardValue(results.t)) {
        winArea.push('d');
    } else {
        winArea.push('t');
    }
    {
        const arr = judge(results.d);
        winArea.push(`d${arr[0]}`, `d${arr[1]}`);
    }
    {
        const arr = judge(results.t);
        winArea.push(`t${arr[0]}`, `t${arr[1]}`);
    }
    return winArea;
}


export function lottery() {
    const cards = puke();
    const result = cards.slice(0, 2);
    const Results = { d: result[0], t: result[1] };
    // const Results = { d: 9, t: 9 + 13 };
    return Results;
};

/**
 * 龙虎斗开奖结算
 * @param dtPlayer 龙虎斗玩家
 * @param killAreas 必杀区域
 * @param statisticType 统计类型返奖 4 为统计所有 其他为统计该类型的总返奖
 */
export function settle(dtPlayer: dtPlayer[], killAreas: Set<string>, statisticType: RoleEnum | 4) {
    const lotteryResults = lottery();
    const winArea = winAreas(lotteryResults); // 判断赢的区域
    let odds = DragonTigerConst.odds;      // 获取赔率


    let allBet = 0         // 这局总下注
    let totalRebate = 0;    // 这局总返利  用于剔除机器人押注结果
    let totalProfit = 0;
    let BankSettleDetails: { [area: string]: { bet: number, win: number } } = {};//庄家详情 用
    for (const pl of dtPlayer) {
        pl.profit = 0;
        for (const area in pl.bets) {
            if (!BankSettleDetails[area]) BankSettleDetails[area] = { bet: 0, win: 0 };
            pl.bets[area].profit = 0;
            allBet += pl.bets[area].bet;
            BankSettleDetails[area].bet += pl.bets[area].bet;
            if (winArea.includes(area)) {
                pl.bets[area].profit = pl.bets[area].bet * odds[area];
                pl.profit += pl.bets[area].profit;

                totalProfit += pl.bets[area].profit + pl.bets[area].bet;
                if (!killAreas.has(area)) {
                    if (statisticType === 4 || statisticType === pl.isRobot) {
                        totalRebate += pl.bets[area].profit + pl.bets[area].bet;
                    }
                }
            } else {
                /**开合的情况 龙 虎的 钱 要退回给 玩家 */
                if (winArea.includes(`f`) && (area == `d` || area == `t`)) {
                    pl.bets[area].profit -= pl.bets[area].bet / 2;
                    pl.profit -= pl.bets[area].bet / 2;
                } else {
                    pl.bets[area].profit -= pl.bets[area].bet;
                    pl.profit -= pl.bets[area].bet;
                }
            }
            BankSettleDetails[area].win -= pl.bets[area].profit;
        }
    }
    return { lotteryResults, allBet, winArea, totalRebate, totalProfit, BankSettleDetails };
}


/**获取一个随机结果的 */
export function getRandomLotteryResult(dtPlayer: dtPlayer[], killAreas: Set<string>, statisticType: RoleEnum | 4 = 4) {
    return settle(dtPlayer, killAreas, statisticType);
}

/**
 * 随机开奖
 */
export function randomLottery(dtPlayer: dtPlayer[], killAreas: Set<string>) {
    let result = getRandomLotteryResult(dtPlayer, killAreas);
    for (let i = 0; i < 200; i++) {
        result = getRandomLotteryResult(dtPlayer, killAreas);
        if (!containKillAreas({ killAreas, winAreas: result.winArea })) {
            break;
        }
    }
    return result;
}


/**
 * 获取一个系统必赢或者一个必输的结果
 * @param players 玩家列表
 * @param userBet 玩家下注详情
 * @param statisticType 过滤的类型
 * @param bet 如果过滤的类型是机器人或者系统 则bet统计的真实玩家的结果 如果庄家是真实玩家统计的则是机器人的押注结果
 * @param killAreas 必杀区域
 * @param isSystemWin
 */
export function getWinORLossResult(players: dtPlayer[], statisticType: RoleEnum | 4, bet: number, killAreas: Set<string>, isSystemWin: boolean) {
    let result = getRandomLotteryResult(players, killAreas, statisticType);
    for (let i = 0; i < 200; i++) {
        // result = getRandomLotteryResult(players, killAreas, statisticType);

        // 检查是否开出了必杀区域 开出则作废
        if (containKillAreas({ killAreas, winAreas: result.winArea })) {
            result = getRandomLotteryResult(players, killAreas, statisticType);
            continue;
        }

        // 如果统计类型是机器人 或者 全统计
        if (statisticType === RoleEnum.ROBOT || statisticType === 4) {
            if (isSystemWin && result.totalRebate > bet) {
                break;
            }

            if (!isSystemWin && result.totalRebate <= bet) {
                break;
            }
        } else {
            if (isSystemWin && result.totalRebate <= bet) {
                break;
            }

            if (!isSystemWin && result.totalRebate >= bet) {
                break;
            }
        }
        result = getRandomLotteryResult(players, killAreas, statisticType);
    }

    return result;
};

/**
 * 获取个控调控结果
 */
export function getPersonalControlResult(
    players: dtplayer[],
    bet: number,
    state: CommonControlState,
    killAreas: Set<string>,
    statisticType: RoleEnum | 4) {
    let result = getRandomLotteryResult(players, killAreas, statisticType);

    for (let i = 0; i < 100; i++) {
        // result = getRandomLotteryResult(players, killAreas, statisticType);

        // 过滤对应调控玩家的收益
        const totalRebate = filterControlPlayersTotalRebate(players, state);


        // 获取对应的调控玩家收益
        if (state === CommonControlState.WIN && totalRebate > 0 ||
            state === CommonControlState.LOSS && totalRebate <= 0) {
            break;
        }
        result = getRandomLotteryResult(players, killAreas, statisticType);
    }

    return result;
}

/**
 * 过滤特定调控的玩家
 * @param players 调控玩家
 * @param state 调控状态
 */
function filterControlPlayersTotalRebate(players: dtPlayer[], state: CommonControlState) {
    return players.reduce((num, player) => {
        if (player.controlState === state) {
            num += player.profit;
        }

        return num;
    }, 0)
}


function calculateControlPlayerProfit(result, players, convenienceProperty, state: CommonControlState) {
    result.totalRebate = 0;
    for (let uid in Object.getOwnPropertyDescriptors(result[convenienceProperty])) {
        const curPlayer = players.find(player => player.uid === uid);

        if (curPlayer.controlState === state) {
            const user = result[convenienceProperty][uid];
            result.totalRebate += user.allWin;
        }
    }
}

/**
 * 检查结果时否包喊
 * @param params
 */
function containKillAreas(params: { killAreas: Set<string>, winAreas: string[] }): boolean {
    for (let area of params.winAreas) {
        if (params.killAreas.has(area)) {
            return true;
        }
    }

    return false;
}


// interface lotteryResult {
//     d: ['b' | 'r' | 'm' | 'f', number]
//     t: ['b' | 'r' | 'm' | 'f', number]
// }

/**
 * 花色映射关系
 */
// const colorMapping = {
//     b: '3',
//     r: '2',
//     m: '1',
//     f: '0'
// };

/**
 * 输赢映射关系
 */
const winnerMapping = {
    'f': '03',
    't': '02',
    'd': '01'
};


/**
 * 构建记录需要结果
 * @param lotteryResult
 * @param winAreas  赢的区域 d 代表龙赢 t 代表虎赢 f代表和
 */
export function buildRecordResult(lotteryResult: { d?: number, t?: number }, winAreas: string[]) {
    let result = '';

    result += getPokerFlowerColor(lotteryResult.d).toString() + (lotteryResult.d % 13).toString(16);
    result += getPokerFlowerColor(lotteryResult.t).toString() + (lotteryResult.t % 13).toString(16);
    result += `00${winnerMapping[winAreas[0]]}`;

    return result;
}

// const players: any = [{
//     profit: 0,
//     bets: {'d': {bet: 10, profit: 0}},
//     isRobot: 0,
//     controlState: CommonControlState.WIN,
// },{
//     profit: 0,
//     bets: {'d': {bet: 10, profit: 0}},
//     isRobot: 0,
//     controlState: CommonControlState.RANDOM,
// }];
//
// for (let i = 0; i < 100; i++) {
//     getPersonalControlResult(players, 10,  CommonControlState.WIN, new Set(), 0);
// }

// getWinORLossResult(players, 0, 10, new Set(), false);



// for (let i = 0; i < 10; i++) {
//     const r = lottery();
//     const w = winAreas(r);
//
//     console.log(pukes[r.d], pukes[r.t])
//     console.log(r, w, buildRecordResult((r as any), (w as any)));
// }