import Player from "../landPlayer";

function conversionCards(cards: number[]) {
    return cards.reduce((str, card) => {
        if (card === 0x4E) {
            return str += (str + '41');
        } else if (card === 0x4F) {
            return str += (str + '42');
        } else {
            return str += card.toString(16);
        }
    }, '');
}

/**
 * 构建记录需要结果
 * @param players 房间的游戏列表
 * @param holeCards 底牌
 */
export function buildRecordResult(players: Player[], holeCards: number[]): string {
    // 底牌
    const prefix = conversionCards(holeCards);

    let suffix = '';

    // 位置 + 是否是地主 + 牌
    players.forEach(p => {
        suffix += p.seat.toString();
        suffix += p.friendSeat === -1 ? '1' : '0';
        suffix += conversionCards(p.cards);
    })

    return `${prefix}${suffix}`;
}
