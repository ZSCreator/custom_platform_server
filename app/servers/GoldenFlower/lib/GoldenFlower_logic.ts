'use strict';

export const pukes = ['黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
    '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
    '梅A', '梅2', '梅3', '梅4', '梅5', '梅6', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K',
    '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
];

export function random(min: number, max: number) {
    let count = Math.max(max - min, 0);
    return Math.floor(Math.random() * count) + min;
}

/**豹子5 > 顺金4 > 金花3 > 顺子2 > 对子1 > 单张0 */
export enum CardsType {
    /**单张 */
    SINGLE,
    /**对子 */
    DOUBLE,
    /**顺子 */
    SHUN,
    /**金花 */
    GoldenFlower,
    /**如果是顺子又是金花 --- 顺金 */
    SHUN_Golden,
    /**豹子：三张点相同的牌。例：AAA、222*/
    BAOZI,
};
// 0 - 12 // 黑桃 1 - 13
// 13 - 25 // 红桃 1 - 13
// 26 - 38 // 梅花 1 - 13
// 39 - 51 // 方块 1 - 13
// 52大王

/**
 * 随机一副牌
 */
export function randomPoker() {
    let poker: number[] = [];

    for (let i = 0; i < 52; i++) {
        poker.push(i);
    }

    return poker;
};

/**洗牌 0-52 17副牌 */
export function shuffle() {
    let cards: number[][] = [];

    // 获取一副顺序的牌
    const poker = randomPoker();

    // 打乱
    poker.sort(() => 0.5 - Math.random());

    // 取17副牌排序 正常情况下把2 - 10副给玩家 如果调控则把第一副给调控玩家 取第3 - 10牌随机给其他玩家
    for (let i = 0; i < 17; i++) {
        let arr: number[] = [];
        for (let j = 0; j < 3; j++) {
            const randomNumber = getRandomNumber(0, poker.length - 1);
            arr.push(poker.splice(randomNumber, 1)[0]);
        }
        cards.push(arr);
    }
    return cards;
}

/**获取牌 count 副 默认=1 */
export function getPai(count: number = 1) {
    const cards: number[] = [];
    for (let i = 0; i < count; i++) {
        for (let p = 0; p < 52; p++) {
            cards.push(p);
        }
    }
    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};

/**
 * 获取牌型
 * 豹子5 > 顺金4 > 金花3 > 顺子2 > 对子1 > 单张0
 */
export function getCardType(cards: number[]) {
    const arr = cards.map(m => m % 13);
    arr.sort((a, b) => a - b);
    // 是否顺子
    const isShunzi = checkShunzi(arr);
    // 是否同花
    const tempH = Math.floor(cards[0] / 13);
    const isTonghua = cards.every(m => tempH === Math.floor(m / 13));
    // 相同的个数
    const alikeCount = checkAlike(arr);
    // --- 豹子
    if (alikeCount[3] === 1) {
        return CardsType.BAOZI;
    }
    // 如果是顺子又是金花 --- 顺金
    if (isShunzi && isTonghua) {
        return CardsType.SHUN_Golden;
    }
    //金花
    if (isTonghua) {
        return CardsType.GoldenFlower;
    }
    //顺子
    if (isShunzi) {
        return CardsType.SHUN;
    }
    //对子
    if (alikeCount[2] === 1) {
        return CardsType.DOUBLE;//对子（AAK最大，223最小）。
    }
    return CardsType.SINGLE;
};

/**
 * @ 0 1 2 3 4 5 6 7 8 9 10 11 12 黑
 * @ A 2 3 4 5 6 7 8 9 10 J Q  K
 * @ 13 14 15 16 17 18 19 20 21 22 23 24 25 红桃
 * @ A  2  3  4  5  6  7  8  9  10  J Q  K
 * @ 26 27 28 29 30 31 32 33 34 35 36 37 38 梅花
 * @ A  2  3  4  5  6  7  8  9  10 J  Q  K
 * @ 39 40 41 42 43 44 45 46 47 48 49 50 51 方块
 * @ A  2  3  4  5  6  7  8  9  10 J  Q  K
 * @param cards
 */
export function judgeCards(cards: number[]) {
    const config = {
        0: '黑桃A', 1: '黑桃2', 2: '黑桃3', 3: '黑桃4', 4: '黑桃5', 5: '黑桃6', 6: '黑桃7', 7: '黑桃8', 8: '黑桃9', 9: '黑桃10', 10: '黑桃J', 11: '黑桃Q', 12: '黑桃K',
        13: '红桃A', 14: '红桃2', 15: '红桃3', 16: '红桃4', 17: '红桃5', 18: '红桃6', 19: '红桃7', 20: '红桃8', 21: '红桃9', 22: '红桃10', 23: '红桃J', 24: '红桃Q', 25: '红桃K',
        26: '梅花A', 27: '梅花2', 28: '梅花3', 29: '梅花4', 30: '梅花5', 31: '梅花6', 32: '梅花7', 33: '梅花8', 34: '梅花9', 35: '梅花10', 36: '梅花J', 37: '梅花Q', 38: '梅花K',
        39: '方块A', 40: '方块2', 41: '方块3', 42: '方块4', 43: '方块5', 44: '方块6', 45: '方块7', 46: '方块8', 47: '方块9', 48: '方块10', 49: '方块J', 50: '方块Q', 51: '方块K',
    };
    const type_config = {
        0: "单张",
        1: "对子",
        2: "顺子",
        3: "金花",
        4: "顺金",
        5: "豹子",
    }
    const arr: string[] = [];
    cards.forEach(card => {
        arr.push(config[card]);
    });
    let type = type_config[getCardType(cards)];
    return { arr, type };
};
/**@returns 返回随机数 */
export function getRandomNumber(min: number, max: number) {
    if (max % 1 !== 0 || min % 1 !== 0) {
        throw "min, max不能为非整数";
    }

    const MAX = Math.max(min, max);
    const MIN = Math.min(min, max);
    const MM = MAX - MIN + 1;

    return Math.floor(Math.random() * MM) + MIN;
};
/**
 * 返回牌面值
 * 
 * @param card 0-53
 */
export function getCardValue(card: number) {
    let CardValue = card % 13 == 0 ? 14 : card % 13;
    return CardValue;
    // return (CardValue <= 2) ? (CardValue + 13) : CardValue;
};

/**
 * 比牌 两个人比
 * @param list 
 * @returns 1 大于 -1 小于 0 等于
 */
export function bipaiSole(pl1: { cardType: number, cards: number[] }, pl2: { cardType: number, cards: number[] }) {
    // players.sort((a, b) => b.cardType - a.cardType);
    // 一样的话比 大小
    // const list = players.filter(m => m.cardType === players[0].cardType);
    if (pl1.cardType > pl2.cardType) {//只得一个 最大类型 如果2个就需要后面的比较
        return 1;
    } else if (pl1.cardType < pl2.cardType) {
        return -1;
    }
    /**相等 */
    const cardType = pl1.cardType;
    let arr1 = pl1.cards.slice().sort((a, b) => {
        return getCardValue(b) - getCardValue(a)
    });
    let arr2 = pl2.cards.slice().sort((a, b) => {
        return getCardValue(b) - getCardValue(a)
    });



    //8.豹子、金花、单张的比较，按照顺序比点的规则比较大小。 牌点从大到小为：A、K、Q、J、10、9、8、7、6、5、4、3、2，各花色不分大小
    if (cardType == CardsType.BAOZI ||
        cardType == CardsType.GoldenFlower ||
        cardType == CardsType.SINGLE) {
        for (let i = 0; i < arr1.length; i++) {
            let cardNum1 = getCardValue(arr1[i]);
            let cardNum2 = getCardValue(arr2[i]);
            if (cardNum1 > cardNum2) {
                return 1;
            } else if (cardNum1 < cardNum2) {
                return -1;
            }
        }
    } else if (cardType == CardsType.SHUN || cardType == CardsType.SHUN_Golden) {
        let shun_arr1 = arr1.map((a) => getCardValue(a));
        let shun_arr2 = arr2.map((a) => getCardValue(a));
        /**A23 最小顺子 特殊处理一下 */
        if (shun_arr1.toString() == '14,2,1') shun_arr1 = [2, 1, 0];
        if (shun_arr2.toString() == '14,2,1') shun_arr2 = [2, 1, 0];
        for (let i = 0; i < arr1.length; i++) {
            let cardNum1 = shun_arr1[i];
            let cardNum2 = shun_arr2[i];
            if (cardNum1 > cardNum2) {
                return 1;
            } else if (cardNum1 < cardNum2) {
                return -1;
            }
        }
    } else if (cardType == CardsType.DOUBLE) {//对子、
        let yiduiPoker1 = specialPoker(cardType, arr1);
        let yiduiPoker2 = specialPoker(cardType, arr2);
        // let cardNum1 = getCardValue(yiduiPoker1);//A要单独处理为最大
        // let cardNum2 = getCardValue(yiduiPoker2);//
        if (yiduiPoker1 > yiduiPoker2) {
            return 1;
        } else if (yiduiPoker1 < yiduiPoker2) {
            return -1;
        }
        let pokerSize1 = countPokerDot(arr1, yiduiPoker1);
        let pokerSize2 = countPokerDot(arr2, yiduiPoker2);
        if (pokerSize1 > pokerSize2) {
            return 1;
        } else if (pokerSize1 < pokerSize2) {
            return -1;
        }
    }
    if (getPokerFlowerColor(arr1[0]) > getPokerFlowerColor(arr2[0])) {
        return 1;
    }
    return -1;
};

/**返回单个牌 */
export function countPokerDot(arr: number[], noExit: number) {
    let num = 0;
    arr.forEach(n => {
        if (![noExit].includes(getCardValue(n))) {
            num = getCardValue(n);
        }
    });
    return num;
}

/**找出特殊牌的牌 返回对子的 对子大小 面值  */
export function specialPoker(type: number, arr: number[]) {
    let arr_ = arr.slice();
    arr_ = arr_.map(m => getCardValue(m));
    let arrs = [];
    if (type == 1 || type == 2) {//一对,三条
        let value: number;
        arr_.forEach(m => {
            if (!arrs.includes(m)) {
                arrs.push(m);
            } else {
                value = m;
            }
        });
        return value;
    }
}
/**是否顺子 */
function checkShunzi(cards: number[]) {
    cards.sort((a, b) => {
        return a - b;
    });
    let i = 0;
    if (cards[0] === 0 && cards[2] === 12) {
        i = 1;
    }
    for (; i < cards.length - 1; i++) {
        if (cards[i] + 1 !== cards[i + 1]) {
            return false;
        }
    }
    return true;
};

/**检查相同的 */
function checkAlike(cards: number[]) {
    const obj: { [key: number]: number } = {};
    for (let i = 0; i < cards.length; i++) {
        if (obj[cards[i]]) {
            obj[cards[i]] += 1;
        } else {
            obj[cards[i]] = 1;
        }
    }
    const ret: { [key: number]: number } = {};
    for (let key in obj) {
        if (ret[obj[key]]) {
            ret[obj[key]] += 1;
        } else {
            ret[obj[key]] = 1;
        }
    }
    return ret;
};

/**获取牌的花色
 * 黑>红>梅>方
 */
export function getPokerFlowerColor(poker: number) {
    if (poker == 52 || poker == 53) {//大小王
        return 0;
    } else if (poker >= 39 && poker <= 51) {//方块
        return 1;
    } else if (poker >= 26 && poker <= 38) {//梅花
        return 2;
    } else if (poker >= 13 && poker <= 25) {//红桃
        return 3;
    } else {//黑桃
        return 4;
    }
}

/**
 * 给牌型结果集排序 逆序 大=>小
 * @param cards 0-52
 */
export function sortResult(cards: number[][]) {
    cards.sort((a, b) => {
        const a_cardType = getCardType(a);
        const b_cardType = getCardType(b);

        const ret = bipaiSole({ cardType: a_cardType, cards: a }, { cardType: b_cardType, cards: b });
        const winner = ret > 0 ? { cardType: a_cardType, cards: a } : { cardType: b_cardType, cards: b };
        if (winner.cards == a)
            return -1;
        return 1;
    });
}


/**
 * 从一副顺序牌中取一副豹子
 * @param poker
 */
export function getBZ(poker: number[]): number[] {
    // 随机一张牌
    const num: number = random(0, 13);
    const bz: number[] = findCards(poker, num).sort((a, b) => Math.random() - 0.5).slice(0, 3);

    if (bz.length === 3) {
        removeCardsFromPoker(poker, bz);
        return bz;
    } else {
        return getBZ(poker);
    }
}

/**
 * 从一副顺序牌中去一副同花顺
 * @param poker
 */
export function getTHS(poker: number[]): number[] {
    // 随机一个花色
    const color = random(0, 4);
    // 获取指定花色的牌
    const colorPoker: number[] = getSpecifiedPoker(poker, color);

    if (colorPoker.length < 3) {
        return getTHS(poker);
    }

    // 随机一个起始牌
    const index = random(0, colorPoker.length - 2);
    // 获取三张牌
    // 如果num是11且改位置的牌值的余数也为一 组合第一张牌 这种情况是QKA
    const ths: number[] = index === 11 && colorPoker[index] % 13 === 11 ?
        colorPoker.slice(index, index + 2).concat(colorPoker[0]) : colorPoker.slice(index, index + 3);
    // 判断该牌型是否是同花顺
    if (isTHS(ths)) {
        removeCardsFromPoker(poker, ths);
        return ths.sort((a, b) => Math.random() - 0.5);
    } else {
        return getTHS(poker);
    }
}

/**
 * 从一副顺序牌中去一副同花
 * @param poker
 */
export function getTH(poker: number[]): number[] {
    // 随机一个花色
    const color = random(0, 4);
    // 获取指定花色的牌
    const colorPoker: number[] = getSpecifiedPoker(poker, color);

    if (colorPoker.length < 3) {
        return getTH(poker);
    }

    // 随机获取三张牌
    let indexSet: Set<number> = new Set();
    while (indexSet.size < 3) {
        indexSet.add(random(0, colorPoker.length));
    }

    const th = [...indexSet].map(index => colorPoker[index]);

    // 判断是否是顺子
    if (checkShunzi(th)) {
        return getTH(poker);
    }

    removeCardsFromPoker(poker, th);
    return th.sort((a, b) => Math.random() - 0.5);
}

/**
 * 从一副顺序牌中取获取一副顺子
 */
export function getSZ(poker: number[]) {
    // 随机一个起始值
    const num: number = random(0, 11);
    let sz: number[] = [];

    // 找第一张牌
    let cardList: number[] = findCards(poker, num);
    if (cardList.length === 0) {
        return getSZ(poker);
    }
    // console.log('11111111111', cardList, num)
    sz.push(cardList[random(0, cardList.length)]);

    // 找第二张牌
    cardList = findCards(poker, num + 1);
    if (cardList.length === 0) {
        return getSZ(poker);
    }
    sz.push(cardList[random(0, cardList.length)]);

    // 找第三张牌
    cardList = num === 11 ? findCards(poker, 0) :
        findCards(poker, num + 2);
    if (cardList.length === 0) {
        return getSZ(poker);
    }
    sz.push(cardList[random(0, cardList.length)]);

    // 如果是同花顺重新随机
    if (isTHS(sz)) {
        return getSZ(poker);
    }

    removeCardsFromPoker(poker, sz);
    return sz.sort((a, b) => Math.random() - 0.5);
}

/**
 * 从一副顺序牌中取获取一副对子
 * @param poker
 */
export function getDZ(poker: number[]): number[] {
    // 随机一张牌
    const num: number = random(0, 13);
    const dz: number[] = findCards(poker, num).sort((a, b) => Math.random() - 0.5).slice(0, 2);

    if (dz.length === 2) {
        removeCardsFromPoker(poker, dz);
        let index: number = random(0, poker.length);
        let threeCard: number = poker[index];

        while (threeCard % 13 === dz[0] % 13) {
            index = random(0, poker.length);
            threeCard = poker[index];
        }

        poker.splice(index, 1);

        return dz.concat([threeCard]).sort((a, b) => Math.random() - 0.5);
    } else {
        return getDZ(poker);
    }
}

/**
 * 从一副顺序牌中取获取一副单牌
 * @param poker
 */
export function getS(poker: number[]) {
    let indexSet: Set<number> = new Set();

    while (indexSet.size < 3) {
        indexSet.add(random(0, poker.length));
    }

    let cards: number[] = [...indexSet].map(index => {
        return poker[index];
    });

    if (getCardType(cards) === 0) {
        removeCardsFromPoker(poker, cards);
        return cards;
    }

    return getS(poker);
}

/**
 * 获取指定花色的牌
 * @param poker
 * @param color
 */
function getSpecifiedPoker(poker: number[], color: number): number[] {
    // 0: 黑桃 1: 红桃 2: 梅花 3: 方块
    let dealPoker: any[];
    switch (color) {
        case 0:
            dealPoker = poker.map((p) => {
                if (p < 13) {
                    return p;
                }
            });
            break;
        case 1:
            dealPoker = poker.map((p) => {
                if (p > 12 && p < 26) {
                    return p;
                }
            });
            break;
        case 2:
            dealPoker = poker.map((p) => {
                if (p > 25 && p < 40) {
                    return p;
                }
            });
            break;
        case 3:
            dealPoker = poker.map((p) => {
                if (p > 39 && p < 52) {
                    return p;
                }
            });
            break;
        default:
            console.error('类型错误', color)
    }
    return dealPoker.filter(p => p !== undefined);
}

/**
 * 判断是否是同花顺
 * @param cards
 */
function isTHS(cards: number[]): boolean {
    const isSZ = checkShunzi(cards);
    if (!isSZ) return false;
    return isTH(cards);
}

/**
 * 判断是否是同花
 * @param cards
 */
function isTH(cards: number[]) {
    const tempH = Math.floor(cards[0] / 13);
    return cards.every(m => tempH === Math.floor(m / 13));
}

/**
 * 把牌从一副扑克中删除
 * @param poker
 * @param cards
 */
function removeCardsFromPoker(poker: number[], cards: number[]) {
    cards.forEach(b => {
        const index = poker.findIndex(p => p === b);
        poker.splice(index, 1);
    });
}

function findCards(poker: number[], card: number): number[] {
    return poker.map(p => {
        if (p % 13 === card + 1) {
            return p;
        }
    }).filter(p => p !== undefined);
}

/**Ai专用 */
export function getAi_type(cards: number[], cards_type: number) {
    /**倒叙 */
    let cards_clone = cards.map(c => getCardValue(c)).sort((c1, c2) => c2 - c1);
    if (cards_type == 0) {
        if (cards_clone[0] <= 11) {//散牌Q及以下牌型
            return 1;
        }
        if (cards_clone[0] <= 14) {//散牌K、A
            return 2;
        }
    } else if (cards_type == 1) {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];//2-J 小对子
        for (const c1 of arr) {
            if (cards_clone.filter(c => c == c1).length == 2) {
                return 3;
            }
        }
        let arr2 = [11, 12, 14];//QQ KK AA对子
        for (const c1 of arr2) {
            if (cards_clone.filter(c => c == c1).length == 2) {
                return 4;
            }
        }
    } else if (cards_type == 2) {
        if (cards_clone[0] <= 11) {//A23,234,345,456,567,678,789,8910,910J,TJQ
            return 4;
        } else {//JQK,QKA
            return 5;
        }
    } else if (cards_type == 3) {
        if (cards_clone[0] <= 10) {//金花235-金花7910
            return 5;
        } else {//金花J-金花A
            return 6;
        }
    } else if (cards_type == 4) {
        if (cards_clone[0] <= 10 || cards_clone.toString() == "14,2,1") {
            //顺金（A23、234、345、456、567、678、789、8910）
            return 7;
        } else {
            //顺金（910J、10JQ、JQK、QKA）
            return 8;
        }
    } else if (cards_type == 5) {
        if (cards_clone[0] <= 10) {
            //豹子（222，333，444，555，666，777，888，999，101010，）
            return 9;
        } else {
            //豹子（JJJ,QQQ,KKK,AAA）
            return 10;
        }
    }
}

//
// let s = 0;
// for (let i = 0; i < 10; i++) {
//     const poker = randomPoker();
//     const bz = getBZ(poker);
//
//     if (poker.length !== 52 - 3) {
//         console.log('233333333333::: bz')
//     }
//
//     const ths = getTHS(poker);
//
//     const th = getTH(poker);
//     const sz = getSZ(poker);
//     const dz = getDZ(poker);
//     const single = getS(poker);
//     const d = [...bz, ...ths, ...th, ...sz, ...dz, ...single];
//     const s = new Set(d);
//     // if (s.size !== d.length) {
//         console.log(poker.length)
//         console.log(judgeCards(bz))
//         console.log(judgeCards(ths))
//         console.log(judgeCards(th))
//         console.log(judgeCards(sz))
//         console.log(judgeCards(dz))
//         console.log(judgeCards(single))
//         // console.log('33333333333333333');
//     // }
//     // const tt_th = getTH(poker)
// //     const sz = getSZ(poker);
// //     const dz = getDZ(poker);
// //     const single = getS(poker);
// //
// //     // console.log('豹子', bz, judgeCards(bz))
// //     // console.log('同花顺', ths, judgeCards(ths))
// //     // console.log('同花', th, judgeCards(th))
// //     // console.log('顺子', sz, judgeCards(sz))
// //     // console.log('对子', dz, judgeCards(dz))
// //     // console.log('单牌', single, judgeCards(single))
// //     console.log(judgeCards(th))
// //     console.log(judgeCards(t_th))
// //     if (judgeCards(th).type === '顺金') {
// //         s++
// //         console.log('333333333333333 我日')
// //     }
// }
// console.log(s)