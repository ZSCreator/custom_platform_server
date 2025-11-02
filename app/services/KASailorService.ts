'use strict'

import { filterLotteryResult } from "../utils/GameUtil";

const lotteryKASailor = { 1: "k1", 2: "k2", 3: "k3", 4: "k4", 5: "k5", 6: "k6" };


// 产生随机数
const random = function (min: number, max: number) {
    if (max % 1 !== 0 || min % 1 !== 0) {
        throw "min, max不能为非整数";
    }

    const MAX = Math.max(min, max);
    const MIN = Math.min(min, max);
    const MM = MAX - MIN + 1;

    return Math.floor(Math.random() * MM) + MIN;
};

// 开奖
export function lottery() {
    const result = [random(1, 6), random(1, 6), random(1, 6)];
    const arr = [];
    let i = 0;

    while (i < 3) {
        arr.push(lotteryKASailor[result[i]]);
        i += 1;
    }

    return arr;
};

// 结算
export function settle(lotteryResult, userBets) {
    const winArea = lotteryResult,
        userWin = {},
        winner = {},
        uidArr = Object.keys(userBets),
        userWinInfo = {};

    let allBetNum = 0,      // 这局总下注
        totalRebate = 0;    // 该局总返利

    for (let i = uidArr.length - 1; i >= 0; --i) {
        const uid = uidArr[i],
            userBet = userBets[uid],
            betArr = Object.keys(userBet);
        userWin[uid] = {};
        userWinInfo[uid] = {};
        userWinInfo[uid].maxOdds = 0;
        userWinInfo[uid].allWin = 0;

        for (let len = betArr.length - 1; len >= 0; --len) {
            const area = betArr[len];
            allBetNum += userBet[area];

            if (winArea.includes(area)) {
                const areaCount = winArea.filter(m => m === area).length;
                if (userWinInfo[uid].maxOdds < areaCount) {
                    userWinInfo[uid].maxOdds = areaCount;
                }

                userWin[uid][area] = {
                    win: userBet[area] * areaCount + userBet[area],
                    winArea: area,
                    profit: userBet[area] * areaCount
                };
                totalRebate += userWin[uid][area].win;
                userWinInfo[uid].allWin += userWin[uid][area].win;
                winner[area] = { win: userBet[area] };
            }
        }
    }

    return { userWin, totalRebate, allBetNum, lotteryResult, userWinInfo };
};


/**
 * 获取一个随机结果的
 */
export const getRandomLotteryResult = (userBets) => {
    // return () => {
    const lotteryResult = lottery();
    return settle(lotteryResult, userBets);
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
    // return () => {
    let result;
    // const randomFunc = getRandomLotteryResult(userBet);
    for (let i = 0; i < 100; i++) {
        result = getRandomLotteryResult(userBet);
        filterLotteryResult(result, players, 'userWinInfo', filterType);

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
    }

    return result;
    // }
};