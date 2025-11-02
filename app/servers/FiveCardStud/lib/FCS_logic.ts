import FCSRoom from "./FCSRoom";
import * as utils from "../../../utils";
import { clone, head } from "ramda";
import { random } from "../../../utils";

/**牌型 */
enum CardsType {
    /**高牌0 */
    gaopai = 0,
    /**一对1 */
    dui1,
    /**两对2 */
    twodui,
    /**三条3  */
    santiao,
    /**顺子4 */
    shunzi,
    /** 同花5 */
    tonghua,
    /**葫芦6 */
    hulu,
    /**4条7  */
    tiezhi,
    /**同花顺8 */
    tonghuashun
}

export const pukes = ["", '黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
    '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
    '梅A', '梅2', '梅3', '梅4', '梅5', '梅6', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K',
    '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
];

export function getPai() {
    const cards: number[] = [
        1, 8, 9, 10, 11, 12, 13,
        14, 21, 22, 23, 24, 25, 26,
        27, 34, 35, 36, 37, 38, 39,
        40, 47, 48, 49, 50, 51, 52,
    ];
    cards.sort(() => 0.5 - Math.random());
    return cards;
};
/**
 * 返回牌面值
 * @param card 0-53
 */
export function GetGrad(card: number) {
    let CardValue = card % 13;
    return (CardValue <= 1) ? (CardValue + 13) : CardValue;
};

/**获取牌的花色
 * 黑桃>红桃>梅花>方块。
 */
export function GetColour(poker: number) {
    if (poker == 53 || poker == 54) {//大小王
        return 0;
    } else if (poker >= 40 && poker <= 52) {//方块
        return 1;
    } else if (poker >= 27 && poker <= 39) {//梅花
        return 2;
    } else if (poker >= 14 && poker <= 26) {//红桃
        return 3;
    } else {//黑桃
        return 4;
    }
}

/**根据轮数 获取应该发牌张数
 * @Flop—同时发三张公牌
 * @Turn—发第4张牌
 * @River—发第五张牌
 */
export function getPaiCount(round: number) {
    const ROUND_COUNT = [3, 1, 1];
    return ROUND_COUNT[round] || ROUND_COUNT[0];
};


/**cards
 *  判断五张牌是什么牌 
 * 0高牌|1对子|2两队|3三条|4顺子|5同花|6葫芦|7四条|8同花顺|9皇家同花顺
 * */
export function GetCardType(cards: number[]) {
    const arr = cards.map(m => GetGrad(m));
    arr.sort((a, b) => a - b);
    // 是否顺子
    const isShunzi = cards.length >= 4 && checkShunzi(arr);
    // 是否同花
    const tempH = GetColour(cards[0]);
    const isTonghua = cards.length >= 4 && cards.every(m => tempH === GetColour(m));
    // 相同的个数
    const alikeCount = utils.checkAlike(arr);

    // 如果是顺子又是同花 --- 同花顺
    if (isShunzi && isTonghua) {
        return CardsType.tonghuashun;
    }
    // --- 四条（炸弹）
    if (alikeCount.find(c => c.count == 4)) {
        return CardsType.tiezhi;
    }
    // --- 葫芦
    if (alikeCount.find(c => c.count == 3) && alikeCount.find(c => c.count == 2)) {
        return CardsType.hulu;
    }
    // --- 同花
    if (isTonghua) {
        return CardsType.tonghua;
    }
    // --- 顺子
    if (isShunzi) {
        return CardsType.shunzi;
    }
    // --- 三条
    if (alikeCount.find(c => c.count == 3)) {
        return CardsType.santiao;
    }
    // --- 两对
    if (alikeCount.filter(c => c.count == 2).length == 2) {
        return CardsType.twodui;
    }
    // --- 一对
    if (alikeCount.filter(c => c.count == 2).length == 1) {
        return CardsType.dui1;
    }
    return CardsType.gaopai;
}

/**是否顺子 
 * A  10 J Q K 顺子
 * @param 面值
*/
function checkShunzi(cards: number[]) {
    if (cards.toString() == "8,9,10,11,14") return true;
    for (let i = 0; i < cards.length - 1; i++) {
        if (cards[i] + 1 !== cards[i + 1]) {
            return false;
        }
    }
    return true;
};



/**计算梭哈牌的大小 */
export function sortPokerToType(pokers: number[]) {
    const theCards = pokers.map(c => c);
    theCards.sort((a, b) => GetGrad(b) - GetGrad(a));

    let cradType = GetCardType(theCards);
    let arrs: string[] = [];

    let arr = theCards.map(m => GetGrad(m));
    if (cradType == CardsType.shunzi) {
        if (arr.toString() == "14,11,10,9,8") {
            //注：A8910J是最小的顺子，此处A可以看作7！
            arr = [11, 10, 9, 8, 7];
        }
    }
    const alikeCounts = utils.checkAlike(arr);
    alikeCounts.sort((a, b) => b.count - a.count);
    // console.warn(cradType, alikeCounts);
    for (const alikeCount of alikeCounts) {
        for (const ccc of alikeCount.Subscript) {
            let str = (arr[ccc]) + '';
            if (str.length == 1) {
                str = '0' + (arr[ccc]);
            }
            arrs.push(str);
        }
    }
    for (const c of theCards) {
        let str = GetColour(c) + '';
        arrs.push(str);
    }
    let num = 1 * cradType + '' + arrs.join('');
    let ret = parseInt(num);
    // console.warn(num, ret);
    return ret;
}

/**4张牌的时候，补一张来 判断是否 最大，鬼知道为什么 是这样的设定 */
export function maybe_sortPokerToType(TheCards: number[], pokers: number[]) {
    let typeSize = -1;
    for (const c of TheCards) {
        const cards_temp = pokers.map(c => c);
        cards_temp.push(c);
        const _typeSize = sortPokerToType(cards_temp);
        if (_typeSize > typeSize) {
            typeSize = _typeSize;
        }
    }
    return typeSize;
}


//计算2张牌的时候 ai专用牌型
export function getAiHoldsType(holds: number[]) {
    const Y1_Y6 = [
        {
            type: "Y1",
            Arr: ["AA", "KK"],
        },
        {
            type: "Y2",
            Arr: ["AKs", "AKo", "QQ"],
        },
        {
            type: "Y3",
            Arr: ["JJ", "TT", "99", "88"],
        },
        {
            type: "Y4",
            Arr: ["AQs", "AQo", "AJs", "AJo", "ATs", "ATo"],
        },
        {
            type: "Y5",
            Arr: ["KQs", "KQo", "A9s", "A9o", "A8s", "A8o"],
        },
    ]
    let arr = ['', "", '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let temp = holds.map(c => GetGrad(c));
    temp.sort((a, b) => b - a);
    let istonghua = GetColour(holds[0]) == GetColour(holds[1]);

    for (const c of Y1_Y6) {
        for (const cc of c.Arr) {
            if (cc.length == 3) {
                let c1 = cc.substring(0, 2);
                let c2 = cc.substring(2, 3);
                let c3 = `${arr[temp[0]]}${arr[temp[1]]}`;
                if (c1 == c3 && c2 == "s" && istonghua) {
                    return c.type;
                }
                if (c1 == c3 && c2 == "o" && !istonghua) {
                    return c.type;
                }
            } else if (cc.length == 2) {
                let c1 = cc.substring(0, 2);
                let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
                if (c1 == c2) {
                    return c.type;
                }
            }
        }
    }
    return "Y6";
}


/**
 * 获取玩家的调控调控牌型
 * @param len
 * @param controlPlayersNumber
 * @param cards
 */
export function getControlCards(len: number, controlPlayersNumber: number, cards: number[]) {
    cards = clone(cards);
    const headCards = [];

    for (let i = 0; i < controlPlayersNumber; i++) {
        headCards.push(getY1ToY3Cards(cards));
    }

    headCards.forEach(c => {
        for (let i = 0; i < 3; i++)
            c.push(cards.splice(random(0, cards.length - 1), 1)[0]);
    });

    sortHandCards(headCards);
    const typeSize = sortPokerToType(headCards[headCards.length - 1]);
    const type = GetCardType(headCards[headCards.length - 1]);
    for (let i = 0, l = len - controlPlayersNumber; i < l; i++) {
        headCards.push(minHandCards(cards, typeSize, type));
    }

    return headCards;
}

/**
 * 给牌值排序
 * @param list
 */
export function sortHandCards(list: number[][]) {
    return list.sort((x, y) => sortPokerToType(clone(y)) - sortPokerToType(clone(x)));
}

function minHandCards(cards: number[], typeSize: number, type: number) {
    let c = [];

    for (let i = 0; i < 5; i++) {
        c.push(cards.splice(random(0, cards.length - 1), 1)[0]);
    }


    if (sortPokerToType(c) <= typeSize || type === GetCardType(c)) {
        return c;
    }

    return minHandCards(cards, typeSize, type);
}

/**
 * 获取y1到y3的头两张牌
 * @param cards
 */
function getY1ToY3Cards(cards: number[]) {
    const p = [];

    for (let i = 0; i < 2; i++) {
        p.push(cards.splice(random(0, cards.length - 1), 1)[0]);
    }

    const type = getAiHoldsType(p);
    if (type === 'Y1' || type === 'Y2' || type === 'Y3') {
        return p;
    }

    p.forEach(c => cards.push(c));
    return getY1ToY3Cards(cards);
}
