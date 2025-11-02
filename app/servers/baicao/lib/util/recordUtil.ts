import Player from "../baicaoPlayer";
import { conversionCards } from "../../../../utils/GameUtil";

/**
 * 构建记录需要结果
 * @param players 房间的游戏列表
 */
export function buildRecordResult(players: Player[]): string {
    // 前缀表示有多少个游戏玩家
    let prefix: string = players.filter(p => !!p && p.status === 'GAME').length.toString();
    // 表示哪些位置拥有玩 6 位
    players.map(p => prefix += !!p && p.status === 'GAME' ? '1' : '0');

    let suffix = '';
    // 座位号 是否是庄 牌 牌型 输赢 默认输赢为0
    players.forEach(p => {
        // 如果没有玩家且不再游戏状态
        if (!p || p.status !== 'GAME') {
            return;
        }

        // 座位号
        suffix += (p.seat).toString();

        // 牌
        suffix += conversionCards(p.cards.map(card => card - 1));

        switch (p.cardType) {
            case 2: suffix += 'b'; break;
            case 1: suffix += 'a'; break;
            case 0: suffix += p.Points.toString(); break;
        }

        // 输赢
        suffix += p.profit >= 0 ? '1' : '0';
    });


    return prefix + suffix;
}