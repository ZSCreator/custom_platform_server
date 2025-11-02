import { betArea, pair, otherPair, odds2 } from '../RedBlackConst';
import { conversionCards } from "../../../../utils/GameUtil";
import { CommonControlState } from "../../../../domain/CommonControl/config/commonConst";
import RedBlackPlayerImpl from '../RedBlackPlayerImpl';
import { RoleEnum } from "../../../../common/constant/player/RoleEnum";

// 牌型
// 1 单牌
// 2 3 4 5 6 7 8 9 10 11 12 13 14 对子
// 15 顺子
// 16 同花
// 17 同花顺
// 18 豹子
// 0 1 2 3 4 5 6 7 8 9 10 11 12 黑
// A 2 3 4 5 6 7 8 9 10 J Q  K
// 13 14 15 16 17 18 19 20 21 22 23 24 25 红桃
// A  2  3  4  5  6  7  8  9  10  J Q  K
// 26 27 28 29 30 31 32 33 34 35 36 37 38 梅花
// A  2  3  4  5  6  7  8  9  10 J  Q  K
// 39 40 41 42 43 44 45 46 47 48 49 50 51 方块
// A  2  3  4  5  6  7  8  9  10 J  Q  K

/**生成 52张牌 */
function generatePuker() {
    const arr: number[] = [];

    for (let i = 1; i < 52; i += 1) {
        arr.push(i);
    }

    arr.sort((a, b) => Math.random() > 0.5 ? -1 : 1);
    return arr;
}

/**判断是否为同花 */
function judgeColor(cards) {
    cards.sort((x, y) => x - y);
    if (cards[2] >= 0 && cards[2] < 13) {
        return true;
    } else if (cards[2] > 12 && cards[2] < 26) {
        if (cards[0] > 12) return true;
    } else if (cards[2] > 25 && cards[2] < 39) {
        if (cards[0] > 25) return true;
    } else {
        if (cards[0] > 38) return true;
    }
    return false;
}

// 是否为顺子
function judgeShunza(cards: number[]) {
    const ShunzaCards = cards.map(card => card % 13).sort((card1, card2) => {
        return card1 - card2;
    });
    if (ShunzaCards[0] === 0 && ShunzaCards[1] === 11 && ShunzaCards[2] === 12) {
        return true;
    }

    for (let i = 0, len = ShunzaCards.length - 1; i < len; i++) {
        if (ShunzaCards[i] + 1 !== ShunzaCards[i + 1]) return false;
    }
    return true;
}

// 判断是否为豹子
function judgeBao(cards) {
    return cards.map(card => card % 13).every((card, index, arr) => {
        return arr[0] === card;
    });
}

/**判断是否为对子 */
function judgePair(cards: number[], reuse = false) {
    const reCards = cards.map(card => card % 13);

    for (let i = 0, len = reCards.length - 1; i < len; i++) {
        for (let j = i + 1, len1 = reCards.length; j < len1; j++) {
            if (reCards[i] === reCards[j]) {
                if (reuse) return reCards.filter(card => card !== reCards[i])[0];
                return pair[reCards[i]];
            }
        }
    }
    return false;
}
/**
 * 返回牌面值
 * 
 * @param card 0-53
 */
 export function getCardValue(card: number) {
    let CardValue = card % 13 == 0 ? 14 : card % 13;
    return CardValue;
    // return (CardValue <= 2) ? (CardValue + 13) : CardValue;
};


/**获取颜色 */
export function GetColour(card: number) {
    if (card < 13) {
        return 4;
    } else if (card < 26) {
        return 3;
    } else if (card < 39) {
        return 2;
    } else {
        return 1;
    }
}
/**判断牌型 */
function judgecardType(cards: number[]) {
    // 是否为豹子
    const Bao = judgeBao(cards);
    if (Bao) return otherPair.leopard;

    // 是否为对子
    const pair = judgePair(cards);
    if (pair) return pair;

    const color = judgeColor(cards);
    const shunza = judgeShunza(cards);
    if (color && shunza) return otherPair.flush;
    if (shunza) return otherPair.shunza;
    if (color) return otherPair.flower;
    return otherPair.singular;
}

/**开奖结果 */
export function lottery() {
    const puke = generatePuker();
    let result: { red?: { cards?: number[], count?: number }, black?: { cards?: number[], count?: number } } = {};

    result.red = {};
    result.black = {};
    result.red.cards = puke.splice(0, 3);
    result.black.cards = puke.splice(0, 3);
    result.red.count = judgecardType(result.red.cards);
    result.black.count = judgecardType(result.black.cards);

    return result;
}

/**比牌 */
export function compare(reds: { cards?: number[]; count?: number }, blacks: { cards?: number[]; count?: number }) {
    const red = Object.assign({}, reds), black = Object.assign({}, blacks);
    if (red.count > black.count) {
        return { win: betArea.red, luck: red.count };
    }
    if (red.count < black.count) {
        return { win: betArea.black, luck: black.count };
    }

    // 牌先比点数后比花色
    let [...redCards] = reds.cards;
    let [...blackCards] = blacks.cards;

    redCards.sort((a, b) => getCardValue(b) - getCardValue(a));
    blackCards.sort((a, b) => getCardValue(b) - getCardValue(a));

    // 先判断是否第一个是A
    // if (redCards[2] % 13 === 0 && blackCards[2] % 13 !== 0) {
    //     return { win: betArea.red, luck: red.count };
    // } else if (redCards[2] % 13 !== 0 && blackCards[2] % 13 === 0) {
    //     return { win: betArea.black, luck: black.count };
    // } else if (redCards[2] % 13 === 0 && blackCards[2] % 13 === 0) {
    //     return redCards[2] < blackCards[2] ? { win: betArea.red, luck: red.count } :
    //         { win: betArea.black, luck: black.count };
    // }
    for (let idx = 0; idx < redCards.length; idx++) {
        const Rcard = redCards[idx];
        const Bcard = blackCards[idx];
        if (getCardValue(Rcard) > getCardValue(Bcard)) {
            return { win: betArea.red, luck: red.count };
        }
        if (getCardValue(Rcard ) < getCardValue(Bcard )) {
            return { win: betArea.black, luck: black.count };
        }
    }
    for (let idx = 0; idx < redCards.length; idx++) {
        const Rcard = redCards[idx];
        const Bcard = blackCards[idx];
        if (GetColour(Rcard) > GetColour(Bcard)) {
            return { win: betArea.red, luck: red.count };
        }
        if (GetColour(Rcard) < GetColour(Bcard)) {
            return { win: betArea.black, luck: black.count };
        }
    }
};

// 结算
export function settle(players: RedBlackPlayerImpl[], killAreas: Set<string>) {
    const lotteryResult = lottery();
    const winArea = compare(lotteryResult.red, lotteryResult.black)


    let allBetNum = 0                  // 回合总下注
    let totalRebate = 0;                    // 回合总返利

    for (const pl of players) {
        pl.profit = 0;
        for (const area in pl.bets) {
            pl.bets[area].profit = 0;
            let bet = pl.bets[area].bet;
            allBetNum += bet;
            if (area === betArea.luck) {
                if (!!winArea.luck && winArea.luck >= pair[7]) {
                    let gold = pl.bets[area].bet * odds2[winArea.luck];     //净收益
                    pl.bets[area].profit = gold

                    if (!killAreas.has(area)) {
                        totalRebate += gold;
                    }
                    pl.profit += gold;
                    continue;
                }
            }

            if (area === winArea.win) {
                let gold = pl.bets[area].bet * odds2[winArea.win];     //净收益
                pl.bets[area].profit = gold;
                if (!killAreas.has(area)) {
                    totalRebate += gold;
                }
                pl.profit += gold;
            }
        }
    }
    return { totalRebate, allBetNum, winArea, results: lotteryResult };
}

/**
 * 获取一个随机结果的
 */
export function getRandomLotteryResult(players: RedBlackPlayerImpl[], killAreas: Set<string>) {


    return settle(players, killAreas);

}

/**
 * 随机开奖
 */
export function randomLottery(players: RedBlackPlayerImpl[], killAreas: Set<string>) {
    let result = getRandomLotteryResult(players, killAreas);
    for (let i = 0; i < 200; i++) {
        if (!containKillAreas({ killAreas, winAreas: result.winArea })) {
            break;
        }
        result = getRandomLotteryResult(players, killAreas);
    }
    return result;
}

/**
 * 获取一个系统必赢或者一个必输的结果
 * @param players 玩家列表
 * @param userBet 玩家下注详情
 * @param filterType 过滤的类型
 * @param bet 如果过滤的类型是机器人或者系统 则bet统计的真实玩家的结果 如果庄家是真实玩家统计的则是机器人的押注结果
 * @param killAreas 必杀区域
 * @param isSystemWin
 */
export function getWinORLossResult(players: RedBlackPlayerImpl[], filterType: number, bet, killAreas: Set<string>, isSystemWin: boolean) {
    let result = getRandomLotteryResult(players, killAreas);
    for (let i = 0; i < 100; i++) {
        // result = getRandomLotteryResult(players, killAreas);
        filterLotteryResult(result, players, filterType);


        // 如果有必杀 则只要不包含必杀区域 则不调控 因为必杀包含了幸运一击
        if (killAreas.size > 0) {
            // 包含必杀区域作废
            if (containKillAreas({ killAreas, winAreas: result.winArea })) {
                result = getRandomLotteryResult(players, killAreas);
                continue;
            } else {
                break;
            }
        }

        if (result.totalRebate === 0 && bet === 0) {
            break;
        }

        if (filterType === 2) {
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

            if (!isSystemWin && result.totalRebate > bet) {
                break;
            }
        }

        result = getRandomLotteryResult(players, killAreas);
    }
    return result;
}

/**
 * 获取个控调控结果
 */
export function getPersonalControlResult(players: RedBlackPlayerImpl[],
    bet: number,
    state: CommonControlState,
    killAreas: Set<string>,
    statisticType: RoleEnum | 4) {
    let result;
    for (let i = 0; i < 100; i++) {
        result = getRandomLotteryResult(players, killAreas);

        // 统计玩家收益
        // filterLotteryResult(result, players, statisticType);
        const totalRebate = filterControlPlayersTotalRebate(players, state);

        if (state === CommonControlState.WIN && totalRebate > bet ||
            state === CommonControlState.LOSS && totalRebate <= bet) {
            break;
        }
    }
    return result;
}

//while(true) {
//     const lottery = RedBlackService.lottery();
//     const redCard = test(lottery.red.cards);
//     const blackCard = test(lottery.black.cards);
//
//     const result = RedBlackService.settle(lottery, {12332: {luck: 100, red: 100}});
//     console.log("xxxxxxxxxxxx", lottery, redCard, blackCard, result);
//if (result.winArea.count === 14) break;
//}

// 测试代码
function test(cards) {
    const arr = [];
    const cardCount = { 0: "A", 1: "2", 2: "3", 3: "4", 4: "5", 5: "6", 6: "7", 7: "8", 8: "9", 9: "10", 10: "J", 11: "Q", 12: "K" };
    cards.forEach(card => {
        if (card < 13) {
            arr.push(`黑桃${cardCount[card % 13]}`);
        } else if (card < 26) {
            arr.push(`红桃${cardCount[card % 13]}`);
        } else if (card < 39) {
            arr.push(`梅花${cardCount[card % 13]}`);
        } else {
            arr.push(`方块${cardCount[card % 13]}`);
        }
    });
    return arr;
}

/**
 * 检查结果时否包喊
 * @param params
 */
function containKillAreas(params: { killAreas: Set<string>, winAreas: { win: string, luck: number } }): boolean {
    if (params.killAreas.has(params.winAreas.win)) {
        return true;
    }

    return params.killAreas.has('luck') && params.winAreas.luck > 7;
}


/**
 * 开奖结果
 */
interface LotteryResult {
    red?: {
        cards?: number[];
        count?: number;
    };
    black?: {
        cards?: number[];
        count?: number;
    };
}

/**
 * 赢的区域映射
 */
const winAreaMapping = {
    red: '1',
    black: '2'
};

/**
 * 构建记录需要结果
 * @param lotteryResult
 * @param winAreas  谁赢
 */
export function buildRecordResult(lotteryResult: LotteryResult, winAreas: { win: betArea, luck: number }) {
    let redCount = lotteryResult.red.count.toString(),
        red = conversionCards(lotteryResult.red.cards),
        black = conversionCards(lotteryResult.black.cards),
        blackCount = lotteryResult.black.count.toString(),
        winCount = winAreas.luck.toString();

    if (redCount.length === 1) redCount = `0${redCount}`;
    if (blackCount.length === 1) blackCount = `0${blackCount}`;
    if (winCount.length === 1) winCount = `0${winCount}`;

    return `${red}${redCount}${black}${blackCount}${winAreaMapping[winAreas.win]}${winCount}`;
}

/**
 * 过滤特定调控的玩家
 * @param players 调控玩家
 * @param state 调控状态
 */
function filterControlPlayersTotalRebate(players: RedBlackPlayerImpl[], state: CommonControlState) {
    return players.reduce((num, player) => {
        if (player.controlState === state) {
            num += player.profit;
        }

        return num;
    }, 0)
}

/**
 * 过滤结果
 * @param result   结果集
 * @param players  玩家
 * @param convenienceProperty  便利属性
 * @param filterType  过滤玩家类型4 跳过 0 1 2 玩家 机器人
 */
export function filterLotteryResult(result, players: RedBlackPlayerImpl[], filterType: number) {
    // 如果结果为4则跳过
    if (filterType === 4) {
        return;
    }

    result.totalRebate = 0;
    for (const pl of players) {
        if (!!pl && pl.isRobot === filterType) {
            result.totalRebate += pl.profit;
        }
    }
    // for (let uid in Object.getOwnPropertyDescriptors(result[convenienceProperty])) {
    //     const curPlayer = players.find(player => player.uid === uid);

    //     if (!!curPlayer && curPlayer.isRobot === filterType) {
    //         const user = result[convenienceProperty][uid];
    //         result.totalRebate += user.allWin;
    //     }
    // }
};
// for (let i = 0; i < 10; i++) {
//     const result = lottery();
//     const winAreas = compare(result.red, result.black);
//
//     console.log(result);
//     console.log(buildRecordResult(result as any, winAreas as any))
// }
