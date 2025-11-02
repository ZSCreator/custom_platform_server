'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardsConversionStr = exports.conversionCards = exports.filterLotteryResult = exports.judgeArrType_SH = exports.judgeArrType_NN = exports.judgeArrType = exports.judgeDragonTiger = exports.getDoubleByConfigBySg = exports.bipaiSoleBySg2 = exports.bipaiSoleBySg = exports.getCardTypeBySg = exports.createPoker = exports.calculateDot = exports.getPokerFlowerColor = exports.getResultByAtt = exports.canBupaiByBank = exports.canBupaiByPlay = exports.getCardTypeTo9 = exports.bipaiSoleQz = exports.bipaiSole = exports.countCardsBairen = exports.bipai = exports.getCardTypeQz = exports.getCardTypeNewQz = exports.getCardTypeNew = exports.getCardTypeNew_ = exports.getNiuNum = exports.getCardType = exports.getpai = exports.getCardNum = exports.caipiaoGetPai = exports.getPai = exports.shuffle = void 0;
const JsonMgr = require("../../config/data/JsonMgr");
const utils = require("../utils");
function shuffle() {
    const cards = [];
    for (let i = 0; i < 52; i++) {
        cards.push(i);
    }
    cards.sort(() => 0.5 - Math.random());
    return cards;
}
exports.shuffle = shuffle;
;
function getPai(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
        for (let p = 0; p < 52; p++) {
            cards.push(p);
        }
    }
    utils.disorganizeArr(cards);
    return cards;
}
exports.getPai = getPai;
;
const caipiaoGetPai = function (cards) {
    let arr = [], num = 5;
    let n = 0;
    for (let i = 0; i < num; i++) {
        let m = 0;
        cards.forEach((c, j) => {
            if (j >= n && m < 5) {
                arr.push(c);
                m++;
            }
        });
        n++;
    }
    const pai = this.shuffle();
    arr = arr.map(m => {
        m = pai.find(p => {
            let mod = p % 13 >= 9 ? 10 : (p % 13) + 1;
            return mod === m;
        });
        return m;
    });
    return arr;
};
exports.caipiaoGetPai = caipiaoGetPai;
function getCardNum(arr, num) {
    const cards = [];
    for (let i = 0; i < num; i++) {
        const index = Math.floor(Math.random() * arr.length);
        cards.push(arr[index]);
        arr.splice(index, 1);
    }
    return cards;
}
exports.getCardNum = getCardNum;
const getpai = function () {
    const cards = [];
    for (let p = 0; p < 52; p++) {
        cards.push(p);
    }
    cards.sort(() => 0.5 - Math.random());
    return cards;
};
exports.getpai = getpai;
const getCardType = function (cards) {
    let total = 0, cow = -1, num;
    let value;
    const map = [];
    let thecards = cards.map(m => {
        num = m % 13 + 1;
        value = map.find(m => m.id === num);
        value ? (value.count += 1) : map.push({ id: num, count: 1 });
        (num >= 10) && (num = 10);
        total += num;
        return num;
    });
    if (map.find(m => m.count === 4)) {
        return 13;
    }
    if (map.every(m => m.id >= 11)) {
        return 12;
    }
    const si = map.find(m => m.id === 10);
    if (si && si.count >= 1 && map.every(m => m.id >= 10)) {
        return 11;
    }
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
exports.getCardType = getCardType;
function getNiuNum(cards) {
    let total = 0, cow = -1, num, value, cows = [];
    const map = [], cards_ = cards.slice();
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
                    return cards_[k];
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
exports.getNiuNum = getNiuNum;
const getCardTypeNew_ = function (cards) {
    let num = 0;
    cards.map(m => {
        num += (m % 13 + 1) >= 10 ? 10 : (m % 13 + 1);
    });
    return num % 10 === 0;
};
exports.getCardTypeNew_ = getCardTypeNew_;
const getCardTypeNew = function (cards) {
    const currCard = (0, exports.getCardType)(cards);
    return (0, exports.countCardsBairen)({ cards, cardType: currCard });
};
exports.getCardTypeNew = getCardTypeNew;
const getCardTypeNewQz = function (cards) {
    const currCard = getCardTypeQz(cards);
    return (0, exports.countCardsBairen)({ cards, cardType: currCard.count });
};
exports.getCardTypeNewQz = getCardTypeNewQz;
function getCardTypeQz(cards) {
    let total = 0, cow = -1, cows = [], num, value;
    const map = [];
    const arr = cards.map(m => {
        num = m % 13 + 1;
        value = map.find(m => m.id === num);
        value ? (value.count += 1) : map.push({ id: num, count: 1 });
        (num >= 10) && (num = 10);
        total += num;
        return num;
    });
    const arr_new = cards.map(m => {
        num = m % 13 + 1;
        return num;
    });
    const isShunzi = checkShunzi(arr_new.slice());
    const isTonghua = cards.every(m => Math.floor(cards[0] / 13) === Math.floor(m / 13));
    if (map.every(m => m.id >= 11)) {
        return { count: 12, cows: [] };
    }
    for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 5; j++) {
            if ((total - arr[i] - arr[j]) % 10 == 0) {
                cows = [0, 1, 2, 3, 4].filter(m => m !== i && m !== j);
                cow = (arr[i] + arr[j]) % 10;
            }
        }
    }
    cow = cow === 0 ? 10 : cow;
    cow = cow === -1 ? 0 : cow;
    return { count: cow, cows: cows };
}
exports.getCardTypeQz = getCardTypeQz;
const bipai = function (players) {
    players.sort((a, b) => b.cardType - a.cardType);
    const list = players.filter(m => m.cardType === players[0].cardType);
    if (list.length > 0) {
        const max = list.map(m => {
            const arr = m.cards.slice();
            arr.sort((a, b) => b % 13 - a % 13);
            return { uid: m.uid, id: arr[0] % 13, hua: Math.floor(arr[0] / 13) };
        });
        max.sort((a, b) => b.id - a.id);
        let uid = max[0].uid;
        const ls = max.filter(m => m.id === max[0].id);
        if (ls.length > 0) {
            ls.sort((a, b) => a.hua - b.hua);
            uid = ls[0].uid;
        }
        return players.find(m => m.uid === uid);
    }
    return players[0];
};
exports.bipai = bipai;
const countCardsBairen = function ({ cards, cardType }) {
    const k = {
        0: 4,
        1: 3,
        2: 2,
        3: 1,
        4: 0,
    };
    const arr = cards.slice().sort((a, b) => b % 13 - a % 13);
    const dot = (utils.repairZero(arr[0] % 13, 2));
    const huaSe = (0, exports.getPokerFlowerColor)(arr[0]);
    return parseInt(cardType + '' + dot + '' + k[huaSe]);
};
exports.countCardsBairen = countCardsBairen;
const bipaiSole = function (fight1, fight2) {
    if (fight1.cardType === fight2.cardType) {
        const arr1 = fight1.cards.slice().sort((a, b) => (b % 13 === a % 13) ? (a - b) : (b % 13 - a % 13));
        const arr2 = fight2.cards.slice().sort((a, b) => (b % 13 === a % 13) ? (a - b) : (b % 13 - a % 13));
        const max1 = arr1[0] % 13, max2 = arr2[0] % 13;
        if (max1 === max2) {
            return arr1[0] / 13 < arr2[0] / 13;
        }
        return max1 > max2;
    }
    return fight1.cardType > fight2.cardType;
};
exports.bipaiSole = bipaiSole;
const bipaiSoleQz = function (fight1, fight2) {
    if (fight1.cardType.count === fight2.cardType.count) {
        const arr1 = fight1.cards.slice(), arr2 = fight2.cards.slice();
        arr1.sort((a, b) => a - b);
        arr2.sort((a, b) => a - b);
        arr1.sort((a, b) => b % 13 - a % 13);
        arr2.sort((a, b) => b % 13 - a % 13);
        const max1 = arr1[0] % 13, max2 = arr2[0] % 13;
        if (max1 === max2) {
            return arr1[0] / 13 < arr2[0] / 13;
        }
        return max1 > max2;
    }
    return fight1.cardType.count > fight2.cardType.count;
};
exports.bipaiSoleQz = bipaiSoleQz;
function getCardTypeTo9(cards) {
    let ret = 0;
    cards.forEach(m => {
        let num = m % 13 + 1;
        ret += (num >= 10 ? 0 : num);
    });
    ret = ret % 10;
    return ret;
}
exports.getCardTypeTo9 = getCardTypeTo9;
;
function canBupaiByPlay(cardType0, cardType1) {
    if (cardType0 >= 8 || cardType1 >= 8) {
        return false;
    }
    return cardType0 <= 5;
}
exports.canBupaiByPlay = canBupaiByPlay;
;
function canBupaiByBank(cardType0, cardType1, bupai = -1) {
    if (bupai !== -1) {
        bupai = bupai % 13 + 1;
        bupai = bupai >= 10 ? 0 : bupai;
    }
    if (cardType0 >= 8 || cardType1 >= 7) {
        return false;
    }
    if (cardType1 <= 2 || (bupai === -1 && cardType1 <= 5)) {
        return true;
    }
    if (cardType1 === 3 && bupai !== 8) {
        return true;
    }
    if (cardType1 === 4 && [0, 1, 8, 9].indexOf(bupai) === -1) {
        return true;
    }
    if (cardType1 === 5 && [0, 1, 2, 3, 8, 9].indexOf(bupai) === -1) {
        return true;
    }
    if ((cardType1 === 6 || cardType1 === 7) && [6, 7].indexOf(bupai) !== -1) {
        return true;
    }
    return false;
}
exports.canBupaiByBank = canBupaiByBank;
;
function hasPair(cards) {
    return cards[0] % 13 === cards[1] % 13;
}
;
const checkShunzi = function (cards) {
    cards.sort((a, b) => {
        return a - b;
    });
    let i = 0;
    if (cards[0] === 0 && cards[4] === 12) {
        i = 1;
    }
    for (; i < cards.length - 1; i++) {
        if (cards[i] + 1 !== cards[i + 1]) {
            return false;
        }
    }
    return true;
};
const checkAlike = function (cards) {
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
};
const getResultByAtt = function (cards) {
    let _cards = cards.slice();
    let wangIndex = _cards.findIndex(m => m == 52);
    let resultArr = [];
    if (wangIndex >= 0) {
        for (let i = 0; i < 52; i++) {
            _cards.splice(wangIndex, 1, i);
            let arr = _cards.map(m => m % 13);
            let results = judgePoker(arr, _cards);
            if (results) {
                results.king = i;
                resultArr.push(results);
            }
        }
        if (resultArr.length) {
            resultArr.sort((a, b) => b.mul - a.mul);
            return { id: resultArr[0].id, mul: resultArr[0].mul, king: resultArr[0].king };
        }
        else {
            return { id: -1, mul: 0 };
        }
    }
    else {
        let arr = _cards.map(m => m % 13);
        arr.sort((a, b) => a - b);
        let results = judgePoker(arr, cards);
        return results;
    }
};
exports.getResultByAtt = getResultByAtt;
const judgePoker = function (arr, cards) {
    const isShunzi = checkShunzi(arr);
    const isTonghua = cards.every(m => Math.floor(cards[0] / 13) === Math.floor(m / 13));
    const alikeCount = checkAlike(arr);
    if (alikeCount[5] === 1) {
        return { id: 0, mul: JsonMgr.get('att/att').datas[8].multiple };
    }
    if (isShunzi && isTonghua && arr[0] === 0 && arr[4] === 12) {
        return { id: 1, mul: JsonMgr.get('att/att').datas[0].multiple };
    }
    if (isShunzi && isTonghua) {
        return { id: 2, mul: JsonMgr.get('att/att').datas[1].multiple };
    }
    if (alikeCount[4] === 1) {
        return { id: 3, mul: JsonMgr.get('att/att').datas[2].multiple };
    }
    if (alikeCount[3] === 1 && alikeCount[2] === 1) {
        return { id: 4, mul: JsonMgr.get('att/att').datas[3].multiple };
    }
    if (isTonghua) {
        return { id: 5, mul: JsonMgr.get('att/att').datas[4].multiple };
    }
    if (isShunzi) {
        return { id: 6, mul: JsonMgr.get('att/att').datas[5].multiple };
    }
    if (alikeCount[3] === 1) {
        return { id: 7, mul: JsonMgr.get('att/att').datas[6].multiple };
    }
    if (alikeCount[2] === 2) {
        return { id: 8, mul: JsonMgr.get('att/att').datas[7].multiple };
    }
    if (alikeCount[2] === 1 && alikeCount[1] === 3) {
        let isJArr = [];
        let temp = false;
        let isJ = arr.filter(m => m >= 10 || m == 0);
        isJ.forEach(m => {
            if (!isJArr.includes(m)) {
                isJArr.push(m);
            }
            else {
                temp = true;
            }
        });
        if (temp) {
            return { id: 9, mul: JsonMgr.get('att/att').datas[9].multiple };
        }
        return { id: -1, mul: 0 };
    }
    return { id: -1, mul: 0 };
};
const getPokerFlowerColor = function (poker) {
    if (poker == 52 || poker == 53) {
        return 4;
    }
    else if (poker >= 39 && poker <= 51) {
        return 3;
    }
    else if (poker >= 26 && poker <= 38) {
        return 2;
    }
    else if (poker >= 13 && poker <= 25) {
        return 1;
    }
    else {
        return 0;
    }
};
exports.getPokerFlowerColor = getPokerFlowerColor;
function calculateDot(dotArr) {
    let isA = [0, 13, 26, 39];
    let allDot = 0;
    let worstDot = 0;
    let temp = 0;
    dotArr.forEach(m => {
        if (isA.includes(m)) {
            temp++;
        }
        else {
            let dot = m % 13;
            allDot += (dot > 9 ? 10 : dot + 1);
            worstDot += (dot > 9 ? 10 : dot + 1);
        }
    });
    if (temp) {
        if (allDot < 21) {
            let surplusDot = 21 - allDot;
            let ADot = 0;
            let num = surplusDot % 11;
            if (surplusDot == 11) {
                if (temp == 1) {
                    ADot += 11;
                }
                else {
                    for (let i = 0; i < temp; i++) {
                        ADot += 1;
                    }
                }
            }
            else if (surplusDot > 11) {
                if (num >= temp) {
                    for (let i = 0; i < temp; i++) {
                        if (i == 0) {
                            ADot += 11;
                        }
                        else {
                            ADot += 1;
                        }
                    }
                }
                else {
                    for (let i = 0; i < temp; i++) {
                        ADot += 1;
                    }
                }
            }
            else if (surplusDot < 11) {
                for (let i = 0; i < temp; i++) {
                    ADot += 1;
                }
            }
            allDot += ADot;
            let Dotnew = 0;
            for (let i = 0; i < temp; i++) {
                Dotnew += 1;
            }
            worstDot += Dotnew;
            if (allDot != worstDot) {
                return [allDot, worstDot];
            }
            return [allDot];
        }
        else {
            let Dotnew = 0;
            for (let i = 0; i < temp; i++) {
                Dotnew += 1;
            }
            allDot += Dotnew;
            return [allDot];
        }
    }
    else {
        return [allDot];
    }
}
exports.calculateDot = calculateDot;
const createPoker = function (num) {
    let pokerArr = [];
    let Numbers;
    if (Array.isArray(num)) {
        Numbers = num;
    }
    else {
        Numbers = [num];
    }
    Numbers.forEach(m => {
        for (let i = 0; i < 4; i++) {
            pokerArr.push(13 * i + m);
        }
    });
    return pokerArr;
};
exports.createPoker = createPoker;
const getCardTypeBySg = function (cards) {
    let map = [], total = 0;
    const arr = cards.map(m => {
        const num = m % 13 + 1;
        const value = map.find(m => m.id === num);
        value ? (value.count += 1) : map.push({ id: num, count: 1 });
        total += Math.min(10, num);
    });
    if (map[0].count === 3 && map[0].id > 10) {
        return { count: 12 };
    }
    if (map[0].count === 3) {
        return { count: 11 };
    }
    if (map.every(m => m.id > 10)) {
        return { count: 10 };
    }
    return { count: total % 10 };
};
exports.getCardTypeBySg = getCardTypeBySg;
const bipaiSoleBySg = function (fight1, fight2) {
    if (fight1.cardType.count !== fight2.cardType.count) {
        return fight1.cardType.count > fight2.cardType.count;
    }
    else if (fight1.cardType.count === 0 && fight2.cardType.count === 0) {
        return true;
    }
    const arr1 = fight1.cards.slice(), arr2 = fight2.cards.slice();
    const l1 = arr1.filter(m => m % 13 >= 10).length, l2 = arr2.filter(m => m % 13 >= 10).length;
    if (l1 !== l2) {
        return l1 > l2;
    }
    arr1.sort((a, b) => a - b);
    arr2.sort((a, b) => a - b);
    arr1.sort((a, b) => b % 13 - a % 13);
    arr2.sort((a, b) => b % 13 - a % 13);
    const c1 = arr1[0] % 13, c2 = arr2[0] % 13;
    if (c1 !== c2) {
        return c1 > c2;
    }
    return Math.floor(arr1[0] / 13) < Math.floor(arr2[0] / 13);
};
exports.bipaiSoleBySg = bipaiSoleBySg;
const bipaiSoleBySg2 = function (cards1, cards2) {
    if (cards1.cardType !== cards2.cardType) {
        return cards1.cardType > cards2.cardType;
    }
    const arr1 = cards1.cards.slice(), arr2 = cards2.cards.slice();
    const l1 = arr1.filter(m => m % 13 >= 10).length, l2 = arr2.filter(m => m % 13 >= 10).length;
    if (l1 !== l2) {
        return l1 > l2;
    }
    arr1.sort((a, b) => a - b);
    arr2.sort((a, b) => a - b);
    arr1.sort((a, b) => b % 13 - a % 13);
    arr2.sort((a, b) => b % 13 - a % 13);
    const c1 = arr1[0] % 13, c2 = arr2[0] % 13;
    if (c1 !== c2) {
        return c1 > c2;
    }
    return Math.floor(arr1[0] / 13) < Math.floor(arr2[0] / 13);
};
exports.bipaiSoleBySg2 = bipaiSoleBySg2;
const getDoubleByConfigBySg = function (player, mulrules) {
    const count = player.cardType.count;
    for (let key in mulrules) {
        if (+key === count) {
            return mulrules[key];
        }
    }
    return 1;
};
exports.getDoubleByConfigBySg = getDoubleByConfigBySg;
const judgeDragonTiger = (arr) => {
    if (arr[0] === arr[arr.length - 1])
        return 3;
    return arr[0] > arr[arr.length - 1] ? 1 : 2;
};
exports.judgeDragonTiger = judgeDragonTiger;
const judgeArrType = (arr) => {
    let newArr = new Set(arr);
    if ([...newArr].length < arr.length) {
        return [...newArr].length === 1 ? 1 : 3;
    }
    arr.sort((x, y) => x - y);
    newArr = arr.filter((num, index) => {
        if (index !== arr.length - 1) {
            return (++num === arr[index + 1]);
        }
        return true;
    });
    if (newArr.length === arr.length)
        return 2;
    if ((arr[0] + 1 === arr[1]) || (arr[1] + 1 === arr[2]))
        return 4;
    return 5;
};
exports.judgeArrType = judgeArrType;
const judgeArrType_NN = (arr) => {
    let num = 0, newArr;
    const idx = arr.map((number, index) => index);
    for (let i = 0, len = arr.length; i < len - 2; i++) {
        for (let j = i + 1; j < len - 1; j++) {
            for (let d = j + 1; d < len; d++) {
                if ([arr[i], arr[j], arr[d]].reduce((x, y) => x + y) % 10 === 0) {
                    const index = [i, j, d];
                    let newNum = idx.filter(num => !index.includes(num)).map(inx => arr[inx]).reduce((x, y) => x + y);
                    if (newNum === 0)
                        newNum = 10;
                    if (newNum > num)
                        num = newNum;
                    newArr = [arr[i], arr[j], arr[d]];
                }
            }
        }
    }
    return num > 10 ? num % 10 : num;
};
exports.judgeArrType_NN = judgeArrType_NN;
const judgeArrType_SH = (arr) => {
    if (arr.every(num => num === arr[0]))
        return 0;
    let newArr = [...(new Set(arr))];
    if (newArr.length === 2) {
        return newArr.map(n => (arr.filter(num => n === num)).length).includes(4) ? 1 : 2;
    }
    if (newArr.length === 3) {
        return newArr.map(n => (arr.filter(num => n === num)).length).includes(3) ? 4 : 5;
    }
    if (newArr.length === 4)
        return 6;
    if (newArr[newArr.length - 1] - newArr[0] === 4)
        return 3;
    return 7;
};
exports.judgeArrType_SH = judgeArrType_SH;
function filterLotteryResult(result, players, convenienceProperty, filterType) {
    if (filterType === 4) {
        return;
    }
    result.totalRebate = 0;
    for (let uid in Object.getOwnPropertyDescriptors(result[convenienceProperty])) {
        const curPlayer = players.find(player => player.uid === uid);
        if (!!curPlayer && curPlayer.isRobot === filterType) {
            const user = result[convenienceProperty][uid];
            result.totalRebate += user.allWin;
        }
    }
}
exports.filterLotteryResult = filterLotteryResult;
;
function conversionCards(cards) {
    if (Array.isArray(cards)) {
        return cards.map(c => {
            return `${conversionColor(c)}${(c % 13 + 1).toString(16)}`;
        }).reduce((c1, c2) => c1 + c2, "");
    }
    return `${conversionColor(cards)}${(cards % 13 + 1).toString(16)}`;
}
exports.conversionCards = conversionCards;
function conversionColor(card) {
    if (card >= 0 && card < 13) {
        return '3';
    }
    if (card >= 13 && card < 26) {
        return '2';
    }
    if (card >= 26 && card < 39) {
        return '1';
    }
    if (card >= 39 && card < 52) {
        return '0';
    }
    return '4';
}
function cardsConversionStr(arr) {
    return arr.map(c => {
        const card = c % 13 + 1;
        let color, value;
        switch (Math.floor(c / 13)) {
            case 0:
                color = '黑桃';
                break;
            case 1:
                color = '红桃';
                break;
            case 2:
                color = '梅花';
                break;
            case 3:
                color = '方块';
                break;
        }
        if (card === 11) {
            value = 'J';
        }
        else if (card === 1) {
            value = 'A';
        }
        else if (card === 12) {
            value = 'Q';
        }
        else if (card === 13) {
            value = 'K';
        }
        else {
            value = card.toString();
        }
        return color + value;
    });
}
exports.cardsConversionStr = cardsConversionStr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbHMvR2FtZVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYixxREFBc0Q7QUFDdEQsa0NBQW1DO0FBU25DLFNBQWdCLE9BQU87SUFDbkIsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFSRCwwQkFRQztBQUFBLENBQUM7QUFPRixTQUFnQixNQUFNLENBQUMsS0FBYTtJQUNoQyxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDSjtJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQVZELHdCQVVDO0FBQUEsQ0FBQztBQUdLLE1BQU0sYUFBYSxHQUFHLFVBQVUsS0FBSztJQUN4QyxJQUFJLEdBQUcsR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1osQ0FBQyxFQUFFLENBQUM7YUFDUDtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxFQUFFLENBQUM7S0FDUDtJQUVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzQixHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNkLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMsQ0FBQTtBQXhCWSxRQUFBLGFBQWEsaUJBd0J6QjtBQU9ELFNBQWdCLFVBQVUsQ0FBQyxHQUFhLEVBQUUsR0FBVztJQUNqRCxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN4QjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFSRCxnQ0FRQztBQUNNLE1BQU0sTUFBTSxHQUFHO0lBQ2xCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFHRCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN0QyxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDLENBQUM7QUFWVyxRQUFBLE1BQU0sVUFVakI7QUFNSyxNQUFNLFdBQVcsR0FBRyxVQUFVLEtBQWU7SUFFaEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFXLENBQUE7SUFDcEMsSUFBSSxLQUFvQyxDQUFDO0lBQ3pDLE1BQU0sR0FBRyxHQUFvQyxFQUFFLENBQUM7SUFFaEQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUN6QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakIsS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RCxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMxQixLQUFLLElBQUksR0FBRyxDQUFDO1FBQ2IsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDOUIsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUdELElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7UUFDNUIsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUVELE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO1FBQ25ELE9BQU8sRUFBRSxDQUFDO0tBQ2I7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQy9DLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDMUM7U0FDSjtLQUNKO0lBQ0QsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzNCLE9BQU8sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDdEMsQ0FBQyxDQUFDO0FBdENXLFFBQUEsV0FBVyxlQXNDdEI7QUFHRixTQUFnQixTQUFTLENBQUMsS0FBZTtJQUNyQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxHQUFhLEVBQUUsQ0FBQztJQUN6RCxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUV2QyxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNsQixHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakIsS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RCxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMxQixLQUFLLElBQUksR0FBRyxDQUFDO1FBQ2IsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDLENBQUMsQ0FBQztJQUNILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDekMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDM0QsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3BCLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDcEM7U0FDSjtLQUNKO0lBQ0QsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzNCLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzNCLElBQUksR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUNYLE9BQU8sTUFBTSxDQUFDO0tBQ2pCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQTdCRCw4QkE2QkM7QUFHTSxNQUFNLGVBQWUsR0FBRyxVQUFVLEtBQWU7SUFDcEQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ1osS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNWLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sR0FBRyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFBO0FBTlksUUFBQSxlQUFlLG1CQU0zQjtBQUNNLE1BQU0sY0FBYyxHQUFHLFVBQVUsS0FBSztJQUN6QyxNQUFNLFFBQVEsR0FBRyxJQUFBLG1CQUFXLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsT0FBTyxJQUFBLHdCQUFnQixFQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQTtBQUhZLFFBQUEsY0FBYyxrQkFHMUI7QUFFTSxNQUFNLGdCQUFnQixHQUFHLFVBQVUsS0FBZTtJQUNyRCxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEMsT0FBTyxJQUFBLHdCQUFnQixFQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUE7QUFIWSxRQUFBLGdCQUFnQixvQkFHNUI7QUFLRCxTQUFnQixhQUFhLENBQUMsS0FBZTtJQUV6QyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQztJQUN6RCxNQUFNLEdBQUcsR0FBb0MsRUFBRSxDQUFDO0lBRWhELE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDdEIsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNwQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDMUIsS0FBSyxJQUFJLEdBQUcsQ0FBQztRQUNiLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQzFCLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBa0JyRixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO1FBQzVCLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztLQUNsQztJQU1ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDckMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ2hDO1NBQ0o7S0FDSjtJQUNELEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUMzQixHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUMzQixPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDdEMsQ0FBQztBQXpERCxzQ0F5REM7QUFFTSxNQUFNLEtBQUssR0FBRyxVQUFVLE9BQU87SUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBRWpCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDckIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDcEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFFckIsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDZixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7U0FDbkI7UUFDRCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0tBQzNDO0lBQ0QsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBdkJXLFFBQUEsS0FBSyxTQXVCaEI7QUFLSyxNQUFNLGdCQUFnQixHQUFHLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO0lBQ3pELE1BQU0sQ0FBQyxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztLQUNQLENBQUM7SUFDRixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDMUQsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQyxNQUFNLEtBQUssR0FBRyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLE9BQU8sUUFBUSxDQUFDLFFBQVEsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN6RCxDQUFDLENBQUE7QUFaWSxRQUFBLGdCQUFnQixvQkFZNUI7QUFHTSxNQUFNLFNBQVMsR0FBRyxVQUFVLE1BQU0sRUFBRSxNQUFNO0lBRTdDLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFO1FBRXJDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEcsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUUvQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUN0QztRQUNELE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQztLQUN0QjtJQUNELE9BQU8sTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQzdDLENBQUMsQ0FBQztBQWRXLFFBQUEsU0FBUyxhQWNwQjtBQUVLLE1BQU0sV0FBVyxHQUFHLFVBQVUsTUFBTSxFQUFFLE1BQU07SUFFL0MsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtRQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9ELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFL0MsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2YsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDdEM7UUFDRCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7S0FDdEI7SUFDRCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBQ3pELENBQUMsQ0FBQztBQWhCVyxRQUFBLFdBQVcsZUFnQnRCO0FBR0YsU0FBZ0IsY0FBYyxDQUFDLEtBQWU7SUFDMUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ1osS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDSCxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQVJELHdDQVFDO0FBQUEsQ0FBQztBQU9GLFNBQWdCLGNBQWMsQ0FBQyxTQUFpQixFQUFFLFNBQWlCO0lBRS9ELElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO1FBQ2xDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsT0FBTyxTQUFTLElBQUksQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFQRCx3Q0FPQztBQUFBLENBQUM7QUFRRixTQUFnQixjQUFjLENBQUMsU0FBaUIsRUFBRSxTQUFpQixFQUFFLFFBQWEsQ0FBQyxDQUFDO0lBQ2hGLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ2QsS0FBSyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLEtBQUssR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUNuQztJQUVELElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO1FBQ2xDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNwRCxPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsSUFBSSxTQUFTLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDaEMsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN2RCxPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsSUFBSSxTQUFTLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDN0QsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLFNBQVMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDdEUsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUE5QkQsd0NBOEJDO0FBQUEsQ0FBQztBQU1GLFNBQVMsT0FBTyxDQUFDLEtBQWU7SUFDNUIsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDM0MsQ0FBQztBQUFBLENBQUM7QUFNRixNQUFNLFdBQVcsR0FBRyxVQUFVLEtBQWU7SUFDekMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNuQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1Q7SUFDRCxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM5QixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBR0YsTUFBTSxVQUFVLEdBQUcsVUFBVSxLQUFLO0lBQzlCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25DLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2YsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0QjthQUFNO1lBQ0gsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtLQUNKO0lBQ0QsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2YsS0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUU7UUFDakIsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDZixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RCO2FBQU07WUFDSCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO0tBQ0o7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMsQ0FBQztBQUdLLE1BQU0sY0FBYyxHQUFHLFVBQVUsS0FBSztJQUN6QyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDM0IsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMvQyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDbkIsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO1FBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDbEMsSUFBSSxPQUFPLEdBQVEsVUFBVSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQyxJQUFJLE9BQU8sRUFBRTtnQkFDVCxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDakIsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzQjtTQUNKO1FBQ0QsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ2xCLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtTQUNqRjthQUFNO1lBQ0gsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDN0I7S0FDSjtTQUFNO1FBQ0gsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckMsT0FBTyxPQUFPLENBQUM7S0FDbEI7QUFDTCxDQUFDLENBQUM7QUExQlcsUUFBQSxjQUFjLGtCQTBCekI7QUFFRixNQUFNLFVBQVUsR0FBRyxVQUFVLEdBQUcsRUFBRSxLQUFLO0lBRW5DLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVsQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVyRixNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFHbkMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuRTtJQUdELElBQUksUUFBUSxJQUFJLFNBQVMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDeEQsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ25FO0lBRUQsSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO1FBQ3ZCLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuRTtJQUVELElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbkU7SUFFRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUM1QyxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbkU7SUFFRCxJQUFJLFNBQVMsRUFBRTtRQUNYLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuRTtJQUVELElBQUksUUFBUSxFQUFFO1FBQ1YsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ25FO0lBRUQsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuRTtJQUVELElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMs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QUFRLENBQUM7QUFDcEIsQ0FBQyxDQUFBO0FBZlksUUFBQSxXQUFXLGVBZXZCO0FBR00sTUFBTSxlQUFlLEdBQUcsVUFBVSxLQUFLO0lBQzFDLElBQUksR0FBRyxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBR3hCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDdEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDMUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdELEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUdILElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDdEMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQztLQUN4QjtJQUVELElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDcEIsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQztLQUN4QjtJQUVELElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7UUFD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SSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDN0YsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO0tBQ2xCO0lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDckMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMzQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7S0FDbEI7SUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQTtBQXZCWSxRQUFBLGNBQWMsa0JBdUIxQjtBQUdNLE1BQU0scUJBQXFCLEdBQUcsVUFBVSxNQUFNLEVBQUUsUUFBUTtJQUMzRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUVwQyxLQUFLLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTtRQUN0QixJQUFJLENBQUMsR0FBRyxLQUFLLEtBQUssRUFBRTtZQUNoQixPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QjtLQUNKO0lBQ0QsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDLENBQUM7QUFUVyxRQUFBLHFCQUFxQix5QkFTaEM7QUF5QkssTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ3BDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDLENBQUM7QUFIVyxRQUFBLGdCQUFnQixvQkFHM0I7QUFJSyxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRWhDLElBQUksTUFBTSxHQUFRLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2pDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUxQixNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUMvQixJQUFJLEtBQUssS0FBSyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMxQixPQUFPLENBQUMsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU07UUFBRSxPQUFPLENBQUMsQ0FBQztJQUczQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFFakUsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDLENBQUM7QUF0QlcsUUFBQSxZQUFZLGdCQXNCdkI7QUFJSyxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQVUsRUFBRSxFQUFFO0lBQzFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUM7SUFDcEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQzdELE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDbEcsSUFBSSxNQUFNLEtBQUssQ0FBQzt3QkFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO29CQUM5QixJQUFJLE1BQU0sR0FBRyxHQUFHO3dCQUFFLEdBQUcsR0FBRyxNQUFNLENBQUM7b0JBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDckU7YUFDSjtTQUNKO0tBQ0o7SUFFRCxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyQyxDQUFDLENBQUM7QUFqQlcsUUFBQSxlQUFlLG1CQWlCMUI7QUFJSyxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ25DLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUUvQyxJQUFJLE1BQU0sR0FBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JGO0lBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JGO0lBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUVsQyxJQUFJLE1BQU0sQ0FBQyxN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