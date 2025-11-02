import utils = require('../../../utils');
// 1 - 13 // 黑桃 1 - 13
// 14 - 26 // 红桃 1 - 13
// 27 - 39 // 梅花 1 - 13
// 40 - 52 // 方块 1 - 13
// 52大王

/**洗牌 52张 比牌牛牛 百人牛牛*/
export function shuffle() {
    const cards: number[] = [];
    for (let i = 0; i < 52; i++) {// 52张牌
        cards.push(i);
    }
    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};
/**
 * 在一副牌里面随机抽取指定个数的牌
 * @param arr 牌数组
 * @param num 牌个数
 */
export function getCardNum(arr: number[], num: number) {
    const cards: number[] = [];
    for (let i = 0; i < num; i++) {
        const index = Math.floor(Math.random() * arr.length);
        cards.push(arr[index]);
        arr.splice(index, 1);
    }
    return cards;
}

/**判断是否可能成牛(计算两张牌) */
export function getCardTypeNew_(cards: number[]) {
    let num = 0;
    cards.map(m => {
        num += (m % 13 + 1) >= 10 ? 10 : (m % 13 + 1)
    });
    return num % 10 === 0;
}

/**
 * 百人牛牛 和 比牌牛牛获取牌型
 * 0 - 10 表示 没牛到牛牛
 * 11.银牛 12.金牛 13.炸弹
 */
export function getCardType(cards: number[]) {
    //cow是牛 num是J,Q,K,10 的个数  total是总和
    let total = 0, cow = -1, num: number
    let value: { id: number, count: number };
    const map: { id: number, count: number }[] = [];
    // 全部加1
    let thecards = cards.map(m => {
        num = m % 13 + 1;
        value = map.find(m => m.id === num);
        value ? (value.count += 1) : map.push({ id: num, count: 1 });
        (num >= 10) && (num = 10);
        total += num;
        return num;
    });
    // 炸弹：4张相同点数的牌+1张散牌
    if (map.find(m => m.count === 4)) {
        return 13;
    }

    // 金牛：5张全是JQK
    if (map.every(m => m.id >= 11)) {
        return 12;
    }
    // 银牛：五张牌都在10点以上，其中至少有一张10点
    const si = map.find(m => m.id === 10);
    if (si && si.count >= 1 && map.every(m => m.id >= 10)) {
        return 11;
    }
    // 其他牛
    for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 5; j++) {
            if ((total - thecards[i] - thecards[j]) % 10 == 0) {
                cow = (thecards[i] + thecards[j]) % 10;
            }
        }
    }
    cow = cow === 0 ? 10 : cow;
    return cow = cow === -1 ? 0 : cow;
};


/**返回组成牛牛得几张牌 */
export function getNiuNum(cards: number[]) {
    let total = 0, cow = -1, num, value, cows: number[] = [];
    const map = [], cards_ = cards.slice();
    // 全部加1
    cards = cards.map(m => {
        num = m % 13 + 1;
        value = map.find(m => m.id === num);
        value ? (value.count += 1) : map.push({ id: num, count: 1 });
        (num >= 10) && (num = 10);
        total += num;
        return num;
    });
    for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 5; j++) {
            if ((total - cards[i] - cards[j]) % 10 == 0) {
                cows = [0, 1, 2, 3, 4].filter(m => m !== i && m !== j).map(k => {
                    return cards_[k]
                });
                cows = cards_.filter(c => !cows.includes(c));
                cow = (cards[i] + cards[j]) % 10;
            }
        }
    }
    cow = cow === 0 ? 10 : cow;
    cow = cow === -1 ? 0 : cow;
    if (cow >= 10) {
        return cards_;
    }
    return cows;
}

// 比牌 两个人比
export function bipaiSole(fight1, fight2) {
    // 一样大 比点数
    if (fight1.cardType === fight2.cardType) {
        // 同点数需要判断花色
        const arr1 = fight1.cards.slice().sort((a, b) => (b % 13 === a % 13) ? (a - b) : (b % 13 - a % 13));
        const arr2 = fight2.cards.slice().sort((a, b) => (b % 13 === a % 13) ? (a - b) : (b % 13 - a % 13));
        const max1 = arr1[0] % 13, max2 = arr2[0] % 13;
        // 点数一样 比花色
        if (max1 === max2) {
            return arr1[0] / 13 < arr2[0] / 13;
        }
        return max1 > max2;
    }
    return fight1.cardType > fight2.cardType;
};


//计算百人牛牛牌型大小
//cards牌数组
//cardType牛几
export function countCardsBairen(cards: number[], cardType: number) {
    const k = {
        0: 4,
        1: 3,
        2: 2,
        3: 1,
        4: 0,
    };
    const arr = cards.slice().sort((a, b) => b % 13 - a % 13);
    const dot = (utils.repairZero(arr[0] % 13, 2));//点数
    const huaSe = getPokerFlowerColor(arr[0]);//花色值越小越大
    return parseInt(cardType + '' + dot + '' + k[huaSe]);
}

/**获取牌的花色 */
export function getPokerFlowerColor(poker: number) {
    if (poker == 52 || poker == 53) {//大小王
        return 4;
    } else if (poker >= 39 && poker <= 51) {//方块
        return 3;
    } else if (poker >= 26 && poker <= 38) {//梅花
        return 2;
    } else if (poker >= 13 && poker <= 25) {//红桃
        return 1;
    } else {//黑桃
        return 0;
    }
}