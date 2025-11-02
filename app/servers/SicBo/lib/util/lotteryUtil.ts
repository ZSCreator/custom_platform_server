import util = require('../../../../utils');
import JsonMgr = require('../../../../../config/data/JsonMgr');
import sicboConst = require('../sicboConst');
import { leopards } from "../sicboConst";
import sicboRoom from '../sicboRoom';
import { CommonControlState } from "../../../../domain/CommonControl/config/commonConst";

/**开奖 */
export function lottery() {
    let diceNum = 3;
    const result: number[] = [];
    while (diceNum > 0) {
        result.push(util.random(1, 6));
        diceNum--;
    }
    return result;
};

/**结算 */
export function settle(lotteryResult: number[], roomInfo: sicboRoom) {

    const winAreas = winAreasJudge(lotteryResult, roomInfo);
    const odds = JsonMgr.get('sicbo/odds').datas[0];
    for (const pl of roomInfo.players) {
        pl.profit = 0;
        for (const area in pl.bets) {
            if (winAreas.includes(area)) {
                //点数
                if (roomInfo.points.includes(area)) {
                    let gold = pl.bets[area].bet * odds[area]
                    pl.bets[area].profit = gold;
                    pl.profit += gold;
                }
                //大小单双
                if (roomInfo.bssd.includes(area)) {
                    let gold = pl.bets[area].bet * odds['bssd']
                    pl.bets[area].profit = gold;
                    pl.profit += gold;
                }
                //单骰 双骰 全骰
                if (roomInfo.diceNum.includes(area)) {
                    const diceNum = winAreas.filter(id => id === area).length;
                    const odd = diceNum === 1 ? odds['dice1'] : diceNum === 2 ? odds['dice2'] : odds['dice3'];
                    let gold = pl.bets[area].bet * odd
                    pl.bets[area].profit = gold;
                    pl.profit += gold;
                }
                //三同号
                if (roomInfo.three.includes(area)) {
                    let gold = (area === 'tany') ? pl.bets[area].bet * odds['tany'] : pl.bets[area].bet * odds['three'];
                    pl.bets[area].profit = gold;
                    pl.bets[area].profit = gold;
                    pl.profit += gold;
                }
            } else {
                pl.bets[area].profit -= pl.bets[area].bet;
                pl.profit -= pl.bets[area].bet;
            }
        }
    }
    return { winAreas };
};

/**三个一三个六过滤 */
function filterDot(result: number[]) {
    //三个一
    const res1 = result.every(m => sicboConst.SPECIAL_DOT.THREE_ONE.includes(m));
    if (res1) {
        return res1;
    }

    //三个六
    const res2 = result.every(m => sicboConst.SPECIAL_DOT.THREE_SIX.includes(m));
    if (res2) {
        return res2;
    }
    return false;
}

/**根据开奖结果计算中奖区域(这里只处理所有玩家共同面对的结果) */
function winAreasJudge(result: number[], roomInfo: sicboRoom) {

    //记录所有可中奖区域
    const winAreas: string[] = [];
    //和值
    const sum = util.sum(result);

    if (roomInfo.points.includes(`p${sum}`)) {
        winAreas.push(`p${sum}`);
    }
    //骰子点数
    const resultToSet = new Set(result);
    result.forEach(num => {
        winAreas.push(`d${num}`);
    });

    //大小 如果开出的是豹子（围骰）大小则被吞掉
    // 6 9 12 15
    if (resultToSet.size !== 1) {
        if (sum > 3 && sum <= 10) {
            winAreas.push('small');
        } else if (sum > 10 && sum <= 17) {
            winAreas.push('big');
        }
    }


    if (!filterDot(result)) {
        //单双
        if (sum % 2 === 0) {
            winAreas.push('double');
        } else {
            winAreas.push('single');
        }
    }

    //三同号
    if (resultToSet.size === 1) {
        winAreas.push('tany');
        const setSum = util.sum(Array.from(resultToSet));
        winAreas.push(`t${setSum}`);
    }
    return winAreas;
};

/**判断是不是机器人（需不需要记录日志） */
export function isRobotLog(isRobot: number) {
    return sicboConst.LOG_ISROBOT ? true : isRobot != 2;
}


/**
 * 构建记录需要结果
 * @param lotteryResult
 * @param winAreas  谁赢
 */
export function buildRecordResult(lotteryResult: number[], winAreas: string[]) {
    // 前三位记录开出的骰子
    const prefix: string = lotteryResult.map(r => r.toString()).reduce((a, b) => a + b);
    // 第四位记录骰子是单还是双 单为 1 双为 2
    const fourth: string = winAreas.find(r => r === 'double' || r === 'single') === 'double' ? '2' : '1';
    // 第五位记录大小 大为2 小为1 如果没找到则为0 因为开豹子的时候通吃 围投
    let fifth: string = winAreas.find(r => r === 'big' || r === 'small');
    fifth = !fifth ? '0' : fifth === 'big' ? '2' : '1';
    // 第六和第七位记录总点数
    let sixth: string = lotteryResult.reduce((a, b) => a + b).toString();
    if (sixth.length === 1) sixth = `0${sixth}`;

    // 第八位表示豹子的点数
    const findValue = winAreas.find(r => leopards.includes(r));
    const eighth: string = findValue ? findValue.slice(1) : '0';

    return `${prefix}${fourth}${fifth}${sixth}${eighth}`;
}

/**
 * 获取个控开奖结果
 * @param totalBet
 * @param state
 * @param calculateWinMethod
 */
export function getPersonalControlResult(totalBet: number, state: CommonControlState, calculateWinMethod: any) {
    let result: number[], win: number;
    for (let i = 0; i < 100; i++) {
        // 随机一个结果
        result = lottery();

        // 计算收益
        win = calculateWinMethod(result);

        if (state === CommonControlState.WIN && win > totalBet ||
            state === CommonControlState.LOSS && win <= totalBet) {
            break;
        }
    }

    return result;
}

/**
 * 获取一个系统赢或者系统输的结果
 * @param room 骰宝房间
 * @param bet 真实玩家总押注
 * @param calculateWinMethod 结算方法
 * @param isSystemWin 是否系统赢
 */
export function getWinORLossResult(room: sicboRoom, bet: number, calculateWinMethod: any, isSystemWin: boolean) {
    let result: number[], win: number;
    for (let i = 0; i < 100; i++) {
        result = lottery();

        if (containKillAreas(room, result)) {
            continue;
        }

        win = calculateWinMethod(result);

        // 如果是系统赢 则玩家收益小于等于总押注
        if (isSystemWin && win <= bet) {
            break;
        }

        // 如果是系统输 则收益大于总押注
        if (!isSystemWin && win > bet) {
            break;
        }
    }

    return result;
}

/**
 * 随机开奖
 * @param room
 */
export function randomLottery(room: sicboRoom) {
    let result: number[];

    // 防止死循环
    for (let i = 0; i < 100; i++) {
        result = lottery();

        // 如果不包含必杀区域就退出
        if (!containKillAreas(room, result)) {
            break;
        }
    }

    return result;
}


/**
 * 是否包含必杀区域
 * @param room
 * @param lotteryResult
 */
export function containKillAreas(room: sicboRoom, lotteryResult: number[]): boolean {
    const winAreas: string[] = winAreasJudge(lotteryResult, room);

    if (!room.killAreas.size) {
        return false;
    }

    return !!(winAreas.find(area => room.killAreas.has(area)));
}


// for (let i = 0; i < 100; i++) {
//     const r = lottery();
//     const s = winAreasJudge(r, {points:  [//下注面板1
//             'p4', 'p5', 'p6', 'p7', 'p8',
//             'p9', 'p10', 'p11', 'p12', 'p13',
//             'p14', 'p15', 'p16', 'p17'
//         ]});
//
//     const ss = buildRecordResult(r, s);
//
//     // if (ss.slice(0, 3) === '111') {
//         console.log(r, s, ss);
//     //
//     // }
//
// }