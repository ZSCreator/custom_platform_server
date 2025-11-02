// import utils = require('../../../utils');


import ttzRoom from '../../bairenTTZ/lib/ttzRoom';
import ttzPlayer from '../../bairenTTZ/lib/ttzPlayer';
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { random } from "../../../utils";

/** 结算 
 * lotteryResult=  东 西 南 北 中
 * [
 *  { south: [ 6, 7, 9 ] },
 * { north: [ 6, 1, 5 ] },
 * { center: [ 3, 3, 10 ] },
 * { east: [ 0, 8, 2 ] },
 * { west: [ 0, 4, 6 ] } 
* ]

 * userBets 玩家押注情况
*/
export function settle_zhuang(roomInfo: ttzRoom, Players: ttzPlayer[]) {
    try {
        lottery_fun(roomInfo);         // 开奖结果
        let winArea: string[] = calculateWinAreas(roomInfo);
        for (const pl of Players) {
            if (pl.bet) {
                pl.profit = 0;
                for (const area in pl.betList) {
                    pl.betList[area].profit = 0;
                    if (winArea.includes(area)) {
                        pl.betList[area].profit = pl.betList[area].bet;
                        pl.profit += pl.betList[area].bet;
                    } else {
                        pl.betList[area].profit = -pl.betList[area].bet;
                        pl.profit -= pl.betList[area].bet;
                    }
                }
            }
        }
        return { winArea };
    } catch (e) {
        console.error(`ttz_zhuangService.settle错误 ==> ${e}`);
        return null;
    }
}


/**
 * 计算赢的区域
 * @param room
 */
function calculateWinAreas(room) {
    let winArea: string[] = [];
    for (const lottery of room.lotterys) {
        if (`center` == lottery.area) {
            continue;
        }
        if (lottery.iswin) {
            winArea.push(lottery.area);
        }
    }

    return winArea;
}

/**
 * 统计类型
 * @param room 房间
 * @param players 玩家列表
 * @param statisticalType 需统计总利润玩家的类型
 */
export function controlLottery(room: ttzRoom, players: ttzPlayer[], statisticalType: RoleEnum) {
    const winArea = calculateWinAreas(room);

    // 统计的利润
    let win = 0;
    players.forEach(p => {
        if (p.isRobot === statisticalType) {
            for (let area in p.betList) {
                // 包含必杀区域的利润不进行统计
                if (!room.killAreas.has(area)) {
                    win += p.betList[area].profit;
                }
            }
        }
    });

    return { win, winArea };
}

/**
 * 打乱麻将
 */
export function shuffle_cards() {
    // 1.万子牌：从一万至九万，各4张，共36张。
    let cards = [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        10, 10, 10, 10,//4张白板
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        // 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        // 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        // 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        // 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37
        //31~37为东南西北中发白
    ];
    cards.sort((a, b) => 0.5 - Math.random());
    return cards;
}


/** 开奖 */
export function lottery_fun(roomInfo: ttzRoom) {
    let indexSet: Set<number> = new Set();

    while (indexSet.size < 5) {
        indexSet.add(random(0, roomInfo._numbers.length - 1));
    }

    const numberIndexList: number[] = [...indexSet];

    for (const index in roomInfo.lotterys) {
        const lottery = roomInfo.lotterys[index];


        lottery.result.push(roomInfo._numbers[numberIndexList[index]]);
        let Points = lottery.result[0] + lottery.result[1];

        lottery.type = 0;
        if (lottery.result[0] == lottery.result[1]) {
            lottery.type = 2;
        }
        else if (lottery.result[0] == 2 && lottery.result[1] == 8) {
            lottery.type = 1;
        }
        else if (lottery.result[0] == 8 && lottery.result[1] == 2) {
            lottery.type = 1;
        } else {
            if (Points >= 10) Points -= 10;
        }
        lottery.Points = Points;
    }

    let center_lottery = roomInfo.lotterys.find(m => m.area == `center`);
    for (const lottery of roomInfo.lotterys) {
        if (lottery.area == `center`) {
            continue;
        }
        lottery.iswin = false;
        /**先比较类型 */
        if (center_lottery.type < lottery.type) {
            lottery.iswin = true;
        }
        if (center_lottery.type != lottery.type) {
            continue;
        }
        /**在比较点数 */
        if (center_lottery.Points < lottery.Points) {
            lottery.iswin = true;
        }
        if (center_lottery.Points != lottery.Points) {
            continue;
        }
        /**点数相同 比较最大牌的大小 */
        if (Math.max(center_lottery.result[0], center_lottery.result[1]) < Math.max(lottery.result[0], lottery.result[1])) {
            lottery.iswin = true;
        }
    }
};
