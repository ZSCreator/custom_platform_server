import sgPlayer from "../sgPlayer";
import { conversionCards } from "../../../../utils/GameUtil";


/**
 * 构建记录需要结果
 * @param players 房间的游戏列表
 */
export function buildRecordResult(players: sgPlayer[]): string {
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

        // 是否是庄
        suffix += p.isBanker ? '1' : '0';

        // 牌
        suffix += conversionCards(p.cards);

        // 牌型
        suffix += p.cardType.toString(16);

        // 输赢
        suffix += p.profit >= 0 ? '1' : '0';
    });


    return prefix + suffix;
}


// const players = new Array(6).fill(null);
//
// let aPoker = getpai();
//
// const cards: { cards: number[], cardType: number }[] = [];
// for (let len = 10; len >= 0; len--) {
//     const card = aPoker.splice(0, 3);
//     const cardType = getCardTypeBySg(card);
//     cards.push({ cards: card, cardType });
// }
//
// const p1 = {cards: cards[0].cards, cardType: cards[0].cardType, isBanker: true, seat: 2, profit: -10};
// const p2 = {cards: cards[1].cards, cardType: cards[1].cardType, isBanker: false, seat: 5, profit: 10};
// players[2] = p1;
// players[5] = p2;
//
// console.log(buildRecordResult(players).length)
