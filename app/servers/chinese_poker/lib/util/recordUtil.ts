import Player from "../cpPlayer";
import { conversionCards } from "../../../../utils/GameUtil";

/**
 * 构造开奖结果
 * @param players 房间列表
 */
export function buildRecordResult(players: Player[]) {
    // 第一位为有多少个玩家
    let prefix = players.filter(p => !!p && p.status === 'GAME').length.toString();
    // 表示哪些位置拥有玩家且在玩游戏 4位 1 代表有 0 代表没有
    players.map(p => prefix += !!p && p.status === 'GAME' ? '1' : '0');

    let suffix = '';
    // 座位号 是否是庄 牌 牌型 输赢 默认输赢为0
    players.forEach(p => {
        // 如果没有玩家且不再游戏状态
        if (!p || p.status !== 'GAME') {
            return;
        }

        // 座位号 1位
        suffix += (p.seat).toString();

        // 牌 26位
        suffix += conversionCards(p.cards);

        // 三幅牌的牌型 3位
        suffix += p.cardType1.type.toString(16);
        suffix += p.cardType2.type.toString(16);
        suffix += p.cardType3.type.toString(16);
    });


    return prefix + suffix;
}
