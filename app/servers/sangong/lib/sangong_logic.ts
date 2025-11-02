export function getpai() {
    const cards: number[] = [];

    for (let p = 0; p < 52; p++) {
        cards.push(p);
    }
    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};

/**比牌 两个人比 */
export function bipaiSoleBySg(fight1: { cards: number[], cardType: number }, fight2: { cards: number[], cardType: number }) {
    // 比点数
    if (fight1.cardType !== fight2.cardType) {
        return fight1.cardType > fight2.cardType;
    } else if (fight1.cardType === 0 && fight2.cardType === 0) {// 如果都是0点 某人判庄赢
        return true;
    }
    const arr1 = fight1.cards.slice(), arr2 = fight2.cards.slice();
    // 比较公牌数量
    const l1 = arr1.filter(m => m % 13 >= 10).length, l2 = arr2.filter(m => m % 13 >= 10).length;
    if (l1 !== l2) {
        return l1 > l2;
    }
    // 比较最大牌点数
    arr1.sort((a, b) => a - b);
    arr2.sort((a, b) => a - b);
    arr1.sort((a, b) => b % 13 - a % 13);
    arr2.sort((a, b) => b % 13 - a % 13);
    const c1 = arr1[0] % 13, c2 = arr2[0] % 13;
    if (c1 !== c2) {
        return c1 > c2;
    }
    // 比较花色
    return Math.floor(arr1[0] / 13) < Math.floor(arr2[0] / 13);
};

/**获取三公 牌型 */
export function getCardTypeBySg(cards: number[]) {
    let map = [], total = 0;

    // 全部加1
    const arr = cards.map(m => {
        const num = m % 13 + 1;
        const value = map.find(m => m.id === num);
        value ? (value.count += 1) : map.push({ id: num, count: 1 });
        total += Math.min(10, num);
    });

    // 12大三公
    if (map[0].count === 3 && map[0].id > 10) {
        return 12;
    }
    // 11小三公
    if (map[0].count === 3) {
        return 11;
    }
    // 10混三公
    if (map.every(m => m.id > 10)) {
        return 10;
    }
    // 正常点数
    return total % 10;
};