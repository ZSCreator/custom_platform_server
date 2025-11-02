import Player from "../qznnPlayer";
import qznnRoom from "../qznnRoom";
import qznn_logic = require("../qznn_logic");

/**
 * 构建记录需要结果
 * @param players 房间玩家列表
 * @param room 房间信息
 */
export function buildRecordResult(players: Player[], room: qznnRoom): string {
    // 第一位表示有几个玩家在玩耍
    let prefix = players.filter(p => !!p && p.status === 'GAME').length.toString();
    // 表示哪些位置拥有玩 6 位
    players.map(p => prefix += !!p && p.status === 'GAME' ? '1' : '0');

    let suffix = '';
    // 座位号 是否是庄 牌 牌型 输赢 默认输赢为0
    players.forEach(p => {
        if (!p || p.status !== 'GAME') {
            return;
        }

        // 座位号
        suffix += (p.seat).toString();

        // 是否是庄
        suffix += room.zhuangInfo.uid === p.uid ? '1' : '0';

        // 牌
        suffix += conversionCards(p.cards);

        // 牌型
        suffix += p.cardType.count.toString(16);
    });


    return prefix + suffix;
}

/**
 * 转换花色
 * @param card
 */
function conversionColor(card: number): string {
    if (card >= 1 && card < 14) {
        return '3';
    }

    if (card >= 14 && card < 27) {
        return '2';
    }

    if (card >= 27 && card < 40) {
        return '1';
    }

    if (card >= 40 && card < 53) {
        return '0';
    }

    return '4';
}


function conversionCards(cards: number[] | number): string {
    if (Array.isArray(cards)) {
        return cards.map(c => {
            return `${conversionColor(c)}${((c - 1) % 13 + 1).toString(16)}`;
        }).reduce((c1, c2) => c1 + c2);

    }

    return `${conversionColor(cards)}${(cards % 13 + 1).toString(16)}`;
}

// const players = new Array(6).fill(null);
//
// let aPoker = shuffle();
//
// const cards: { cards: number[], cardType: any }[] = [];
// for (let len = 10; len >= 0; len--) {
//     const card = aPoker.splice(0, 5);
//     const cardType = getCardType(card);
//     cards.push({ cards: card, cardType });
// }
//
// const p1 = {uid: 2, cards: cards[0].cards, cardType: cards[0].cardType, isBanker: true, seat: 2, profit: -10};
// const p2 = {uid: 5, cards: cards[1].cards, cardType: cards[1].cardType, isBanker: false, seat: 5, profit: 10};
// players[2] = p1;
// players[5] = p2;
//
// console.log(buildRecordResult(players, {zhuangInfo: {uid: 2}}))
