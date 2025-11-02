'use strict';

/*豹子5 > 炸弹4 > 顺子3 > 葫芦2 > 三条1 > 两对0> 一对0> 散牌0 */
export enum CardsType {
    /**散牌：五颗骰子点数不相同，且不为顺子 */
    SINGLE,
    /**一对：五颗骰子中有两颗相同，其余皆不同 */
    DOUBLE,
    /**两对：五颗骰子中有两个对子，一颗不同 */
    twodui,
    /**三条：五颗骰子中三颗相同，其余两颗不相同 */
    Three,
    /**葫芦：五颗骰子不完全相同，其中3颗骰子相同，另外两颗骰子也相同 */
    HuLu,
    /**顺子：五颗骰子点数依次连续 */
    SHUN,
    /**炸弹：五颗骰子中4颗相同，一颗不同 */
    ZaDan,
    /**豹子：5颗骰子完全相同*/
    BAOZI,
};
export function random(min: number, max: number) {
    let count = Math.max(max - min, 0);
    return Math.round(Math.random() * count) + min;
}

/**
 * 随机5个骰子
 */
export function getRandomDice(num = 5) {
    let poker: number[] = [];
    for (let i = 0; i < num; i++) {
        poker.push(random(1, 6));
    }
    return poker;
};


/**
 * 获取牌型
 * 豹子5 > 炸弹4 > 顺子3 > 葫芦2 > 三条1 > 两对0> 一对0> 散牌0
 */
export function getCardType(theCards: number[]) {
    const alikeCount = checkAlike(theCards);
    if (alikeCount.find(c => c.count == 5)) {
        return CardsType.BAOZI;
    }
    if (alikeCount.find(c => c.count == 4)) {
        return CardsType.ZaDan;
    }
    // 是否顺子
    const isShunzi = checkShunzi(theCards);
    if (isShunzi) {
        return CardsType.SHUN;
    }
    if (alikeCount.find(c => c.count == 3) && alikeCount.find(c => c.count == 2)) {
        return CardsType.HuLu;
    }
    if (alikeCount.find(c => c.count == 3)) {
        return CardsType.Three;
    }
    if (alikeCount.filter(c => c.count == 2).length == 2) {
        return CardsType.twodui;
    }
    if (alikeCount.filter(c => c.count == 2).length == 1) {
        return CardsType.DOUBLE;
    }
    return CardsType.SINGLE;
};

/**检查相同的number数组返回对应数据 */
export function checkAlike(theCards: number[]) {
    //[1,1,1,2,2] --->[{ key: 1, count: 3, Subscript: [ 0, 1, 2 ] }, { key: 2, count: 2, Subscript: [ 3, 4 ] }]
    const arr_1: { key: number, count: number, Subscript: number[] }[] = [];
    for (let i = 0; i < theCards.length; i++) {
        const card = theCards[i];
        let temp_arr = arr_1.find(c => c.key == card);
        if (temp_arr) {
            temp_arr.count += 1;
            temp_arr.Subscript.push(i);
        } else {
            arr_1.push({ key: card, count: 1, Subscript: [i] });
        }
    }
    // console.warn(arr_1);
    return arr_1;
};


/**
 * 比牌 两个人比
 * @param list 
 * @returns ret>0 p1大 ret<0 p2大 ret=0 相同
 */
export function bipaiSole(pl1: { cardType: number, cards: number[] }, pl2: { cardType: number, cards: number[] }) {
    if (pl1.cardType > pl2.cardType) {//只得一个 最大类型 如果2个就需要后面的比较
        return 1;
    } else if (pl1.cardType < pl2.cardType) {
        return -1;
    }
    const cards1 = pl1.cards.map(c => c);
    cards1.sort((a, b) => b - a);
    const cards2 = pl1.cards.map(c => c);
    cards2.sort((a, b) => b - a);
    const alikeCounts1 = checkAlike(pl1.cards);
    const alikeCounts2 = checkAlike(pl2.cards);
    if (pl1.cardType == CardsType.BAOZI) {
        let card1 = pl1.cards[0];
        let card2 = pl2.cards[0];
        return card1 - card2;
    }
    if (pl1.cardType == CardsType.ZaDan) {
        let card1 = pl1.cards[alikeCounts1.find(c => c.count == 4).Subscript[0]];
        let card2 = pl2.cards[alikeCounts2.find(c => c.count == 4).Subscript[0]];
        if (card1 - card2 == 0) {
            let cardss1: number[] = [];
            let cardss2: number[] = [];
            for (const c of alikeCounts1.filter(c => c.count == 1).map(c => c.Subscript[0])) {
                cardss1.push(pl1.cards[c]);
            }
            for (const c of alikeCounts2.filter(c => c.count == 1).map(c => c.Subscript[0])) {
                cardss2.push(pl2.cards[c]);
            }
            card1 = cardss1[0];
            card2 = cardss2[0];
        }
        return card1 - card2;
    }
    if (pl1.cardType == CardsType.SHUN) {
        // let card1 = pl1.cards[alikeCounts1.find(c => c.count == 4).Subscript[0]];
        // let card2 = pl2.cards[alikeCounts2.find(c => c.count == 4).Subscript[0]];
        return cards1[0] - cards2[0];
    }
    if (pl1.cardType == CardsType.HuLu) {
        let card1 = pl1.cards[alikeCounts1.find(c => c.count == 3).Subscript[0]];
        let card2 = pl2.cards[alikeCounts2.find(c => c.count == 3).Subscript[0]];
        if (card1 - card2 == 0) {
            card1 = pl1.cards[alikeCounts1.find(c => c.count == 2).Subscript[0]];
            card2 = pl2.cards[alikeCounts2.find(c => c.count == 2).Subscript[0]];
        }
        return card1 - card2;
    }
    if (pl1.cardType == CardsType.Three) {
        let card1 = pl1.cards[alikeCounts1.find(c => c.count == 3).Subscript[0]];
        let card2 = pl2.cards[alikeCounts2.find(c => c.count == 3).Subscript[0]];
        if (card1 - card2 == 0) {
            let cardss1: number[] = [];
            let cardss2: number[] = [];
            for (const c of alikeCounts1.filter(c => c.count == 1).map(c => c.Subscript[0])) {
                cardss1.push(pl1.cards[c]);
            }
            for (const c of alikeCounts2.filter(c => c.count == 1).map(c => c.Subscript[0])) {
                cardss2.push(pl2.cards[c]);
            }
            cardss1.sort((a, b) => b - a);
            cardss2.sort((a, b) => b - a);
            card1 = cardss1[0];
            card2 = cardss2[0];
            if (card1 == card2) {
                card1 = cardss1[1];
                card2 = cardss2[1];
            }
        }
        return card1 - card2;
    }
    if (pl1.cardType == CardsType.twodui) {
        let cardss1: number[] = [];
        let cardss2: number[] = [];
        for (const cc of alikeCounts1.filter(c => c.count == 2)) {
            for (const c of cc.Subscript) {
                cardss1.push(pl1.cards[c]);
                cardss1.sort((a, b) => b - a);
            }
        }
        for (const cc of alikeCounts2.filter(c => c.count == 2)) {
            for (const c of cc.Subscript) {
                cardss2.push(pl2.cards[c]);
                cardss2.sort((a, b) => b - a);
            }
        }
        let card1 = cardss1[0];
        let card2 = cardss2[0];
        if (card1 == card2) {
            card1 = cardss1[2];
            card2 = cardss2[2];
        }
        if (card1 == card2) {
            card1 = pl1.cards[alikeCounts1.find(c => c.count == 1).Subscript[0]];
            card2 = pl2.cards[alikeCounts2.find(c => c.count == 1).Subscript[0]];
        }
        return card1 - card2;
    }
    if (pl1.cardType == CardsType.DOUBLE) {
        let card1 = pl1.cards[alikeCounts1.find(c => c.count == 2).Subscript[0]];
        let card2 = pl2.cards[alikeCounts2.find(c => c.count == 2).Subscript[0]];
        if (card1 - card2 == 0) {
            let cardss1: number[] = [];
            let cardss2: number[] = [];
            for (const c of alikeCounts1.find(c => c.count == 1).Subscript) {
                cardss1.push(pl1.cards[c]);
                cardss1.sort((a, b) => b - a);
            }
            for (const c of alikeCounts2.find(c => c.count == 1).Subscript) {
                cardss2.push(pl2.cards[c]);
                cardss2.sort((a, b) => b - a);
            }
            for (let index = 0; index < cardss1.length; index++) {
                const c1 = cardss1[index];
                const c2 = cardss2[index];
                if (c1 != c2) {
                    card1 = cardss1[0];
                    card2 = cardss2[0];
                    break;
                }
            }
            card1 = cardss1[2];
            card2 = cardss2[2];
        }
        return card1 - card2;
    }
    if (pl1.cardType == CardsType.SINGLE) {
        return cards1[0] - cards2[0];
    }
};




/**是否顺子 */
function checkShunzi(cards: number[]) {
    cards.sort((a, b) => {
        return a - b;
    });
    for (let i = 0; i < cards.length - 1; i++) {
        if (cards[i] + 1 !== cards[i + 1]) {
            return false;
        }
    }
    return true;
};
