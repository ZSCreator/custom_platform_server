"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWinORLossResultStandAlone = exports.getRandomLotteryResultStandAlone = exports.settlementStandAlone = exports.getWinORLossResult = exports.getRandomLotteryResult = exports.filterLotteryResult = exports.settlement = exports.getLotteryResult = void 0;
const FruitMachineConst_1 = require("../FruitMachineConst");
const utils_1 = require("../../../../utils");
function getRandomNumber(min, max) {
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
    const colResults = results.filter(result => !FruitMachineConst_1.kindSubSet.goodLuck.includes(result));
    for (let i = 0; i < colResults.length; i++) {
        let type, odds = 0;
        for (let name in FruitMachineConst_1.kindSubSet) {
            if (FruitMachineConst_1.kindSubSet[name].includes(colResults[i])) {
                type = name;
                break;
            }
        }
        for (let resOdds in FruitMachineConst_1.oddsSubSet) {
            if (FruitMachineConst_1.oddsSubSet[resOdds].includes(colResults[i])) {
                odds = FruitMachineConst_1.areaOdds[resOdds];
                break;
            }
        }
        if (!winArea[type]) {
            winArea[type] = odds;
        }
        else {
            winArea[type] += odds;
        }
    }
    return winArea;
}
function getLotteryResult() {
    const data = { goodLuck: FruitMachineConst_1.GoodLuckType.NONE, results: [] };
    let num = 0;
    const count = getRandomNumber(1, (0, utils_1.sum)(FruitMachineConst_1.odds));
    for (let oddsType in FruitMachineConst_1.odds) {
        num += FruitMachineConst_1.odds[oddsType];
        if (count <= num) {
            if (oddsType === "goodLuck") {
                data.goodLuck = randomType();
                data.results.push(...goodLuckLottery(data.goodLuck));
            }
            else {
                data.results.push(FruitMachineConst_1.oddsSubSet[oddsType][getRandomNumber(0, FruitMachineConst_1.oddsSubSet[oddsType].length - 1)]);
            }
            const winArea = judgeWinArea(data.results);
            return { data, winArea };
        }
    }
}
exports.getLotteryResult = getLotteryResult;
function randomType() {
    const types = [FruitMachineConst_1.GoodLuckType.BIG_TERNARY, FruitMachineConst_1.GoodLuckType.FOUR_HAPPY,
        FruitMachineConst_1.GoodLuckType.MIN_TERNARY, FruitMachineConst_1.GoodLuckType.TRAIN];
    return types[getRandomNumber(0, types.length - 1)];
}
function goodLuckLottery(type) {
    switch (type) {
        case FruitMachineConst_1.GoodLuckType.BIG_TERNARY:
            return bigTernary();
        case FruitMachineConst_1.GoodLuckType.MIN_TERNARY:
            return minTernary();
        case FruitMachineConst_1.GoodLuckType.TRAIN:
            return train();
        case FruitMachineConst_1.GoodLuckType.FOUR_HAPPY:
            return fourHappy();
        default:
            throw new Error(`错误类型开奖: ${type}`);
    }
}
function bigTernary() {
    let result = [];
    result.push(...FruitMachineConst_1.oddsSubSet.snakeFruit, ...FruitMachineConst_1.oddsSubSet.orange, ...FruitMachineConst_1.oddsSubSet.durian);
    return result;
}
function minTernary() {
    let result = [];
    result.push(...FruitMachineConst_1.oddsSubSet.apple, ...FruitMachineConst_1.oddsSubSet.star, ...FruitMachineConst_1.oddsSubSet.banana);
    return result;
}
function train() {
    const len = getRandomNumber(2, 5);
    const result = new Set();
    while (result.size < len) {
        const sub = FruitMachineConst_1.roulette[getRandomNumber(0, FruitMachineConst_1.roulette.length - 1)];
        if (!FruitMachineConst_1.kindSubSet.redBonus.includes(sub) && !FruitMachineConst_1.kindSubSet.blueBonus.includes(sub)) {
            result.add(sub);
        }
    }
    return [...result];
}
function fourHappy() {
    return [...FruitMachineConst_1.kindSubSet.watermelon];
}
const settlement = (betSituation, winArea, data) => {
    const userWin = {}, winKeys = Object.keys(winArea), winBigOdds = {};
    let maxWinCount = 0, bigWinUid = null, allWin = 0, playersWin = {};
    for (let uid in Object.getOwnPropertyDescriptors(betSituation)) {
        const userBet = betSituation[uid];
        userWin[uid] = 0;
        winBigOdds[uid] = 0;
        playersWin[uid] = {};
        for (let area in Object.getOwnPropertyDescriptors(userBet)) {
            if (winKeys.includes(area)) {
                const win = winArea[area] * userBet[area];
                playersWin[uid][area] = win;
                userWin[uid] += win;
                allWin += win;
                if (winBigOdds[uid] < winArea[area])
                    winBigOdds[uid] = winArea[area];
            }
        }
        if (maxWinCount < userWin[uid]) {
            maxWinCount = userWin[uid];
            bigWinUid = uid;
        }
    }
    return { userWin, winBigOdds, bigWinUid, allWin, winArea, data, playersWin };
};
exports.settlement = settlement;
const filterLotteryResult = (result, players, filterType) => {
    result.allWin = 0;
    for (let uid in Object.getOwnPropertyDescriptors(result.userWin)) {
        const curPlayer = players.find(player => player.uid === uid);
        if (curPlayer.isRobot === filterType) {
            result.allWin += result.userWin[uid];
        }
    }
};
exports.filterLotteryResult = filterLotteryResult;
const getRandomLotteryResult = (userBets) => {
    const lotteryResult = getLotteryResult();
    return (0, exports.settlement)(userBets, lotteryResult.winArea, lotteryResult.data);
};
exports.getRandomLotteryResult = getRandomLotteryResult;
const getWinORLossResult = (players, userBet, filterType, bet, isSystemWin) => {
    let result;
    for (let i = 0; i < 100; i++) {
        result = (0, exports.getRandomLotteryResult)(userBet);
        if (filterType === 2) {
            if (isSystemWin && result.allWin > bet) {
                break;
            }
            if (!isSystemWin && result.allWin <= bet) {
                break;
            }
        }
        else {
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
exports.getWinORLossResult = getWinORLossResult;
function settlementStandAlone(userBetAreas, lotteryResult) {
    let playerWinAreas = {}, totalProfit = 0, bigOdds = 0, records = {};
    const winKeys = Object.keys(lotteryResult);
    for (let area in userBetAreas) {
        records[area] = { bet: 0, profit: 0 };
        records[area].bet = userBetAreas[area];
        if (winKeys.includes(area)) {
            playerWinAreas[area] = userBetAreas[area] * lotteryResult[area];
            totalProfit += playerWinAreas[area];
            records[area].profit = playerWinAreas[area];
            if (lotteryResult[area] > bigOdds)
                bigOdds = lotteryResult[area];
        }
        else {
            records[area].profit = -userBetAreas[area];
        }
    }
    return { totalProfit, playerWinAreas, bigOdds, records };
}
exports.settlementStandAlone = settlementStandAlone;
function getRandomLotteryResultStandAlone(userBetAreas) {
    const lotteryResult = getLotteryResult();
    const { totalProfit, playerWinAreas, bigOdds, records } = settlementStandAlone(userBetAreas, lotteryResult.winArea);
    return { totalProfit, playerWinAreas, lotteryResult, bigOdds, records };
}
exports.getRandomLotteryResultStandAlone = getRandomLotteryResultStandAlone;
function getWinORLossResultStandAlone(userBetAreas, totalBet, isSystemWin) {
    let result;
    for (let i = 0; i < 100; i++) {
        result = getRandomLotteryResultStandAlone(userBetAreas);
        if ((isSystemWin && result.totalProfit < totalBet) || (!isSystemWin && result.totalProfit > totalBet)) {
            break;
        }
    }
    return result;
}
exports.getWinORLossResultStandAlone = getWinORLossResultStandAlone;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9GcnVpdE1hY2hpbmUvbGliL3V0aWwvbG90dGVyeVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNERBQW9HO0FBQ3BHLDZDQUFzQztBQUl0QyxTQUFTLGVBQWUsQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUM3QyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2hDLE1BQU0sZ0JBQWdCLENBQUM7S0FDMUI7SUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQixNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUV6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNoRCxDQUFDO0FBR0QsU0FBUyxZQUFZLENBQUMsT0FBTztJQUN6QixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFHbkIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsOEJBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFHbkYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsSUFBSSxJQUFJLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUduQixLQUFL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