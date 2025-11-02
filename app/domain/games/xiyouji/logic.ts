'use strict';

const config = require('./config');
const util = require('../../../utils');
import { slotsAwardRateLimit } from '../../../consts/allSlotsGameConst';

/**
 * 判断选线是否合理
 */
export const isHaveLine = (lineNum) => config.linesNum.includes(lineNum);

/**
 *  图标的生成概率
 */
export function scatterProbility(record, countQ: number) {
    if (countQ == 25)
        return 0.0027;
    if (countQ == 15)
        return 0.0035;
    if (countQ == 9)
        return 0.0025;
    if (countQ < 5) {
        return 0.007;
    }
    const helpfulRecord = record.slice(0, 20);
    const [x, y] = helpfulRecord.reduce((sum, hrecord) => {
        sum[0] += hrecord.win;
        sum[1] += hrecord.bet;
        return sum;
    }, [0, 0]);
    const Q = y == 0 ? 0 : x / y;
    return Q < 0.25 ? (0.25 - Q) / 85 : 0.004;
};

export function sortResult(ans: any[]) {
    ans.sort((a, b) => {
        return a.finalResult_1.allTotalWin - b.finalResult_1.allTotalWin;
    });
};



/**
 * 判断一个指定长度的数组(中奖线) 中奖情况 (0: 二连. 1:三连，2:四连. 3:五连)
 */
function winningJudgment(idArray: any[], item) {
    // 取出数组的第一个元素 
    const first = idArray[0];
    const initArray = util.init(idArray);  //前四个元素
    const doubleInitArray = util.init(initArray);  // 前三个元素
    // let result = { luckyFiveLines: false, fiveLines: false };
    if (util.all((item) => item == first)(idArray)) {  // 单元素5连
        let result = { luckyFiveLines: false, fiveLines: false, lottery: first, rewardType: 3, linkNum: 5 };
        if (first == config.monkey && item == 0) {  // 幸运五连线
            result.luckyFiveLines = true;
        } else {
            result.fiveLines = true;
        }
        return result;
    } else if (util.all((item) => item == first)(initArray)) {  // 单元素4连
        return { lottery: first, rewardType: 2, linkNum: 4 };
    } else if (util.all((item) => item == first)(doubleInitArray)) { // 单元素3连
        return { lottery: first, rewardType: 1, linkNum: 3 };
    }
    // 可以二连的元素
    if (config.canTwoLine.includes(first)) {  // 可以二连的元素
        const tripleInitArray = util.init(doubleInitArray);
        if (util.all((item) => item == first)(tripleInitArray)) {
            return { lottery: first, rewardType: 0, linkNum: 2 };  //单元素2连
        }
    }
    return null;
};

/**
 * 按照游戏配置生成窗口
 */
export function generatorWindow({ newer = null, isFreespin = null, gainedScatter = [], scatterPro = 0, iR1 = 0, iR2 = 0, wR = 0, aR = 0, jackpot = 0, bet, maxWin = null, linePosition = null, curRoulette }) {
    let winIds = [], wildNum = 0, bonusNum = 0, winEles = [], hasScatter = false;
    let select_ele = [];
    let eleWeight = util.clone(isFreespin ? config.freeEleWeight : config.eleWeight[curRoulette]);
    if (newer) {
        eleWeight = util.clone(config.eleWeight['1']);
    }
    else if (!isFreespin) {
        if (iR1) {
            eleWeight[config.wild] = eleWeight[config.wild].map((e, i) => {
                if (i != 0 && i != 4) {
                    return e + (curRoulette == '2' ? 18.4 : 11.8);
                }
                return e;
            });
        }
        if (iR2) {
            eleWeight[config.wild] = eleWeight[config.wild].map((e, i) => {
                if (i != 0 && i != 4) {
                    return e + (curRoulette == '2' ? 9 : 19.9);
                }
                return e;
            });
        }
        if (wR) {
            eleWeight[config.wild] = eleWeight[config.wild].map((e, i) => {
                if (i != 0 && i != 4) {
                    return e - (curRoulette == '1' ? 23.5 : curRoulette == '2' ? 15 : 13.6);
                }
                return e;
            });
        }
        if (aR && false) {
            eleWeight[config.wild] = eleWeight[config.wild].map((e, i) => {
                if (i != 0 && i != 4) {
                    return e + (curRoulette == '1' ? 8.5 : curRoulette == '2' ? 6 : 3);
                }
                return e;
            });
        }
        // eleWeight[config.monkey] = [65, 50, 40, 65, 65];

    }
    if (jackpot < bet * 70 * 2) {
        eleWeight[config.monkey][1] = 0;
        eleWeight[config.wild][1] = 0;
    } else if (jackpot < bet * config.maxAward) {
        eleWeight[config.monkey][4] = 0;
    }

    if (maxWin) {
        eleWeight[config.monkey] = [0, 0, 0, 0, 0];
    }

    for (let i = 0; i < config.column; i++) {
        let colArray = [], colId = [], colBonus = false, colWild = false;
        const colDistribute = Object.keys(eleWeight).map(id => {
            if ((id == config.wild && wildNum == config.specialMaxNum[id]) || (id == config.bonus && bonusNum == config.specialMaxNum[id])) {
                return { [id]: 0 }
            }
            return { [id]: eleWeight[id][i] }
        });
        for (let j = 0; j < config.row; j++) {
            if (colBonus) {  //如果某列存在bonus,则改列不出bonus
                colDistribute.forEach((e, i) => {
                    if (Object.keys(e)[0] == config.bonus) {
                        colDistribute[i] = { [config.bonus]: 0 };
                    }
                });
            }

            if (colWild) {  //如果某列存在wild,则改列不出wild
                colDistribute.forEach((e, i) => {
                    if (Object.keys(e)[0] == config.wild) {
                        colDistribute[i] = { [config.wild]: 0 };
                    }
                });
            }
            let select = util.selectEle(colDistribute);
            const ele = { id: select, scatter: null };
            if (select == config.wild) {
                wildNum++;
                colWild = true;
                if (wildNum == config.specialMaxNum[select]) {
                    const index = colDistribute.findIndex(col => Object.keys(col)[0] == select);
                    colDistribute[index] = { [select]: 0 };
                }
            } else if (select == config.bonus) {
                bonusNum++;
                colBonus = true;
                if (bonusNum == config.specialMaxNum[select]) {
                    const index = colDistribute.findIndex(col => Object.keys(col)[0] == select);
                    colDistribute[index] = { [select]: 0 };
                }
            } else {
                if (Math.random() < scatterPro && hasScatter == false) {
                    const canScatterType = util.difference(config.scatterType, gainedScatter);
                    if (canScatterType.length > 0) {
                        ele.scatter = canScatterType[Math.floor(util.random(0, canScatterType.length - 1))];

                        select_ele.push(ele.scatter);
                        hasScatter = true;
                    }
                }
            }
            colArray.push(ele);
            colId.push(select);
        }
        winEles.push(colArray);
        winIds.push(colId);
    }

    if (maxWin) {
        const awardLine = config.winningLine[linePosition];
        awardLine.forEach((e, i) => {
            winIds[i][e - 1] = config.monkey;
            winEles[i][e - 1].id = config.monkey;
        });
    }
    return { winIds, bonusNum, winEles, select_ele, gainedScatter, hasScatter };
};

/**
 * 根据生成的窗口判断赢钱情况
 */
function windowAward({ winIds, bet, lineNum, bonusNum, free, peachNum }) {
    if (!isHaveLine(lineNum)) {
        // return '选线错误';
    }
    const odds = awardOdds(peachNum);
    //取出可中奖的中奖线
    const curWinningLines = config.winningLine.slice(0, lineNum);

    //遍历所有的 当前中奖线
    let totalWin = 0, winLines = [], luckyFiveLines = false, bonusGame = false, jackpotWin = 0, fiveLines = false, bigWin = false, multiple = 0;
    const dispears = new Set();  //所有需要消除的位置
    curWinningLines.forEach((line, item) => {
        // 这条线上的元素数组
        const lineIds = line.map((r, m) => {
            return winIds[m][r - 1]
        });
        const cloneLineIds = util.clone(lineIds);

        //如果其中存在wild元素,将其转成其前一个元素 bonus除外
        lineIds.forEach((id, index) => {
            if (id == config.wild) {
                if (lineIds[index - 1] != config.bonus) {
                    lineIds[index] = lineIds[index - 1];
                }
            }
        });
        //判断这条连线的中奖情况
        const lineResult: any = winningJudgment(lineIds, item);
        if (lineResult != null) {  //这条线中奖的情况
            line.slice(0, lineResult.linkNum).forEach((l, i) => {
                dispears.add(i.toString() + (l - 1));
            });
            const lineBet = config.awardSetting[lineResult.lottery][lineResult.rewardType];
            totalWin += (free ? lineBet * bet * 5 * odds : lineBet * bet * odds);
            const linkIds = cloneLineIds.slice(0, lineResult.linkNum);
            multiple += lineBet;
            if (lineResult.luckyFiveLines && luckyFiveLines == false) {
                luckyFiveLines = true;
            }
            if (lineResult.fiveLines && fiveLines == false) {
                fiveLines = true;
            }
            if (lineResult.lottery == config.monkey) {
                jackpotWin += (free ? lineBet * bet * 5 : lineBet * bet);
            }
            winLines.push({ index: item, linkNum: lineResult.linkNum, linkIds, money: lineBet * bet, type: lineResult.lottery });
        }
    });
    if (bonusNum == config.specialMaxNum[config.bonus]) {
        bonusGame = true;
        //此时bonus元素也需要消除
        winIds.forEach((ids, index) => {
            ids.forEach((id, i) => {
                if (id == config.bonus) {
                    dispears.add(index.toString() + i);
                }
            });
        });
    }
    if (totalWin >= bet * lineNum * 5) {
        bigWin = true;
    }
    return { totalWin, winLines, luckyFiveLines, bonusGame, jackpotWin, dispears, fiveLines, bigWin, multiple };
};

function dispearsDeal(winIds, dispears, jackpot, bet: number, curRoulette, maxWin) {
    const dealWinIds = util.clone(winIds);
    const dispearsPos = [];
    let wildNum = 0;
    //将消除位置变为null
    dispears.forEach(d => {
        dealWinIds[d[0]][d[1]] = null;
        dispearsPos.push([Number(d[0]) + 1, Number(d[1]) + 1]);
    });
    //降落
    for (let i = 0; i < dealWinIds.length; i++) {
        for (let j = dealWinIds[i].length - 1; j > 0; j--) {
            if (dealWinIds[i][j] == null) {
                const index = util.findLastIndex(v => v != null)(dealWinIds[i].slice(0, j));
                if (index != -1) {
                    [dealWinIds[i][j], dealWinIds[i][index]] = [dealWinIds[i][index], dealWinIds[i][j]];
                }
            }
            if (dealWinIds[i][j] == config.wild) {
                wildNum++;
            }
        }
    }
    //补全
    const completion = [];
    for (let i = 0; i < dealWinIds.length; i++) {
        const colWeight = Object.keys(config.eleWeight[curRoulette]).map(id => {
            if (id == config.bonus || (id == config.wild && wildNum == config.specialMaxNum.wild)) {
                return { [id]: 0 }
            }
            if (jackpot < bet * 20 * 2 || maxWin) {
                if (i == 1) {
                    if (id == config.monkey || id == config.wild) {
                        return { [id]: 0 };
                    }
                }
            } else if (jackpot < bet * 300 * 2) {
                if (i == 4) {
                    if (id == config.monkey) {
                        return { [id]: 0 };
                    }
                }
            }
            return { [id]: config.eleWeight[curRoulette][id][i] }
        });

        for (let j = 0; j < dealWinIds[i].length; j++) {
            if (dealWinIds[i][j] == null) {
                dealWinIds[i][j] = util.selectEle(colWeight);
                if (dealWinIds[i][j] == config.wild) {
                    wildNum++;
                }
                completion.push({ x: i + 1, y: j + 1, id: dealWinIds[i][j] });
            }
        }
    }
    return { dispearsPos, completion, dealWinIds };
};

/**
 * @param winIds-为每局游戏的第一界面
 */
export function finalResult({ winIds, bet, lineNum, bonusNum, free = null, jackpot, curRoulette, maxWin = 0 }) {
    const result = { rounds: [], luckyFiveLines: false, fiveLines: false, roundsAward: [], allTotalWin: 0, jackpotWin: 0, multiple: 0, peachNum: null, bonusGame: null };
    //单独页面(初始页面)的结算结果
    let peachNum = 0;
    let windowAwardResult = windowAward({ winIds, bet, lineNum, bonusNum, free, peachNum });
    result.allTotalWin += windowAwardResult.totalWin;
    result.jackpotWin += windowAwardResult.jackpotWin;
    jackpot -= windowAwardResult.jackpotWin;
    result.roundsAward.push(windowAwardResult);
    result.multiple += windowAwardResult.multiple;
    if (windowAwardResult.bonusGame) {
        result.bonusGame = true;
    }
    if (windowAwardResult.luckyFiveLines && !result.luckyFiveLines) {
        result.luckyFiveLines = true;
    }
    if (windowAwardResult.fiveLines && !result.fiveLines) {
        result.fiveLines = true;
    }
    //在可消除的情况下
    while (windowAwardResult.dispears.size > 0) {
        peachNum++;
        //消除并补全后得到的新界面
        let nextRound = dispearsDeal(winIds, windowAwardResult.dispears, jackpot, bet, curRoulette, maxWin);
        result.rounds.push(nextRound.dispearsPos, nextRound.completion);
        winIds = nextRound.dealWinIds;
        windowAwardResult = windowAward({ winIds, bet, lineNum, bonusNum: 0, free, peachNum });
        result.allTotalWin += windowAwardResult.totalWin;
        result.jackpotWin += windowAwardResult.jackpotWin;
        jackpot -= windowAwardResult.jackpotWin;
        result.roundsAward.push(windowAwardResult);
        result.multiple += windowAwardResult.multiple;
        if (windowAwardResult.luckyFiveLines && !result.luckyFiveLines) {
            result.luckyFiveLines = true;
        }
        if (windowAwardResult.fiveLines && !result.fiveLines) {
            result.fiveLines = true;
        }
    }
    result.peachNum = peachNum;

    return result;
};

export function dealFreespin(bet: number, lineNum: number, individualRegulation1, individualRegulation2, wholeRegulation, jackpot, curRoulette) {
    let i = 5, result = { freespins: [], allTotalWin: 0, boom: false, allJackpotWin: 0, multiple: 0 };
    while (i > 0) {
        const freeWindow = generatorWindow({ isFreespin: true, jackpot, bet, curRoulette });
        const oneFreeResult = finalResult({ winIds: freeWindow.winIds, bet, lineNum: 25, bonusNum: freeWindow.bonusNum, free: true, jackpot, curRoulette });
        result.allTotalWin += oneFreeResult.allTotalWin;
        result.allJackpotWin += oneFreeResult.jackpotWin;
        jackpot -= oneFreeResult.jackpotWin;
        result.multiple += oneFreeResult.multiple;
        if (oneFreeResult.luckyFiveLines && !result.boom) {
            result.boom = true
        }
        result.freespins.push({ firstRound: freeWindow.winIds, oneFreeResult });
        i--;
    }
    if (result.allTotalWin == 0 || result.allTotalWin / bet > slotsAwardRateLimit('1')) {   //freespin至少赢一局
        let oneFreeResult, freeWindow;
        do {
            freeWindow = generatorWindow({ isFreespin: true, jackpot, bet, curRoulette });
            oneFreeResult = finalResult({ winIds: freeWindow.winIds, bet, lineNum, bonusNum: freeWindow.bonusNum, free: true, jackpot, curRoulette });
        } while (oneFreeResult.allTotalWin <= 0);
        result.allTotalWin += oneFreeResult.allTotalWin;
        result.allJackpotWin += oneFreeResult.jackpotWin;
        jackpot -= oneFreeResult.jackpotWin;
        result.multiple += oneFreeResult.multiple;
        if (oneFreeResult.luckyFiveLines && !result.boom) {
            result.boom = true
        }
        result.freespins[util.random(0, 4)] = { firstRound: freeWindow.winIds, oneFreeResult };
    }
    return result;
};

/**
 * 根据桃子数计算奖励倍数
 */
function awardOdds(peachNum: number) {
    return peachNum == 0 ? 1 : ([1, 2, 3, 4, 5].includes(peachNum) ? peachNum + 1 : 6);
};

/**
 * 随机结果
 * 规则修改： 返奖率不能超过40 修改时间 2019.8.27
 */
export function randomResult({ newer, gainedScatter, scatterPro, iR1, iR2, wR, aR, jackpot, bet,
    curRoulette, lineNum, maxWin }) {
    // return () => {
    let initWindow_1 = generatorWindow({ newer, gainedScatter, scatterPro, iR1, iR2, wR, aR, jackpot, bet, curRoulette });
    let finalResult_1 = finalResult({
        winIds: initWindow_1.winIds, bet, lineNum,
        bonusNum: initWindow_1.bonusNum, jackpot, curRoulette, maxWin
    });

    while (finalResult_1.allTotalWin / bet > slotsAwardRateLimit('7')) {
        initWindow_1 = generatorWindow({ newer, gainedScatter, scatterPro, iR1, iR2, wR, aR, jackpot, bet, curRoulette });
        finalResult_1 = finalResult({
            winIds: initWindow_1.winIds, bet, lineNum,
            bonusNum: initWindow_1.bonusNum, jackpot, curRoulette, maxWin
        });
    }

    return { initWindow_1, finalResult_1 }
    // };
};

/**
 * 获取系统必输或者必胜方法
 */
export function getResult(par, totalBet, isSystemWin) {
    // return () => {
    let res;
    // const closure = randomResult(par);
    for (let i = 0; i < 100; i++) {
        res = randomResult(par);

        // 在调控的时候不能获得字
        if (isSystemWin && res.finalResult_1.allTotalWin <= totalBet && res.initWindow_1.select_ele.length === 0) {
            break;
        }

        if (!isSystemWin && res.finalResult_1.allTotalWin > totalBet) {
            break;
        }
    }

    return res;
    // }
};