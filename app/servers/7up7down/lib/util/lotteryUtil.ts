import util = require('../../../../utils');
import up7Const = require('../up7Const');
// import { leopards } from "../up7Const";
import up7Room from '../up7Room';
import {CommonControlState} from "../../../../domain/CommonControl/config/commonConst";
import {BetAreas} from "../up7Const";

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
export function settle(lotteryResult: number[], roomInfo: up7Room) {

    const winAreas = winAreasJudge(lotteryResult);
    const odds = up7Const.odds;

    let totalProfit = 0;
    for (const pl of roomInfo.players) {
        pl.profit = 0;
        for (const area in pl.bets) {
            pl.bets[area].profit = 0;
            if (winAreas == area) {
                //点数
                if (up7Const.points.includes(area as BetAreas)) {
                    let gold = pl.bets[area].bet * odds[area] - pl.bets[area].bet;
                    pl.bets[area].profit = gold;
                    pl.profit += gold;
                }
            } else {
                pl.bets[area].profit -= pl.bets[area].bet;
                pl.profit -= pl.bets[area].bet;
            }
        }

        totalProfit += pl.profit;
    }
    return { winAreas, totalProfit};
};

/**根据开奖结果计算中奖区域(这里只处理所有玩家共同面对的结果) */
function winAreasJudge(result: number[]) {

    //记录所有可中奖区域
    let winArea: BetAreas;
    //和值
    const totalPiont = util.sum(result);
    if (totalPiont >= 2 && totalPiont <= 6) {
        winArea = BetAreas.AA;
    } else if (totalPiont == 7) {
        winArea = BetAreas.BB;
    } else if (totalPiont >= 8 && totalPiont <= 12) {
        winArea = BetAreas.CC;
    }
    return winArea;
};



/**
 * 构建记录需要结果
 * @param lotteryResult
 * @param winAreas  谁赢
 */
export function buildRecordResult(lotteryResult: number[], winAreas: string) {
    // 前三位记录开出的骰子
    // const prefix: string = lotteryResult.map(r => r.toString()).reduce((a, b) => a + b);
    // // 第四位记录骰子是单还是双 单为 1 双为 2
    // const fourth: string = winAreas.find(r => r === 'double' || r === 'single') === 'double' ? '2' : '1';
    // // 第五位记录大小 大为2 小为1 如果没找到则为0 因为开豹子的时候通吃 围投
    // let fifth: string = winAreas.find(r => r === 'big' || r === 'small');
    // fifth = !fifth ? '0' : fifth === 'big' ? '2' : '1';
    // // 第六和第七位记录总点数
    // let sixth: string = lotteryResult.reduce((a, b) => a + b).toString();
    // if (sixth.length === 1) sixth = `0${sixth}`;

    // // 第八位表示豹子的点数
    // const findValue = winAreas.find(r => leopards.includes(r));
    // const eighth: string = findValue ? findValue.slice(1) : '0';

    // return `${prefix}${fourth}${fifth}${sixth}${eighth}`;
}

/**
 * 获取个控开奖结果
 * @param totalBet
 * @param state
 * @param calculateWinMethod
 */
export function preSettle(totalBet: number, state: CommonControlState, calculateWinMethod: any) {
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
 * @param room 7up7down房间
 * @param bet 真实玩家总押注
 * @param calculateWinMethod 结算方法
 * @param isSystemWin 是否系统赢
 */
// export function getWinORLossResult(room: up7Room, bet: number, calculateWinMethod: any, isSystemWin: boolean) {
//     let result: number[], win: number;
//     for (let i = 0; i < 100; i++) {
//         result = lottery();

//         if (containKillAreas(room, result)) {
//             continue;
//         }

//         win = calculateWinMethod(result);

//         // 如果是系统赢 则玩家收益小于等于总押注
//         if (isSystemWin && win <= bet) {
//             break;
//         }

//         // 如果是系统输 则收益大于总押注
//         if (!isSystemWin && win > bet) {
//             break;
//         }
//     }

//     return result;
// }

/**
 * 随机开奖
 * @param room
 */
export function randomLottery(room: up7Room) {
    let result: number[];

    // 防止死循环
    for (let i = 0; i < 100; i++) {
        result = lottery();

        // 如果不包含必杀区域就退出
        // if (!containKillAreas(room, result)) {
        //     break;
        // }
    }

    return result;
}


/**
 * 是否包含必杀区域
 * @param room
 * @param lotteryResult
//  */
// function containKillAreas(room: up7Room, lotteryResult: number[]): boolean {
//     const winAreas = winAreasJudge(lotteryResult, room);

//     if (!room.killAreas.size) {
//         return false;
//     }

//     return !!(winAreas.find(area => room.killAreas.has(area)));
// }


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