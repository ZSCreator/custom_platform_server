import tpPlayer from "../tpPlayer";
import {conversionCards} from "../../../../utils/GameUtil";

/**
 * 构造结果记录
 * @param players 玩家房间列表
 */
export function buildRecordResult(players: tpPlayer[]) {
    // 前缀表示有多少个游戏玩家
    let prefix: string = players.filter(p => !!p && p.status === 'GAME').length.toString();
    // 表示哪些位置拥有玩 5 位
    players.map(p => prefix += !!p && p.status === 'GAME' ? '1' : '0');

    let suffix = '';
    // 座位号 牌 牌型 1 + 6 + 1
    players.forEach(p => {
        // 如果没有玩家且不再游戏状态
        if (!p || p.status !== 'GAME') {
            return;
        }

        // 座位号
        suffix += (p.seat).toString();

        // 牌
        suffix += conversionCards(p.cards);

        // 牌型
        suffix += p.cardType.toString(16);
    });


    return prefix + suffix;
}