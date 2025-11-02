import Player from "../dzPlayer";
import {conversionCards} from "../../../../utils/GameUtil";


/**
 * 构建记录需要结果
 * @param players 房间的游戏列表
 * @param holeCards 底牌
 */
export function buildRecordResult(players: Player[], holeCards: number[]): string {
    // 前缀表示有多少个游戏玩家
    let prefix: string = players.filter(p => !!p && p.status === 'GAME').length.toString();
    // 表示哪些位置拥有玩 6 位
    players.map(p => prefix += !!p && p.status === 'GAME' ? '1' : '0');

    // 底牌
    prefix += conversionCards(holeCards);

    let suffix = '';
    // 座位号 是否是庄 牌 牌型 输赢 默认输赢为0
    players.forEach(p => {
        // 如果没有玩家且不再游戏状态
        if (!p || p.status !== 'GAME') {
            return;
        }

        // 座位号
        suffix += (p.seat).toString();

        // 手牌
        suffix += conversionCards(p.holds);
    });


    return prefix + suffix;
}

// 5011111000 33121b1635 12238 22c1c 32b3a 43b13 51517
