'use strict';
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

export const pukes = ["", '黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
    '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
    '梅A', '梅2', '梅3', '梅4', '梅5', '梅6', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K',
    '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
];
//
// 1 - 13 // 黑桃 1 - 13
// 14 - 26 // 红桃 1 - 13
// 27 - 39 // 梅花 1 - 13
// 40 - 52 // 方块 1 - 13
function perm(arr: number[], res: number[][]) {
    const fn = (source: number[], result: number[]) => {
        if (result.length === 3) {
            res.push(result);
        } else {
            for (let i = 0; i < source.length; i++) {
                fn(source.slice(i + 1), result.concat(source[i]));
            }
        }
    };
    fn(arr, []);
};

/**洗牌 */
export function shuffle() {
    const cards: number[] = [];
    for (let i = 1; i <= 52; i++) {// 52张牌
        cards.push(i);
    }
    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};

/**
 * 返回牌面值
 * @param card 0-53
 */
export function getCardValue(card: number) {
    // let CardValue = card % 13 == 0 ? 13 : card % 13;
    let CardValue = card % 13;
    return (CardValue <= 1) ? (CardValue + 13) : CardValue;
    // return CardValue;
};



/**
 * 获取牌型 A23最小，QJA最大
 * 豹子5 > 顺金4 > 金花3 > 顺子2 > 对子1 > 单张0
 */
export function getCardType(Thecards: number[]) {
    let cards = Thecards.map(c => c);
    const arr = cards.map(m => getCardValue(m));
    arr.sort((a, b) => a - b);
    // 是否顺子
    const isShunzi = checkShunzi(cards);
    // 是否同花
    const tempH = Math.floor((cards[0] - 1) / 13);
    const isTonghua = cards.every(m => tempH === Math.floor((m - 1) / 13));
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
        return CardsType.DOUBLE;
    }
    return CardsType.SINGLE;
};

/**
 * 获取牌型 返回最大的牌 和 牌的类型{cards: cards, type: type};
 * @param hold 
 * @param publicCards 
 */
export function getMaxCardtype(hold: number[], publicCards: number[]) {
    if (!hold) {
        return null;
    }
    let res: number[][] = [], type = -1, cards: number[] = null, typeSize = 0;
    perm(hold.concat(publicCards), res);
    for (let i = res.length - 1; i >= 0; i--) {
        const temp = getCardType(res[i]);
        const maxPoker = bipaiSoleEx([{ cards: res[i], cardType: temp }, { cards: cards, cardType: type }]);
        if (temp > type || (temp == type && maxPoker == true)) {
            type = temp;
            cards = res[i];
        }
    }
    return { cards: cards, cardType: type };
};
/**比牌
 * 最后一回合下注后，剩余玩家之间未主动进行比牌，系统翻开剩余玩家的手牌，进行比较，牌型大的获胜，牌型一样则平分奖金
*/
export function bipai(players: { cards: number[], cardType: number }[]) {
    players.sort((a, b) => b.cardType - a.cardType);
    // 一样的话比 大小
    const winner_list = players.filter(m => m.cardType === players[0].cardType);
    return winner_list;
};
/**比牌 两个人比 返回bool */
export function bipaiSoleEx(players: { cards: number[], cardType: number }[]) {
    let player1 = players[0];
    let player2 = players[1];
    let ret = bipaiSole([player1, player2]);
    if (ret == player1) return true;
    return false;
}
/**比牌 两个人比 */
export function bipaiSole(players: { cards: number[], cardType: number }[]) {
    players.sort((a, b) => b.cardType - a.cardType);
    // 一样的话比 大小
    const list = players.filter(m => m.cardType === players[0].cardType);
    if (list.length === 1) {//只得一个 最大类型 如果2个就需要后面的比较
        return players[0];
    }

    const cardType = players[0].cardType;
    const arr1 = players[0].cards.slice().sort((a, b) => {
        return getCardValue(b) - getCardValue(a)
    });
    const arr2 = players[1].cards.slice().sort((a, b) => {
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
                return players[0];
            } else if (cardNum1 < cardNum2) {
                return players[1];
            }
        }
        return players[1];

    } else if (cardType == CardsType.SHUN || cardType == CardsType.SHUN_Golden) {
        /**A23特殊牌型 拿出来 单独 比较 */
        if (arr1.map(c => getCardValue(c)).toString() == `14,3,2`) {
            return players[1];
        }
        if (arr2.map(c => getCardValue(c)).toString() == `14,3,2`) {
            return players[0];
        }
        if (getCardValue(arr1[0]) > getCardValue(arr2[0])) {
            return players[0];
        } else {
            return players[1];
        }
    } else if (cardType == CardsType.DOUBLE) {
        let yiduiPoker1 = specialPoker(cardType, arr1);
        let yiduiPoker2 = specialPoker(cardType, arr2);
        if (yiduiPoker1 > yiduiPoker2) {
            return players[0];
        } else if (yiduiPoker1 < yiduiPoker2) {
            return players[1];
        }
        let pokerSize1 = countPokerDot(arr1, yiduiPoker1);
        let pokerSize2 = countPokerDot(arr2, yiduiPoker2);
        if (pokerSize1 > pokerSize2) {
            return players[0];
        } else if (pokerSize1 < pokerSize2) {
            return players[1];
        }
        return players[1];
    }
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
/**找出特殊牌的牌 返回对子的 对子大小
 * 面值
  */
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
/**是否顺子 
 * 面值
*/
function checkShunzi(Thecards: number[]) {
    let cards = Thecards.map(c => getCardValue(c));
    cards.sort((a, b) => {
        return a - b;
    });
    /**A23特殊顺子提出来 */
    if (cards.toString() == [2, 3, 14].toString()) {
        return true;
    }

    for (let i = 0; i < cards.length - 1; i++) {
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