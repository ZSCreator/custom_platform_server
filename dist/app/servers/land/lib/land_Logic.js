"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardDataSort = exports.chaipai_2 = exports.chaipai_1 = exports.chaipai = exports.findFeijiDai = exports.findMaxLenOfFOUR_TWO = exports.findMaxLenOfThreeOne = exports.findMaxLenOfTwoShun = exports.findMaxLenOfBoom = exports.findMaxLenOfShunZi = exports.checkAlike = exports.isThreeShun = exports.isTWOShun = exports.GetCardType = exports.isOverPre = exports.has_valid = exports.getZhanshi = exports.getCardValue = exports.sort_CardList = exports.delCardList = exports.genereteCard = exports.CardsType = exports.enum_Value = void 0;
const g_theCards = [
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D,
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,
    0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D,
    0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D,
    0x4E, 0x4F,
];
const MASK_COLOR = 0xF0;
const MASK_VALUE = 0x0F;
'use strict';
var enum_Value;
(function (enum_Value) {
    enum_Value[enum_Value["ValueLeast"] = 2] = "ValueLeast";
    enum_Value[enum_Value["Value3"] = 3] = "Value3";
    enum_Value[enum_Value["Value4"] = 4] = "Value4";
    enum_Value[enum_Value["Value5"] = 5] = "Value5";
    enum_Value[enum_Value["Value6"] = 6] = "Value6";
    enum_Value[enum_Value["Value7"] = 7] = "Value7";
    enum_Value[enum_Value["Value8"] = 8] = "Value8";
    enum_Value[enum_Value["Value9"] = 9] = "Value9";
    enum_Value[enum_Value["ValueT"] = 10] = "ValueT";
    enum_Value[enum_Value["ValueJ"] = 11] = "ValueJ";
    enum_Value[enum_Value["ValueQ"] = 12] = "ValueQ";
    enum_Value[enum_Value["ValueK"] = 13] = "ValueK";
    enum_Value[enum_Value["ValueA"] = 14] = "ValueA";
    enum_Value[enum_Value["Value2"] = 15] = "Value2";
    enum_Value[enum_Value["ValueJoker1"] = 16] = "ValueJoker1";
    enum_Value[enum_Value["ValueJoker2"] = 17] = "ValueJoker2";
})(enum_Value = exports.enum_Value || (exports.enum_Value = {}));
var CardsType;
(function (CardsType) {
    CardsType[CardsType["CARD_TYPE_ERROR"] = 0] = "CARD_TYPE_ERROR";
    CardsType[CardsType["CHECK_CALL"] = 1] = "CHECK_CALL";
    CardsType[CardsType["Single"] = 2] = "Single";
    CardsType[CardsType["SHUN"] = 3] = "SHUN";
    CardsType[CardsType["DOUBLE"] = 4] = "DOUBLE";
    CardsType[CardsType["CONTINUOUSLY_PAIR"] = 5] = "CONTINUOUSLY_PAIR";
    CardsType[CardsType["THREE"] = 6] = "THREE";
    CardsType[CardsType["THREE_ONE"] = 7] = "THREE_ONE";
    CardsType[CardsType["THREE_TWO"] = 8] = "THREE_TWO";
    CardsType[CardsType["FOUR_TWO"] = 9] = "FOUR_TWO";
    CardsType[CardsType["AIRCRAFT"] = 10] = "AIRCRAFT";
    CardsType[CardsType["BOOM"] = 11] = "BOOM";
    CardsType[CardsType["BIG_BOOM"] = 12] = "BIG_BOOM";
})(CardsType = exports.CardsType || (exports.CardsType = {}));
;
function genereteCard() {
    let cards = g_theCards.map(card => card);
    cards.sort(() => 0.5 - Math.random());
    return cards;
}
exports.genereteCard = genereteCard;
function delCardList(cardList, removeList) {
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
}
exports.delCardList = delCardList;
;
function sort_CardList(subCardList) {
    let lastCardList = subCardList.sort((a, b) => getCardValue(b) - getCardValue(a));
    return lastCardList;
}
exports.sort_CardList = sort_CardList;
;
function getCardValue(card) {
    if (!g_theCards.includes(card)) {
        return 0;
    }
    const CardValue = card & MASK_VALUE;
    const cbCardColor = card & MASK_COLOR;
    if (cbCardColor == 0x40) {
        return CardValue + 2;
    }
    return (CardValue <= 2) ? (CardValue + 13) : CardValue;
}
exports.getCardValue = getCardValue;
;
function getZhanshi(card) {
    let yanse = ["方块", "梅花", "红桃", "黑桃"];
    let puke = ["", "", "", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2", "小王", "大王"];
    const CardValue = card & MASK_VALUE;
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
}
exports.getZhanshi = getZhanshi;
;
function has_valid(theCards) {
    if (!Array.isArray(theCards)) {
        return 0;
    }
    return GetCardType(theCards);
}
exports.has_valid = has_valid;
function isOverPre(theCards, perCards) {
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
                    let currentSet = new Set();
                    let lastSet = new Set();
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
exports.isOverPre = isOverPre;
function GetCardType(theCards) {
    theCards.sort((a, b) => getCardValue(a) - getCardValue(b));
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
            if (cards_type.checkThreeOne(theCards) == true) {
                return CardsType.THREE_ONE;
            }
            if (cards_type.checkBoom(theCards) == true) {
                return CardsType.BOOM;
            }
            break;
        case 5:
            if (cards_type.checkShun(theCards) == true) {
                return CardsType.SHUN;
            }
            if (cards_type.checkThreeTwo(theCards) == true) {
                return CardsType.THREE_TWO;
            }
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
            if (isFeiJiDai(theCards).res) {
                return CardsType.AIRCRAFT;
            }
            break;
    }
    return CardsType.CARD_TYPE_ERROR;
}
exports.GetCardType = GetCardType;
function isTWOShun(theCards) {
    let arr_ = theCards.map(m => getCardValue(m));
    if (arr_[arr_.length - 1] > 15) {
        return 0;
    }
    for (let idx = 0; idx < arr_.length - 1; idx++) {
        if (idx % 2 != 0) {
            if (arr_[idx] != arr_[idx + 1] - 1) {
                return 0;
            }
        }
        else {
            if (arr_[idx] != arr_[idx + 1]) {
                return 0;
            }
        }
    }
    return arr_[arr_.length - 1];
}
exports.isTWOShun = isTWOShun;
function isThreeShun(theCards) {
    let arr_ = theCards.map(m => getCardValue(m));
    if (arr_[arr_.length - 1] > 15) {
        return 0;
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
exports.isThreeShun = isThreeShun;
function isFeiJiDai(theCards) {
    let TherrSet = new Set();
    let TwoSet = new Set();
    let OneSet = new Set();
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
function checkAlike(cards) {
    const obj = {};
    for (let i = 0; i < cards.length; i++) {
        if (obj[cards[i]]) {
            obj[cards[i]] += 1;
        }
        else {
            obj[cards[i]] = 1;
        }
    }
    const ret = {};
    for (let key in obj) {
        if (ret[obj[key]]) {
            ret[obj[key]] += 1;
        }
        else {
            ret[obj[key]] = 1;
        }
    }
    return ret;
}
exports.checkAlike = checkAlike;
;
function findMaxLenOfShunZi(theCards, last_pkg = [0]) {
    let cardsTables = [];
    let last_pkg_ = getCardValue(last_pkg[0]);
    let shunZi = [];
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
            }
            else if (value1 == value2) {
            }
            else {
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
exports.findMaxLenOfShunZi = findMaxLenOfShunZi;
function findMaxLenOfBoom(theCards, same, last_pkg = []) {
    let cardsTables = [];
    let last_pkg_ = last_pkg.length == 0 ? 0 : getCardValue(last_pkg[0]);
    for (let i = 0; i < theCards.length; i++) {
        let Boom = [];
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
exports.findMaxLenOfBoom = findMaxLenOfBoom;
function findMaxLenOfTwoShun(thecards, last_pkg = []) {
    let cards = thecards.map(m => m);
    let cardsTables = [];
    let last_pkg_ = last_pkg.length == 0 ? 0 : getCardValue(last_pkg[0]);
    let last_pkg_len = last_pkg.length >= 6 ? last_pkg.length : 6;
    let fillCards = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }
    let start_ = last_pkg_ == 0 ? enum_Value.Value3 : last_pkg_;
    for (let i = start_; i <= enum_Value.ValueA - 1; i++) {
        if (fillCards[i] < 2) {
            continue;
        }
        let shunZi = [];
        shunZi.push(...[i, i]);
        for (let j = i + 1; j < enum_Value.ValueA; j++) {
            if (fillCards[j] >= 2) {
                shunZi.push(...[j, j]);
            }
            else {
                break;
            }
        }
        if (shunZi.length >= last_pkg_len) {
            let result = [];
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
            cardsTables.push({ type: CardsType.CONTINUOUSLY_PAIR, cards: result });
        }
    }
    return cardsTables;
}
exports.findMaxLenOfTwoShun = findMaxLenOfTwoShun;
function findMaxLenOfThreeOne(thecards, last_pkg) {
    let cards = thecards.map(m => m);
    let cardsTables = [];
    let fillCards = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }
    let last_pkg_ = getCardValue(last_pkg[1]);
    if (getCardValue(last_pkg[0]) == getCardValue(last_pkg[1]) && getCardValue(last_pkg[1]) != 0) {
        last_pkg_ = getCardValue(last_pkg[0]);
    }
    let start_ = last_pkg_ == 0 ? enum_Value.Value3 : last_pkg_;
    for (let i = start_; i <= enum_Value.Value2; i++) {
        let ret = [];
        if (fillCards[i] >= 3) {
            ret.push(...[i, i, i]);
            for (let j = start_; j <= enum_Value.Value2; j++) {
                if (fillCards[j] <= 2 && fillCards[j] > 0) {
                    ret.push(...[j]);
                    break;
                }
            }
            if (ret.length == 4) {
                let ret2 = [];
                for (const shunZi__ of ret) {
                    for (let i = 0; i < cards.length; i++) {
                        if (shunZi__ == getCardValue(cards[i])) {
                            ret2.push(cards[i]);
                            cards.splice(i, 1);
                            break;
                        }
                    }
                }
                cardsTables.push({ type: CardsType.THREE_ONE, cards: ret2 });
            }
        }
    }
    return cardsTables;
}
exports.findMaxLenOfThreeOne = findMaxLenOfThreeOne;
function findMaxLenOfFOUR_TWO(thecards, last_pkg = []) {
    let cards = thecards.map(m => m);
    let cardsTables = [];
    let fillCards = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }
    let last_pkg_ = 0;
    if (last_pkg.length > 0) {
        if (getCardValue(last_pkg[0]) == getCardValue(last_pkg[1]) && getCardValue(last_pkg[1]) != 0) {
            last_pkg_ = getCardValue(last_pkg[0]);
        }
    }
    let start_ = last_pkg_ == 0 ? enum_Value.Value3 : last_pkg_;
    for (let i = start_; i <= enum_Value.Value2; i++) {
        let ret = [];
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
                let ret2 = [];
                for (const shunZi__ of ret) {
                    for (let i = 0; i < cards.length; i++) {
                        if (shunZi__ == getCardValue(cards[i])) {
                            ret2.push(cards[i]);
                            cards.splice(i, 1);
                            break;
                        }
                    }
                }
                cardsTables.push({ type: CardsType.FOUR_TWO, cards: ret2 });
            }
        }
    }
    return cardsTables;
}
exports.findMaxLenOfFOUR_TWO = findMaxLenOfFOUR_TWO;
function findFeijiDai(thecards, last_pkg = []) {
    let cards = thecards.map(m => m);
    let cardsTables = [];
    if (cards.length < 8)
        return cardsTables;
    let fillCards = new Array(18).fill(0);
    for (const card_v of cards) {
        let card = getCardValue(card_v);
        fillCards[card]++;
    }
    for (let i = enum_Value.Value3; i < enum_Value.ValueK; i++) {
        if (fillCards[i] >= 3 && fillCards[i + 1] >= 3) {
            let shunzi = [];
            shunzi.push(...[i, i, i, i + 1, i + 1, i + 1]);
            for (let k = enum_Value.Value3; k < enum_Value.ValueA; k++) {
                if (fillCards[k] == 1) {
                    shunzi.push(...[k]);
                }
                if (fillCards[k] == 2) {
                    shunzi.push(...[k, k]);
                }
                if (shunzi.length % 4 == 0 && shunzi.length >= 8) {
                    let ret = [];
                    for (const shunZi__ of shunzi) {
                        for (let i = 0; i < cards.length; i++) {
                            if (shunZi__ == getCardValue(cards[i])) {
                                ret.push(cards[i]);
                                cards.splice(i, 1);
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
    return cardsTables;
}
exports.findFeijiDai = findFeijiDai;
function DelCardsTables(Cards, boom_arr) {
    for (const arr of boom_arr) {
        Cards = delCardList(Cards, arr.cards);
    }
    return Cards;
}
function chaipai(theCards, last_pkg) {
    let res = [];
    do {
        res = chaipai_1(theCards, []);
        if (last_pkg.length == 0)
            break;
        let cardsTables = res.filter(m => isOverPre(m.cards, last_pkg) && GetCardType(m.cards) == GetCardType(last_pkg));
        res = chaipai_2(theCards, last_pkg);
        res.unshift(...cardsTables);
        break;
    } while (true);
    return res;
}
exports.chaipai = chaipai;
function chaipai_1(theCards, last_pkg) {
    let Cards = theCards.slice().sort((a, b) => getCardValue(a) - getCardValue(b));
    let cardsTables = [];
    if (GetCardType(Cards) >= 2) {
        cardsTables.push({ type: GetCardType(Cards), cards: Cards });
        return cardsTables;
    }
    if (Cards.includes(78) && Cards.includes(79)) {
        cardsTables.push({ type: CardsType.BIG_BOOM, cards: [78, 79] });
        Cards = delCardList(Cards, [78, 79]);
    }
    let boom_arr = findMaxLenOfBoom(Cards, 4);
    cardsTables.push(...boom_arr);
    DelCardsTables(Cards, boom_arr);
    let shun_arr = findMaxLenOfShunZi(Cards);
    cardsTables.push(...shun_arr);
    DelCardsTables(Cards, shun_arr);
    let three_arr = findMaxLenOfBoom(Cards, 3);
    DelCardsTables(Cards, three_arr);
    let two_arr = findMaxLenOfBoom(Cards, 2);
    DelCardsTables(Cards, two_arr);
    let single_arr = [];
    for (const V1 of Cards) {
        if (V1 == 0x4E || V1 == 0x4F) {
            continue;
        }
        single_arr.push({ cards: [V1], type: CardsType.Single });
    }
    DelCardsTables(Cards, single_arr);
    for (const V1 of three_arr) {
        for (const V2 of two_arr) {
            let cardsTable = { type: null, cards: [] };
            let card1 = three_arr.shift().cards;
            let card2 = two_arr.shift().cards;
            cardsTable.cards.push(...card1);
            cardsTable.cards.push(...card2);
            cardsTable.type = CardsType.THREE_TWO;
            cardsTables.push(cardsTable);
            break;
        }
    }
    for (const V1 of three_arr) {
        for (const V2 of single_arr) {
            let cardsTable = { type: null, cards: [] };
            cardsTable.cards.push(...three_arr.shift().cards);
            cardsTable.cards.push(...single_arr.shift().cards);
            cardsTable.type = CardsType.THREE_TWO;
            cardsTables.push(cardsTable);
            break;
        }
    }
    cardsTables.push(...three_arr);
    cardsTables.push(...two_arr);
    cardsTables.push(...single_arr);
    cardsTables.sort((a, b) => {
        if (a.type == b.type) {
            if (a.type == CardsType.SHUN) {
                return getCardValue(a.cards[0]) - getCardValue(b.cards[0]);
            }
            let ret = isOverPre(a.cards, b.cards);
            return ret ? 1 : -1;
        }
        return a.type - b.type;
    });
    for (const card of Cards) {
        cardsTables.push({ cards: [card], type: CardsType.Single });
    }
    return cardsTables;
}
exports.chaipai_1 = chaipai_1;
function chaipai_2(theCards, last_pkg) {
    let Cards = theCards.slice().sort((a, b) => getCardValue(a) - getCardValue(b));
    let cardsTables = [];
    let fillCards = new Array(18).fill(0);
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
exports.chaipai_2 = chaipai_2;
const cards_type = {
    checkSingle(cards) {
        return cards.length === 1;
    },
    checkShun(cards) {
        if (cards.length < 5 || cards.length > 12 ||
            !!cards.find(c => c === 0x4E || c === 0x4F)) {
            return false;
        }
        let _cards = cards.map(c => getCardValue(c));
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
    checkDouble(cards) {
        if (cards.length !== 2 ||
            !!cards.find(c => c === 0x4E || c === 0x4F)) {
            return false;
        }
        const _cards = cards.map(c => getCardValue(c));
        return _cards[0] === _cards[1];
    },
    checkContinuouslyPair(cards) {
        if (cards.length % 2 !== 0 ||
            !!cards.find(c => c === 0x4E || c === 0x4F)) {
            return false;
        }
        let _cards = cards.map(c => getCardValue(c));
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
    checkThree(cards) {
        return cards.length === 3 && new Set(cards.map(c => getCardValue(c))).size === 1;
    },
    checkThreeOne(cards) {
        const _cards = cards.map(c => getCardValue(c));
        if (cards.length !== 4 || new Set(_cards).size !== 2) {
            return false;
        }
        const len = _cards.filter(c => c === _cards[0]).length;
        return len === 1 || len === 3;
    },
    checkThreeTwo(cards) {
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
    checkFourTwo(cards) {
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
    checkBoom(cards) {
        return cards.length === 4 && new Set(cards.map(c => getCardValue(c))).size === 1;
    },
    checkBigBoom(cards) {
        return cards.length === 2 && cards[1] + cards[0] === 0x4E + 0x4F;
    },
    checkCall(cards) {
        return cards.length === 0;
    }
};
function cardDataSort() {
    let pais = genereteCard();
    let cardData = [];
    for (let index = 0; index < 3; index++) {
        let Thencards = pais.splice(0, 17).sort((a, b) => getCardValue(b) - getCardValue(a));
        cardData.push({ cards: Thencards, max_type: 0 });
    }
    const publicCards = pais.splice(0, 3);
    for (const cards of cardData) {
        let ret = chaipai(cards.cards, []);
        for (const cc of ret) {
            if (cards.max_type < cc.type) {
                cards.max_type = cc.type;
            }
        }
    }
    cardData.sort((a, b) => a.max_type - b.max_type);
    for (const cards of cardData) {
    }
    return { cardData, publicCards };
}
exports.cardDataSort = cardDataSort;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZF9Mb2dpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2xhbmQvbGliL2xhbmRfTG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBYUEsTUFBTSxVQUFVLEdBQUc7SUFDZixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0lBQzVFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7SUFDNUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtJQUM1RSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0lBQzVFLElBQUksRUFBRSxJQUFJO0NBQ2IsQ0FBQztBQUVGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQztBQUN4QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDeEIsWUFBWSxDQUFDO0FBSWIsSUFBWSxVQXFCWDtBQXJCRCxXQUFZLFVBQVU7SUFFbEIsdURBQWMsQ0FBQTtJQUNkLCtDQUFVLENBQUE7SUFDViwrQ0FBVSxDQUFBO0lBQ1YsK0NBQVUsQ0FBQTtJQUNWLCtDQUFV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