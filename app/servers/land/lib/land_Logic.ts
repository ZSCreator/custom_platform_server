// 0 1 2 3 4 5 6 7 8 9 10 11 12 黑
// A 2 3 4 5 6 7 8 9 10 J Q  K
// 13 14 15 16 17 18 19 20 21 22 23 24 25 红桃
// A  2  3  4  5  6  7  8  9  10  J Q  K
// 26 27 28 29 30 31 32 33 34 35 36 37 38 梅花
// A  2  3  4  5  6  7  8  9  10 J  Q  K
// 39 40 41 42 43 44 45 46 47 48 49 50 51 方块
// A  2  3  4  5  6  7  8  9  10 J  Q  K
// 52  53
// 小王 大王


/**牌型模板 */
const g_theCards = [
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, //方块 A - K
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, //梅花 A - K
    0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, //红桃 A - K
    0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, //黑桃 A - K
    0x4E, 0x4F,
];

const MASK_COLOR = 0xF0;//花色掩码
const MASK_VALUE = 0x0F;//面值掩码
'use strict';

//https://gitee.com/cronlygames/DouDiZhu 参考1
/**以下为牌的面值，从3开始 */
export enum enum_Value {
    /**表示最小的面值 */
    ValueLeast = 2,
    Value3 = 3,
    Value4 = 4,
    Value5 = 5,
    Value6 = 6,
    Value7 = 7,
    Value8 = 8,
    Value9 = 9,
    /**Ten=10 */
    ValueT = 10,
    ValueJ = 11,
    ValueQ = 12,
    ValueK = 13,
    ValueA = 14,
    Value2 = 15,
    /**小王 */
    ValueJoker1 = 16,
    /**大王 */
    ValueJoker2 = 17,
}
/**斗地主牌型 */
export enum CardsType {
    /**错误类型 */
    CARD_TYPE_ERROR = 0,
    /**不出类型 */
    CHECK_CALL = 1,
    /**单张 */
    Single,
    /**顺子 */
    SHUN,
    /**对子 */
    DOUBLE,
    /**连对*/
    CONTINUOUSLY_PAIR,
    /**三张不带 */
    THREE,
    /**三带一 */
    THREE_ONE,
    /**三带二 */
    THREE_TWO,
    /**4个带二 */
    FOUR_TWO,
    /**飞机 333444 5 6 */
    AIRCRAFT,
    /**4个		硬炸弹 */
    BOOM,
    /**王炸类型 */
    BIG_BOOM = 12,
};

/**洗牌，发牌
 * @returns 0-53 []
 */
export function genereteCard() {
    //创建棋牌数组
    let cards = g_theCards.map(card => card);
    cards.sort(() => 0.5 - Math.random());
    return cards;
}
/**清理发出的棋牌 */
export function delCardList(cardList: number[], removeList: number[]) {
    for (let i = 0; i < removeList.length; i++) {
        for (let j = 0; j < cardList.length; j++) {
            if (cardList[j] == removeList[i]) {
                cardList.splice(j, 1);
                j = j - 1;
                break;
            }
        }
    }
    return cardList;
};
/**
 * 排序
 * @param subCardList 1-54
 */
export function sort_CardList(subCardList: number[]) {
    let lastCardList = subCardList.sort((a, b) => getCardValue(b) - getCardValue(a));
    return lastCardList;
};

/**
 * 返回牌面值
 * @param card 0-53
 */
export function getCardValue(card: number) {
    if (!g_theCards.includes(card)) {
        return 0;
    }
    /**面值 */
    const CardValue = card & MASK_VALUE;
    /**花色 */
    const cbCardColor = card & MASK_COLOR;
    if (cbCardColor == 0x40) {
        return CardValue + 2;
    }
    return (CardValue <= 2) ? (CardValue + 13) : CardValue;
};

/**
 * 返回牌 前端展示值
 * @param card 0-53
 */
export function getZhanshi(card: number) {
    let yanse = ["方块", "梅花", "红桃", "黑桃"];
    let puke = ["", "", "", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2", "小王", "大王"];
    /**面值 */
    const CardValue = card & MASK_VALUE;
    /**花色 */
    const cbCardColor = card & MASK_COLOR;
    if (cbCardColor == 0x40) {
        return puke[CardValue + 2];
    }
    let ret = 0;
    switch (cbCardColor) {
        case 0:
            ret = 0;
            break;
        case 16:
            ret = 1;
            break;
        case 32:
            ret = 2;
            break;
        case 48:
            ret = 3;
            break;
        default:
            break;
    }
    return `${yanse[ret]}${puke[(CardValue <= 2) ? (CardValue + 13) : CardValue]}`;
};

/**是否有效的出牌牌组
 * @param 1-54
 */
export function has_valid(theCards: number[]) {
    //不是数组直接返回
    if (!Array.isArray(theCards)) {
        return 0;
    }
    return GetCardType(theCards);
}
/**
 * 比牌 判断是否可以出牌
 * @param theCards 当前牌
 * @param perCards 上一手牌
 */
export function isOverPre(theCards: number[], perCards: number[]) {
    if (perCards.length == 0) {
        return true;
    }
    let current_type = GetCardType(theCards);
    let last_type = GetCardType(perCards);
    if (current_type == CardsType.BIG_BOOM) {
        return true;
    }
    if (current_type == CardsType.BOOM && current_type > last_type) {
        return true;
    }
    if (current_type === last_type) {
        if (theCards.length != perCards.length) {
            return false;
        }
        let arr_1 = theCards.map(m => getCardValue(m)).sort((a, b) => a - b);
        let arr_2 = perCards.map(m => getCardValue(m)).sort((a, b) => a - b);

        switch (current_type) {
            case CardsType.Single:
                if (arr_1[0] > arr_2[0]) {
                    return true;
                }
                break;
            case CardsType.SHUN:
                if (arr_1[0] > arr_2[0]) {
                    return true;
                }
                break;
            case CardsType.DOUBLE:
                if (arr_1[0] > arr_2[0]) {
                    return true;
                }
                break;
            case CardsType.CONTINUOUSLY_PAIR:
                if (arr_1[0] > arr_2[0]) {
                    return true;
                }
                break;
            case CardsType.THREE:
                if (arr_1[0] > arr_2[0]) {
                    return true;
                }
                break;
            case CardsType.THREE_ONE:
                let current_card = (arr_1[0] == arr_1[1]) ? arr_1[0] : arr_1[3];
                let last_card = (arr_2[0] == arr_2[1]) ? arr_2[0] : arr_2[3];
                if (current_card > last_card) {
                    return true;
                }
                break;
            case CardsType.THREE_TWO:
                {
                    let current_card = (arr_1[0] == arr_1[1] && arr_1[1] == arr_1[2]) ? arr_1[0] : arr_1[4];
                    let last_card = (arr_2[0] == arr_2[1] && arr_2[1] == arr_2[2]) ? arr_2[0] : arr_2[4];
                    if (current_card > last_card) {
                        return true;
                    }
                }
                break;
            case CardsType.FOUR_TWO:
                {
                    let current_card = (arr_1[0] == arr_1[1] && arr_1[1] == arr_1[2]) ? arr_1[0] : arr_1[4];
                    let last_card = (arr_2[0] == arr_2[1] && arr_2[1] == arr_2[2]) ? arr_2[0] : arr_2[4];
                    if (current_card > last_card) {
                        return true;
                    }
                }
                break;
            case CardsType.AIRCRAFT:
                {
                    // 找出三个的数
                    let currentSet: Set<number> = new Set();
                    let lastSet: Set<number> = new Set();
                    arr_1.forEach(c => {
                        if (currentSet.has(c) && arr_1.filter(ca => ca === c).length === 3) {
                            currentSet.add(c);
                        }
                    });
                    arr_2.forEach(c => {
                        if (lastSet.has(c) && arr_2.filter(ca => ca === c).length === 3) {
                            lastSet.add(c);
                        }
                    });
                    if (currentSet[0] > lastSet[0]) {
                        return true;
                    }
                }
                break;
            case CardsType.BOOM:
                if (arr_1[0] > arr_2[0]) {
                    return true;
                }
                break;
            default:
                break;
        }
    }
    return false;
}

/**
 * 获取牌的类型
 * @param theCards 1-54
 */
export function GetCardType(theCards: number[]) {
    theCards.sort((a, b) => getCardValue(a) - getCardValue(b));//正序
    switch (theCards.length) {
        case 0:
            return CardsType.CHECK_CALL;
            break;
        case 1:
            return CardsType.Single;
            break;
        case 2:
            if (cards_type.checkBigBoom(theCards) == true) {
                return CardsType.BIG_BOOM;
            }
            if (cards_type.checkDouble(theCards) == true) {
                return CardsType.DOUBLE;
            }
            break;
        case 3:
            if (cards_type.checkThree(theCards) == true) {
                return CardsType.THREE;
            }
            break;
        case 4:
            // {
            if (cards_type.checkThreeOne(theCards) == true) {
                return CardsType.THREE_ONE;
            }
            if (cards_type.checkBoom(theCards) == true) {
                return CardsType.BOOM;
            }
            // }
            break;
        case 5://单顺 三带二
            // {
            if (cards_type.checkShun(theCards) == true) {
                return CardsType.SHUN;
            }
            if (cards_type.checkThreeTwo(theCards) == true) {
                return CardsType.THREE_TWO;
            }
            // }
            break;
        case 6:
            if (cards_type.checkShun(theCards) == true) {
                return CardsType.SHUN;
            }
            if (cards_type.checkContinuouslyPair(theCards) == true) {
                return CardsType.CONTINUOUSLY_PAIR;
            }
            if (cards_type.checkFourTwo(theCards) == true) {
                return CardsType.FOUR_TWO;
            }
            break;
        case 8:
            if (cards_type.checkShun(theCards) == true) {
                return CardsType.SHUN;
            }
            if (cards_type.checkContinuouslyPair(theCards) == true) {
                return CardsType.CONTINUOUSLY_PAIR;
            }
            //飞机带翅膀(8+) 333444+67(单)
            if (isFeiJiDai(theCards).res) {
                return CardsType.AIRCRAFT;
            }
            if (cards_type.checkFourTwo(theCards) == true) {
                return CardsType.FOUR_TWO;
            }
            break;
        default:
            if (cards_type.checkShun(theCards) == true) {
                return CardsType.SHUN;
            }
            if (cards_type.checkContinuouslyPair(theCards) == true) {
                return CardsType.CONTINUOUSLY_PAIR;
            }
            //飞机带翅膀(8+) 333444+67(单)
            if (isFeiJiDai(theCards).res) {
                return CardsType.AIRCRAFT;
            }
            break;
    }
    return CardsType.CARD_TYPE_ERROR;
}

/**
 * 是否是双顺子(6,8,10）334455 连对
 * @param postlist 1-54
 */
export function isTWOShun(theCards: number[]) {
    let arr_ = theCards.map(m => getCardValue(m));
    if (arr_[arr_.length - 1] > 15) {
        return 0
    }
    for (let idx = 0; idx < arr_.length - 1; idx++) {
        if (idx % 2 != 0) {//1 3 5
            if (arr_[idx] != arr_[idx + 1] - 1) {
                return 0;
            }
        } else { // 0 2 4
            if (arr_[idx] != arr_[idx + 1]) {
                return 0;
            }
        }
    }
    return arr_[arr_.length - 1];
}
/**
 * 是否是三顺(6,9,12) 33344456 飞机
 * @param postlist 1-54
 */
export function isThreeShun(theCards: number[]) {
    let arr_ = theCards.map(m => getCardValue(m));
    // let arr_ = theCards.map(m => getCardValue(m));
    if (arr_[arr_.length - 1] > 15) {
        return 0
    }
    let ret1 = arr_[0] == arr_[1] && arr_[0] == arr_[2] && (arr_[0] + 1) == arr_[3];
    let ret2 = arr_[3] == arr_[4] && arr_[3] == arr_[5];
    if (arr_[0] != 15 || arr_[3] != 15) {
        return 0;
    }
    if (ret1 && ret2) {
        return arr_[0];
    }
    return 0;
}

/**
 * 飞机带翅膀(8+) 333444+67(单)
 * 333444+
 * 333444+6677
 * @param theCards 1-54
 */
function isFeiJiDai(theCards: number[]) {
    let TherrSet: Set<number> = new Set();
    let TwoSet: Set<number> = new Set();
    let OneSet: Set<number> = new Set();
    let arr_1 = theCards.map(m => getCardValue(m)).sort((a, b) => a - b);
    for (const c of arr_1) {
        if (!TherrSet.has(c) && arr_1.filter(ca => ca === c).length == 3) {
            TherrSet.add(c);
        }
        if (!TwoSet.has(c) && arr_1.filter(ca => ca === c).length == 2) {
            TwoSet.add(c);
        }
        if (!OneSet.has(c) && arr_1.filter(ca => ca === c).length == 1) {
            OneSet.add(c);
        }
    }
    let result = { res: false, card_min: 0 };
    if (TherrSet.size >= 2 &&
        (TwoSet.size == 0 || OneSet.size == 0) &&
        TherrSet.size == TwoSet.size + OneSet.size) {
        result.res = true;
        result.card_min = [...TherrSet][0];
    }

    return result;
}

/**检查相同的 传入面值
 * {4:1,1:1} 1组4个相同,1个 单张
 */
export function checkAlike(cards: number[]) {
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
/***
 * 找出匹配的顺子组合
 * @param thecards 1-54
 * @param last_pkg 上家出牌
 */
export function findMaxLenOfShunZi(theCards: number[], last_pkg: number[] = [0]) {
    let cardsTables: { type: number, cards: number[] }[] = [];
    let last_pkg_ = getCardValue(last_pkg[0])
    let shunZi: number[] = [];

    for (let i = 0; i < theCards.length; i++) {
        let value1 = getCardValue(theCards[i]);
        if (last_pkg_ >= value1 || value1 >= enum_Value.Value2)
            continue;
        shunZi.push(theCards[i]);
        for (let j = i + 1; j < theCards.length; j++) {
            let value2 = getCardValue(theCards[j]);
            if (value2 >= enum_Value.Value2) {
                break;
            }
            if (value1 + 1 == value2) {
                value1 = value2;
                shunZi.push(theCards[j]);
            } else if (value1 == value2) {
            } else {
                break;
            }
            if (last_pkg.length != 0 && last_pkg.length == shunZi.length) {
                break;
            }
        }
        if (shunZi.length >= 5) {
            cardsTables.push({ type: CardsType.SHUN, cards: shunZi });
        }
        shunZi = [];
    }
    return cardsTables;
}

/**找出匹配的炸弹组合 */
export function findMaxLenOfBoom(theCards: number[], same: number, last_pkg: number[] = []) {
    let cardsTables: { type: number, cards: number[] }[] = [];
    let last_pkg_ = last_pkg.length == 0 ? 0 : getCardValue(last_pkg[0]);

    for (let i = 0; i < theCards.length; i++) {
        let Boom: number[] = [];
        let value1 = getCardValue(theCards[i]);
        if (last_pkg_ >= value1 || value1 >= 16)
            continue;
        Boom.push(theCards[i]);
        for (let j = i + 1; j < theCards.length; j++) {
            let value2 = getCardValue(theCards[j]);
            if (value2 != value1 && value1 > last_pkg_)
                break;
            Boom.push(theCards[j]);
            if (Boom.length >= same) {
                (same == 2) && cardsTables.push({ type: CardsType.DOUBLE, cards: Boom });
                (same == 3) && cardsTables.push({ type: CardsType.THREE, cards: Boom });
                (same == 4) && cardsTables.push({ type: CardsType.BOOM, cards: Boom });
                break;
            }
        }
    }
    return cardsTables;
}
/**
 * 找出连队 组合
 * @param thecards 1-54
 * @param last_pkg 
 */
export function findMaxLenOfTwoShun(thecards: number[], last_pkg: number[] = []) {
    let cards = thecards.map(m => m);
    let cardsTables: { type: number, cards: number[] }[] = [];

    let last_pkg_ = last_pkg.length == 0 ? 0 : getCardValue(last_pkg[0]);
    let last_pkg_len = last_pkg.length >= 6 ? last_pkg.length : 6;

    let fillCards: number[] = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }

    let start_ = last_pkg_ == 0 ? enum_Value.Value3 : last_pkg_;
    for (let i = start_; i <= enum_Value.ValueA - 1; i++) {
        if (fillCards[i] < 2) {
            continue;
        }
        let shunZi: number[] = [];
        shunZi.push(...[i, i]);
        for (let j = i + 1; j < enum_Value.ValueA; j++) {
            if (fillCards[j] >= 2) {
                shunZi.push(...[j, j]);
            } else {
                break;
            }
        }
        if (shunZi.length >= last_pkg_len) {
            let result: number[] = [];
            for (const shunZi__ of shunZi) {
                for (let i = 0; i < cards.length; i++) {
                    if (shunZi__ == getCardValue(cards[i])) {
                        result.push(cards[i]);
                        cards.splice(i, 1);
                        fillCards[shunZi__]--;
                        break;
                    }
                }
            }
            cardsTables.push({ type: CardsType.CONTINUOUSLY_PAIR, cards: result })
        }
    }
    return cardsTables;
}

/**
 * 找出匹配的 3带1 组合
 * @param theCards 
 * @param last_pkg 
 */
export function findMaxLenOfThreeOne(thecards: number[], last_pkg: number[]) {
    let cards = thecards.map(m => m);
    let cardsTables: { type: number, cards: number[] }[] = [];

    let fillCards: number[] = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }
    /**three */
    let last_pkg_ = getCardValue(last_pkg[1]);
    if (getCardValue(last_pkg[0]) == getCardValue(last_pkg[1]) && getCardValue(last_pkg[1]) != 0) {
        last_pkg_ = getCardValue(last_pkg[0]);
    }


    let start_ = last_pkg_ == 0 ? enum_Value.Value3 : last_pkg_;
    for (let i = start_; i <= enum_Value.Value2; i++) {
        let ret: number[] = [];
        if (fillCards[i] >= 3) {
            ret.push(...[i, i, i]);
            for (let j = start_; j <= enum_Value.Value2; j++) {
                if (fillCards[j] <= 2 && fillCards[j] > 0) {
                    ret.push(...[j]);
                    break;
                }
            }
            if (ret.length == 4) {
                let ret2: number[] = [];
                for (const shunZi__ of ret) {
                    for (let i = 0; i < cards.length; i++) {
                        if (shunZi__ == getCardValue(cards[i])) {
                            ret2.push(cards[i]);
                            cards.splice(i, 1);
                            break;
                        }
                    }
                }
                cardsTables.push({ type: CardsType.THREE_ONE, cards: ret2 })
            }
        }
    }
    return cardsTables;
}

/**
 * 4带2
 * @param theCards 
 * @param last_pkg 
 */
export function findMaxLenOfFOUR_TWO(thecards: number[], last_pkg: number[] = []) {
    let cards = thecards.map(m => m);
    let cardsTables: { type: number, cards: number[] }[] = [];

    let fillCards: number[] = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }
    /**four */
    let last_pkg_ = 0;
    if (last_pkg.length > 0) {
        if (getCardValue(last_pkg[0]) == getCardValue(last_pkg[1]) && getCardValue(last_pkg[1]) != 0) {
            last_pkg_ = getCardValue(last_pkg[0]);
        }
    }

    let start_ = last_pkg_ == 0 ? enum_Value.Value3 : last_pkg_;
    for (let i = start_; i <= enum_Value.Value2; i++) {
        let ret: number[] = [];
        if (fillCards[i] == 4) {
            ret.push(...[i, i, i, i]);
            for (let j = start_; j <= enum_Value.Value2; j++) {
                if (fillCards[j] == 2) {
                    ret.push(...[j, j]);
                    break;
                }
                if (fillCards[j] == 1) {
                    ret.push(...[j]);
                    break;
                }
            }
            if (ret.length == 6) {
                let ret2: number[] = [];
                for (const shunZi__ of ret) {
                    for (let i = 0; i < cards.length; i++) {
                        if (shunZi__ == getCardValue(cards[i])) {
                            ret2.push(cards[i]);
                            cards.splice(i, 1);
                            break;
                        }
                    }
                }
                cardsTables.push({ type: CardsType.FOUR_TWO, cards: ret2 })
            }
        }
    }
    return cardsTables;
}

/**
 * 飞机带翅膀(8+) 333444+67(单)
 * @param theCard 1-54
 * @param last_pkg  1-54
 */
export function findFeijiDai(thecards: number[], last_pkg: number[] = []) {
    let cards = thecards.map(m => m);
    let cardsTables: { type: number, cards: number[] }[] = [];
    if (cards.length < 8) return cardsTables;
    let fillCards: number[] = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }
    for (let i = enum_Value.Value3; i < enum_Value.ValueK; i++) {
        if (fillCards[i] >= 3 && fillCards[i + 1] >= 3) {
            let shunzi: number[] = [];
            shunzi.push(...[i, i, i, i + 1, i + 1, i + 1]);
            for (let k = enum_Value.Value3; k < enum_Value.ValueA; k++) {
                if (fillCards[k] == 1) {
                    shunzi.push(...[k]);
                }
                if (fillCards[k] == 2) {
                    shunzi.push(...[k, k]);
                }
                if (shunzi.length % 4 == 0 && shunzi.length >= 8) {
                    let ret: number[] = [];
                    for (const shunZi__ of shunzi) {
                        for (let i = 0; i < cards.length; i++) {
                            if (shunZi__ == getCardValue(cards[i])) {
                                ret.push(cards[i]);
                                cards.splice(i, 1);
                                break;
                            }
                        }
                    }
                    // if (isOverPre(ret, last_pkg) == true)
                    // cardsTables.push({ type: CardsType.FOUR_TWO, cards: ret })
                    break;
                }
            }
        }
    }
    return cardsTables;
}

/**删除 */
function DelCardsTables(Cards: number[], boom_arr: { type: number, cards: number[] }[]) {
    for (const arr of boom_arr) {
        Cards = delCardList(Cards, arr.cards);
    }
    return Cards;
}

/**拆牌算法
 * @param theCards 1-54
 * @param last_pkg 1-54
 */
export function chaipai(theCards: number[], last_pkg: number[]) {
    let res: { type: number, cards: number[] }[] = [];
    do {
        res = chaipai_1(theCards, []);
        if (last_pkg.length == 0) break;
        let cardsTables = res.filter(m => isOverPre(m.cards, last_pkg) && GetCardType(m.cards) == GetCardType(last_pkg));


        res = chaipai_2(theCards, last_pkg);
        res.unshift(...cardsTables);
        break;
    } while (true);
    return res;
}

/**
 * 拆牌算法v1.0 主动
 * @param theCards 1-54
 * @param last_pkg 1-54
 */
export function chaipai_1(theCards: number[], last_pkg: number[]) {
    let Cards = theCards.slice().sort((a, b) => getCardValue(a) - getCardValue(b));
    let cardsTables: { type: number, cards: number[] }[] = [];

    if (GetCardType(Cards) >= 2) {
        cardsTables.push({ type: GetCardType(Cards), cards: Cards });
        return cardsTables;
    }
    /**如果有火箭，找出来； */
    if (Cards.includes(78) && Cards.includes(79)) {
        cardsTables.push({ type: CardsType.BIG_BOOM, cards: [78, 79] });
        Cards = delCardList(Cards, [78, 79]);
    }
    /**如果有炸弹，找出来（炸弹不拆） */
    let boom_arr = findMaxLenOfBoom(Cards, 4);
    cardsTables.push(...boom_arr);
    DelCardsTables(Cards, boom_arr);
    /**连队 */
    // let TwoShun_arr = findMaxLenOfTwoShun(Cards);
    // cardsTables.push(...TwoShun_arr);
    // DelCardsTables(Cards, TwoShun_arr);
    /**找出所有的顺子，每个顺子尽量长 */
    let shun_arr = findMaxLenOfShunZi(Cards);
    cardsTables.push(...shun_arr);
    DelCardsTables(Cards, shun_arr);
    /**找出所有3个 */
    let three_arr = findMaxLenOfBoom(Cards, 3);
    DelCardsTables(Cards, three_arr);
    /**找出所有2个 */
    let two_arr = findMaxLenOfBoom(Cards, 2);
    DelCardsTables(Cards, two_arr);
    /**找出所有非 小王 大王 单张 单张 */
    let single_arr: { type: number, cards: number[] }[] = [];
    for (const V1 of Cards) {
        if (V1 == 0x4E || V1 == 0x4F) {
            continue;
        }
        single_arr.push({ cards: [V1], type: CardsType.Single });
    }
    DelCardsTables(Cards, single_arr);
    /**3带2 组合 */
    for (const V1 of three_arr) {
        for (const V2 of two_arr) {
            let cardsTable: { type: number, cards: number[] } = { type: null, cards: [] };
            let card1 = three_arr.shift().cards;
            let card2 = two_arr.shift().cards;
            cardsTable.cards.push(...card1);
            cardsTable.cards.push(...card2);
            cardsTable.type = CardsType.THREE_TWO;
            cardsTables.push(cardsTable);
            break;
        }
    }
    /**3带1 组合 */
    for (const V1 of three_arr) {
        for (const V2 of single_arr) {
            let cardsTable: { type: number, cards: number[] } = { type: null, cards: [] };
            cardsTable.cards.push(...three_arr.shift().cards);
            cardsTable.cards.push(...single_arr.shift().cards);
            cardsTable.type = CardsType.THREE_TWO;
            cardsTables.push(cardsTable);
            break;
        }
    }

    cardsTables.push(...three_arr);
    cardsTables.push(...two_arr);
    /**剩余单张 */
    cardsTables.push(...single_arr);

    cardsTables.sort((a, b) => {
        if (a.type == b.type) {
            /**最小单张的顺子排前面 */
            if (a.type == CardsType.SHUN) {
                return getCardValue(a.cards[0]) - getCardValue(b.cards[0]);
            }
            let ret = isOverPre(a.cards, b.cards);
            return ret ? 1 : -1;
        }
        return a.type - b.type;
    });
    /**单张 鬼 最后压入 */
    for (const card of Cards) {
        cardsTables.push({ cards: [card], type: CardsType.Single });
    }
    return cardsTables;
}

/**
 * 拆牌算法v1.0 被动
 * @param theCards 1-54
 * @param last_pkg 1-54
 */
export function chaipai_2(theCards: number[], last_pkg: number[]) {
    let Cards = theCards.slice().sort((a, b) => getCardValue(a) - getCardValue(b));
    let cardsTables: { type: number, cards: number[] }[] = [];
    let fillCards: number[] = new Array(18).fill(0);
    let arr_1 = Cards.map(m => getCardValue(m));
    for (let card_v of arr_1) {
        fillCards[card_v]++;
    }

    if (GetCardType(Cards) >= 2 && isOverPre(Cards, last_pkg)) {
        cardsTables.push({ type: GetCardType(Cards), cards: Cards });
        return cardsTables;
    }

    let last_type = GetCardType(last_pkg);
    switch (last_type) {
        case CardsType.Single:
            for (const card of Cards) {
                if (getCardValue(card) > getCardValue(last_pkg[0])) {
                    cardsTables.push({ type: CardsType.Single, cards: [card] });
                }
            }
            break;
        case CardsType.SHUN:
            let ret = findMaxLenOfShunZi(Cards, last_pkg);
            cardsTables.push(...ret);
            break;
        case CardsType.DOUBLE:
            let arr1 = findMaxLenOfBoom(Cards, 2, last_pkg);
            cardsTables.push(...arr1);
            break;
        case CardsType.CONTINUOUSLY_PAIR:
            let arr2 = findMaxLenOfTwoShun(Cards, last_pkg);
            cardsTables.push(...arr2);
            break;
        case CardsType.THREE:
            let arr3 = findMaxLenOfBoom(Cards, 3, last_pkg);
            cardsTables.push(...arr3);
            break;
        case CardsType.THREE_ONE:
            let arr4 = findMaxLenOfThreeOne(Cards, last_pkg);
            cardsTables.push(...arr4);
            break;
        case CardsType.FOUR_TWO:
            let arr5 = findMaxLenOfFOUR_TWO(Cards, last_pkg);
            cardsTables.push(...arr5);
            break;
        case CardsType.AIRCRAFT:
            let arr6 = findFeijiDai(Cards, last_pkg);
            cardsTables.push(...arr6);
            break;
        case CardsType.BOOM:
            let arr7 = findMaxLenOfBoom(Cards, 4, last_pkg);
            cardsTables.push(...arr7);
        default:
            break;
    }
    if (last_type != CardsType.BOOM && last_type != CardsType.BIG_BOOM) {
        let arr7 = findMaxLenOfBoom(Cards, 4, [0]);
        cardsTables.push(...arr7);
    }
    /**如果有火箭，找出来； */
    if (Cards.includes(78) && Cards.includes(79)) {
        cardsTables.push({ type: CardsType.BIG_BOOM, cards: [78, 79] });
    }
    cardsTables.sort((a, b) => {
        if (a.type == b.type) {
            let ret = isOverPre(a.cards, b.cards);
            return ret ? 1 : -1;
        }
        return a.type - b.type;
    });
    cardsTables = cardsTables.filter(m => isOverPre(m.cards, last_pkg));
    return cardsTables;
}

const cards_type = {
    /**
    * 检查牌是否是有效牌
    * @param cards
    */

    /**
    * 检查单牌
    * @param cards
    */
    checkSingle(cards: number[]) {
        // 检查牌型长度 以及 是否无效牌型
        return cards.length === 1;
    },

    /**
    * 检查是否是顺子
    * @param cards
    */
    checkShun(cards: number[]) {
        // 牌的长度小于5或者大于14 或者牌里面包含大小王不合格
        if (cards.length < 5 || cards.length > 12 ||
            !!cards.find(c => c === 0x4E || c === 0x4F)) {
            return false;
        }

        let _cards = cards.map(c => getCardValue(c));

        // 如果牌里面有2也不合格
        if (!!cards.find(c => c === enum_Value.Value2)) {
            return false;
        }

        _cards.sort((a, b) => a - b);

        for (let i = 1, len = _cards.length, c = 0; i < len; i++, c++) {
            if (_cards[c] + 1 !== _cards[i]) {
                return false;
            }
        }
        return true;
    },

    /**
     * 检查是否是对子
     * @param cards
     */
    checkDouble(cards: number[]) {
        // 牌的长度小于5或者大于14 或者牌里面包含大小王不合格
        if (cards.length !== 2 ||
            !!cards.find(c => c === 0x4E || c === 0x4F)) {
            return false;
        }

        const _cards = cards.map(c => getCardValue(c));

        return _cards[0] === _cards[1];
    },

    /**
     * 检查是否是连对
     * @param cards 1-54
     */
    checkContinuouslyPair(cards: number[]) {
        // 如果不是双数 或者牌里面包含大小王不合格
        if (cards.length % 2 !== 0 ||
            !!cards.find(c => c === 0x4E || c === 0x4F)) {
            return false;
        }

        let _cards = cards.map(c => getCardValue(c));

        // 如果牌里面有2也不合格
        if (!!_cards.find(c => c === enum_Value.Value2)) {
            return false;
        }

        _cards.sort((a, b) => a - b);

        for (let i = 2, len = _cards.length, c = 0; i < len; i += 1, c += 1) {
            if (_cards[c] + 1 !== _cards[i]) {
                return false;
            }
        }

        return true;
    },

    /**
     * 检查是否是三张
     * @param cards
     */
    checkThree(cards: number[]): boolean {
        return cards.length === 3 && new Set(cards.map(c => getCardValue(c))).size === 1;
    },

    /**
     * 检查是否是三带一
     * @param cards
     */
    checkThreeOne(cards: number[]): boolean {
        const _cards = cards.map(c => getCardValue(c));

        if (cards.length !== 4 || new Set(_cards).size !== 2) {
            return false;
        }

        const len = _cards.filter(c => c === _cards[0]).length;

        return len === 1 || len === 3;
    },


    /**
     * 检查是否是三带二
     * @param cards
     */
    checkThreeTwo(cards: number[]): boolean {
        if (cards.length !== 5) {
            return false;
        }
        const _cards = cards.map(c => getCardValue(c));
        const alikeCount = checkAlike(_cards);
        if (alikeCount[3] == 1 && alikeCount[2] == 1) {
            return true;
        }
        return false;
    },

    /**
     * 检查是否是四带二
     */
    checkFourTwo(cards: number[]): boolean {
        const _cards = cards.map(c => getCardValue(c));
        const alikeCount = checkAlike(_cards);
        if (_cards.length == 8 && alikeCount[4] == 1 && alikeCount[2] == 2) {
            return true;
        }
        if (_cards.length == 6 && alikeCount[4] == 1 && alikeCount[1] == 2) {
            return true;
        }
        return false;
    },

    /**
     * 检查是否是炸弹
     * @param cards
     */
    checkBoom(cards: number[]): boolean {
        return cards.length === 4 && new Set(cards.map(c => getCardValue(c))).size === 1;
    },

    /**
     * 检查是否是王炸
     * @param cards
     */
    checkBigBoom(cards: number[]): boolean {
        return cards.length === 2 && cards[1] + cards[0] === 0x4E + 0x4F;
    },

    /**
     * 检查是否过牌
     */
    checkCall(cards: number[]): boolean {
        return cards.length === 0;
    }
}
/**正序发牌规则 */
export function cardDataSort() {
    let pais = genereteCard();
    let cardData: { cards: number[], max_type: number }[] = [];
    // console.warn("==============================");
    for (let index = 0; index < 3; index++) {
        let Thencards = pais.splice(0, 17).sort((a, b) => getCardValue(b) - getCardValue(a));
        cardData.push({ cards: Thencards, max_type: 0 });
    }
    const publicCards = pais.splice(0, 3);
    // for (const cards of cardData) {
    //     let ret = cards.cards.map(c => land_Logic.getZhanshi(c));
    //     console.warn(ret.toString());
    // }
    for (const cards of cardData) {
        // console.warn("next");
        let ret = chaipai(cards.cards, []);
        for (const cc of ret) {
            // let ret2 = cc.cards.map(c => land_Logic.getZhanshi(c));
            // console.warn(cc.type, ret2.toString());

            if (cards.max_type < cc.type) {
                cards.max_type = cc.type;
            }
        }
    }
    cardData.sort((a, b) => a.max_type - b.max_type);
    for (const cards of cardData) {
        // console.warn("next22");
        // console.warn(cards.max_type, cards.cards.map(c => land_Logic.getZhanshi(c)).toString());
    }
    return { cardData, publicCards };
}
