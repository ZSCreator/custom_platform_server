'use strict';
import JsonMgr = require('../../config/data/JsonMgr');
import utils = require('../utils');

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
 * 获取牌
 * @param count 副
 */
export function getPai(count: number) {
    const cards: number[] = [];
    for (let i = 0; i < count; i++) {
        for (let p = 0; p < 52; p++) {
            cards.push(p);
        }
    }
    // 打乱
    utils.disorganizeArr(cards);
    return cards;
};

//获取彩票百牛的牌
export const caipiaoGetPai = function (cards) {
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
    //获取一副牌
    const pai = this.shuffle();
    arr = arr.map(m => {
        m = pai.find(p => {
            let mod = p % 13 >= 9 ? 10 : (p % 13) + 1;
            return mod === m;
        });
        return m;
    });
    //把彩票号码转换成牌型
    return arr;
}

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
export const getpai = function () {
    const cards = [];

    for (let p = 0; p < 52; p++) {
        cards.push(p);
    }

    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};
/**
 * 百人牛牛 和 比牌牛牛获取牌型
 * 0 - 10 表示 没牛到牛牛
 * 11.银牛 12.金牛 13.炸弹
 */
export const getCardType = function (cards: number[]) {
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

/**判断是否可能成牛(计算两张牌) */
export const getCardTypeNew_ = function (cards: number[]) {
    let num = 0;
    cards.map(m => {
        num += (m % 13 + 1) >= 10 ? 10 : (m % 13 + 1)
    });
    return num % 10 === 0;
}
export const getCardTypeNew = function (cards) {
    const currCard = getCardType(cards);
    return countCardsBairen({ cards, cardType: currCard });
}

export const getCardTypeNewQz = function (cards: number[]) {
    const currCard = getCardTypeQz(cards);
    return countCardsBairen({ cards, cardType: currCard.count });
}
/**
 * 
 * @param cards 1-52
 */
export function getCardTypeQz(cards: number[]) {
    //cow是牛 n是J,Q,K,10 的个数  total是总和
    let total = 0, cow = -1, cows: number[] = [], num, value;
    const map: { id: number, count: number }[] = [];
    // 全部加1(算牛用J Q K当10算 A 算1)
    const arr = cards.map(m => {
        num = m % 13 + 1;
        value = map.find(m => m.id === num);
        value ? (value.count += 1) : map.push({ id: num, count: 1 });
        (num >= 10) && (num = 10);
        total += num;
        return num;
    });
    //算特殊牌型用(算牛用J Q K当 11 12 13算)
    const arr_new = cards.map(m => {
        num = m % 13 + 1;
        return num;
    });
    // 其他牛
    const isShunzi = checkShunzi(arr_new.slice());
    const isTonghua = cards.every(m => Math.floor(cards[0] / 13) === Math.floor(m / 13));
    // 16同花顺
    // if (specials && specials[16] && isShunzi && isTonghua) {
    //     return { count: 16, cows: [] };
    // }
    // 15炸弹：4张相同点数的牌+1张散牌
    // if (specials && specials[15] && map.find(m => m.count === 4)) {
    //     return { count: 15, cows: [] };
    // }
    // 14葫芦牛
    // if (specials && specials[14] && map.length === 2) {
    //     return { count: 14, cows: [] };
    // }
    // 13同花牛
    // if (specials && specials[13] && isTonghua) {
    //     return { count: 13, cows: [] };
    // }
    // 12五花牛：5张全是J,Q,K
    if (map.every(m => m.id >= 11)) {
        return { count: 12, cows: [] };
    }
    // 11顺子牛
    // if (specials && specials[11] && isShunzi) {
    //     return { count: 11, cows: [] };
    // }
    // 正常牛
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
// 比牌
export const bipai = function (players) {
    players.sort((a, b) => b.cardType - a.cardType);
    // 一样的话比 大小
    const list = players.filter(m => m.cardType === players[0].cardType);
    if (list.length > 0) {
        // 获取每个玩家最大的一张牌
        const max = list.map(m => {
            const arr = m.cards.slice();
            arr.sort((a, b) => b % 13 - a % 13);
            return { uid: m.uid, id: arr[0] % 13, hua: Math.floor(arr[0] / 13) };
        });
        // 将牌 排序
        max.sort((a, b) => b.id - a.id);
        let uid = max[0].uid;
        // 是否有一样的 如果一样大 比花色
        const ls = max.filter(m => m.id === max[0].id);
        if (ls.length > 0) {
            ls.sort((a, b) => a.hua - b.hua);
            uid = ls[0].uid;
        }
        return players.find(m => m.uid === uid);
    }
    return players[0];
};

//计算百人牛牛牌型大小
//cards牌数组
//cardType牛几
export const countCardsBairen = function ({ cards, cardType }) {
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

// 比牌 两个人比
export const bipaiSole = function (fight1, fight2) {
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
// 比牌 两个人比
export const bipaiSoleQz = function (fight1, fight2) {
    // 一样大 比点数
    if (fight1.cardType.count === fight2.cardType.count) {
        const arr1 = fight1.cards.slice(), arr2 = fight2.cards.slice();
        arr1.sort((a, b) => a - b);
        arr2.sort((a, b) => a - b);
        arr1.sort((a, b) => b % 13 - a % 13);
        arr2.sort((a, b) => b % 13 - a % 13);
        const max1 = arr1[0] % 13, max2 = arr2[0] % 13;
        // 点数一样 比花色
        if (max1 === max2) {
            return arr1[0] / 13 < arr2[0] / 13;
        }
        return max1 > max2;
    }
    return fight1.cardType.count > fight2.cardType.count;
};

/**获取牌型 - 欢乐百人 */
export function getCardTypeTo9(cards: number[]) {
    let ret = 0;
    cards.forEach(m => {
        let num = m % 13 + 1;
        ret += (num >= 10 ? 0 : num);
    });
    ret = ret % 10;
    return ret;
};

/**
 * 检查 闲 是否需要补第三张牌 - 欢乐百人
 * @param cardType0 闲家
 * @param cardType1 庄家
 */
export function canBupaiByPlay(cardType0: number, cardType1: number) {
    // 只要是8点及以上，胜负已定
    if (cardType0 >= 8 || cardType1 >= 8) {
        return false;
    }
    // 点数是5点或以下必须要牌
    return cardType0 <= 5;
};

/**
 * 检查 庄 是否需要补第三张牌  - 欢乐百人
 * @param cardType0 闲家
 * @param cardType1 庄家
 * @param bupai number[]fun内部转换成number在用
 */
export function canBupaiByBank(cardType0: number, cardType1: number, bupai: any = -1) {
    if (bupai !== -1) {
        bupai = bupai % 13 + 1;
        bupai = bupai >= 10 ? 0 : bupai;
    }
    // 只要是8点及以上，胜负已定 或者 7点也不得补牌
    if (cardType0 >= 8 || cardType1 >= 7) {
        return false;
    }
    // 点数是2点或以下必须要牌 或者闲没有补牌
    if (cardType1 <= 2 || (bupai === -1 && cardType1 <= 5)) {
        return true;
    }
    // 点数3 若闲补的不是8点
    if (cardType1 === 3 && bupai !== 8) {
        return true;
    }
    // 点数4 若闲补的不是0，1，8，9点
    if (cardType1 === 4 && [0, 1, 8, 9].indexOf(bupai) === -1) {
        return true;
    }
    // 点数5 若闲补的不是0，1，2，3，8，9点
    if (cardType1 === 5 && [0, 1, 2, 3, 8, 9].indexOf(bupai) === -1) {
        return true;
    }
    // 点数6 若闲补的是6，7点
    if ((cardType1 === 6 || cardType1 === 7) && [6, 7].indexOf(bupai) !== -1) {
        return true;
    }
    return false;
};

/**
 * 是否对
 * @param cards
 */
function hasPair(cards: number[]) {
    return cards[0] % 13 === cards[1] % 13;
};




/**是否顺子 */
const checkShunzi = function (cards: number[]) {
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

// 检查相同的
const checkAlike = function (cards) {
    const obj = {};
    for (let i = 0; i < cards.length; i++) {
        if (obj[cards[i]]) {
            obj[cards[i]] += 1;
        } else {
            obj[cards[i]] = 1;
        }
    }
    const ret = {};
    for (let key in obj) {
        if (ret[obj[key]]) {
            ret[obj[key]] += 1;
        } else {
            ret[obj[key]] = 1;
        }
    }
    return ret;
};

// 获取结果 - ATT
export const getResultByAtt = function (cards): { id: number, mul: number, king?: number } {
    let _cards = cards.slice();
    let wangIndex = _cards.findIndex(m => m == 52);//大王索引
    let resultArr = [];
    if (wangIndex >= 0) {//如果有大王
        for (let i = 0; i < 52; i++) {
            _cards.splice(wangIndex, 1, i);
            let arr = _cards.map(m => m % 13);
            let results: any = judgePoker(arr, _cards);
            if (results) {
                results.king = i;
                resultArr.push(results);
            }
        }
        if (resultArr.length) {
            resultArr.sort((a, b) => b.mul - a.mul);
            return { id: resultArr[0].id, mul: resultArr[0].mul, king: resultArr[0].king }
        } else {
            return { id: -1, mul: 0 };
        }
    } else {//没有大王
        let arr = _cards.map(m => m % 13);
        arr.sort((a, b) => a - b);
        let results = judgePoker(arr, cards);
        return results;
    }
};

const judgePoker = function (arr, cards): { id: number, mul: number } {
    // 是否顺子
    const isShunzi = checkShunzi(arr);
    // 是否同花
    const isTonghua = cards.every(m => Math.floor(cards[0] / 13) === Math.floor(m / 13));
    // 相同的个数
    const alikeCount = checkAlike(arr);

    // --- 5条
    if (alikeCount[5] === 1) {
        return { id: 0, mul: JsonMgr.get('att/att').datas[8].multiple };
    }

    // 如果是顺子又是同花而且第一个还是10  --- 皇家同花顺
    if (isShunzi && isTonghua && arr[0] === 0 && arr[4] === 12) {
        return { id: 1, mul: JsonMgr.get('att/att').datas[0].multiple };
    }
    // 如果是顺子又是同花 --- 同花顺
    if (isShunzi && isTonghua) {
        return { id: 2, mul: JsonMgr.get('att/att').datas[1].multiple };
    }
    // --- 四条
    if (alikeCount[4] === 1) {
        return { id: 3, mul: JsonMgr.get('att/att').datas[2].multiple };
    }
    // --- 葫芦
    if (alikeCount[3] === 1 && alikeCount[2] === 1) {
        return { id: 4, mul: JsonMgr.get('att/att').datas[3].multiple };
    }
    // --- 同花
    if (isTonghua) {
        return { id: 5, mul: JsonMgr.get('att/att').datas[4].multiple };
    }
    // --- 顺子
    if (isShunzi) {
        return { id: 6, mul: JsonMgr.get('att/att').datas[5].multiple };
    }
    // --- 三条
    if (alikeCount[3] === 1) {
        return { id: 7, mul: JsonMgr.get('att/att').datas[6].multiple };
    }
    // --- 两对
    if (alikeCount[2] === 2) {
        return { id: 8, mul: JsonMgr.get('att/att').datas[7].multiple };
    }

    //--- 一对
    if (alikeCount[2] === 1 && alikeCount[1] === 3) {
        let isJArr = [];
        let temp = false;
        let isJ = arr.filter(m => m >= 10 || m == 0);
        isJ.forEach(m => {
            if (!isJArr.includes(m)) {
                isJArr.push(m);
            } else {
                temp = true;
            }
        });
        if (temp) {
            return { id: 9, mul: JsonMgr.get('att/att').datas[9].multiple };
        }
        return { id: -1, mul: 0 };
    }
    return { id: -1, mul: 0 };
}

//获取牌的花色
export const getPokerFlowerColor = function (poker) {
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

/**计算21点最优点数 */
export function calculateDot(dotArr: number[]) {
    let isA = [0, 13, 26, 39];//牌A
    let allDot = 0;//最优
    let worstDot = 0;//最差
    let temp = 0;
    dotArr.forEach(m => {
        if (isA.includes(m)) {//查看牌型中A有几张
            temp++;
        } else {
            let dot = m % 13;
            allDot += (dot > 9 ? 10 : dot + 1);
            worstDot += (dot > 9 ? 10 : dot + 1);
        }
    });

    //计算最优解
    if (temp) {//有A
        if (allDot < 21) {//除A以外的所有点数小于21点
            let surplusDot = 21 - allDot;
            let ADot = 0;
            let num = surplusDot % 11;
            if (surplusDot == 11) {
                if (temp == 1) {
                    ADot += 11;
                } else {
                    for (let i = 0; i < temp; i++) {
                        ADot += 1;
                    }
                }
            } else if (surplusDot > 11) {
                if (num >= temp) {
                    for (let i = 0; i < temp; i++) {
                        if (i == 0) {
                            ADot += 11;
                        } else {
                            ADot += 1;
                        }
                    }
                } else {
                    for (let i = 0; i < temp; i++) {
                        ADot += 1;
                    }
                }
            } else if (surplusDot < 11) {
                for (let i = 0; i < temp; i++) {
                    ADot += 1;
                }
            }
            allDot += ADot;

            //计算最差点数
            let Dotnew = 0;
            for (let i = 0; i < temp; i++) {
                Dotnew += 1;
            }
            worstDot += Dotnew;

            if (allDot != worstDot) {
                return [allDot, worstDot];
            }
            return [allDot];
        } else {//除A外的所有点数大于或等于21点爆牌
            let Dotnew = 0;
            for (let i = 0; i < temp; i++) {
                Dotnew += 1;
            }
            allDot += Dotnew;
            return [allDot];
        }
    } else {//没有A
        return [allDot];
    }
}

//根据余数生成所有指定的牌
export const createPoker = function (num: number | number[]) {
    let pokerArr = [];
    let Numbers;
    if (Array.isArray(num)) {
        Numbers = num;
    } else {
        Numbers = [num];
    }

    Numbers.forEach(m => {
        for (let i = 0; i < 4; i++) {
            pokerArr.push(13 * i + m);
        }
    });
    return pokerArr;
}
// =========================================三公===================================================
// 获取三公 牌型
export const getCardTypeBySg = function (cards) {
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
        return { count: 12 };
    }
    // 11小三公
    if (map[0].count === 3) {
        return { count: 11 };
    }
    // 10混三公
    if (map.every(m => m.id > 10)) {
        return { count: 10 };
    }
    // 正常点数
    return { count: total % 10 };
};

// // 获取倍数最大的
// export function getMaxmulNums<T extends any>(list: T[]) {
//     if (list.length === 0) {
//         return list;
//     }
//     list.sort((a, b) => b.mul - a.mul);
//     const maxMul = list[0].mul;
//     if (maxMul === 0) {
//         return [];
//     }
//     return list.filter(m => m.mul === maxMul);
// };

// 比牌 两个人比
export const bipaiSoleBySg = function (fight1, fight2) {
    // 比点数
    if (fight1.cardType.count !== fight2.cardType.count) {
        return fight1.cardType.count > fight2.cardType.count;
    } else if (fight1.cardType.count === 0 && fight2.cardType.count === 0) {// 如果都是0点 某人判庄赢
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

// 三公比牌 2
export const bipaiSoleBySg2 = function (cards1, cards2) {
    // 比点数
    if (cards1.cardType !== cards2.cardType) {
        return cards1.cardType > cards2.cardType;
    }

    const arr1 = cards1.cards.slice(), arr2 = cards2.cards.slice();
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
}

// 获取翻倍
export const getDoubleByConfigBySg = function (player, mulrules) {
    const count = player.cardType.count;
    // 再找普通翻倍的
    for (let key in mulrules) {
        if (+key === count) {
            return mulrules[key];
        }
    }
    return 1;
};

/**获取翻倍 */
// export function getDoubleByConfig(count: number) {
//     // // 先找特殊牌型
//     // if (specials) {
//     //     for (let key in specials) {
//     //         if (+key === count) {
//     //             console.log('specials[key]', specials[key], key);
//     //             return specials[key];
//     //         }
//     //     }
//     // }
//     // // 再找普通翻倍的
//     // for (let key in mulrules) {
//     //     if (+key === count) {
//     //         console.log('mulrules[key]', mulrules[key], key);
//     //         return mulrules[key];
//     //     }
//     // }
//     return 1;
// };

// 时时彩判断是否是龙虎和
// 龙返回1、 虎返回2、 和返回3
export const judgeDragonTiger = (arr) => {
    if (arr[0] === arr[arr.length - 1]) return 3;
    return arr[0] > arr[arr.length - 1] ? 1 : 2;
};

// 时时彩判断是否是豹子 顺子 对子 半顺 杂六
// 返回分别对应 1， 2， 3， 4， 5
export const judgeArrType = (arr) => {
    // 如果为豹子
    let newArr: any = new Set(arr);
    if ([...newArr].length < arr.length) {
        return [...newArr].length === 1 ? 1 : 3;
    }

    arr.sort((x, y) => x - y);
    // 如果为顺子
    newArr = arr.filter((num, index) => {
        if (index !== arr.length - 1) {
            return (++num === arr[index + 1]);
        }
        return true;
    });

    if (newArr.length === arr.length) return 2;

    // 如果是半顺
    if ((arr[0] + 1 === arr[1]) || (arr[1] + 1 === arr[2])) return 4;

    return 5;
};

// 时时彩判断牛牛
// 0代表无牛
export const judgeArrType_NN = (arr: any[]) => {
    let num = 0, newArr;
    const idx = arr.map((number, index) => index);
    for (let i = 0, len = arr.length; i < len - 2; i++) {
        for (let j = i + 1; j < len - 1; j++) {
            for (let d = j + 1; d < len; d++) {
                if ([arr[i], arr[j], arr[d]].reduce((x, y) => x + y) % 10 === 0) {
                    const index = [i, j, d];
                    let newNum = idx.filter(num => !index.includes(num)).map(inx => arr[inx]).reduce((x, y) => x + y);
                    if (newNum === 0) newNum = 10;
                    if (newNum > num) num = newNum; newArr = [arr[i], arr[j], arr[d]];
                }
            }
        }
    }

    return num > 10 ? num % 10 : num;
};

// 时时彩梭哈计算
// 0 五条 1 四条 2 葫芦 3 顺子 4 三条 5 两对 6 一对 7 散牌
export const judgeArrType_SH = (arr) => {
    if (arr.every(num => num === arr[0])) return 0;

    let newArr: any = [...(new Set(arr))];
    if (newArr.length === 2) {
        return newArr.map(n => (arr.filter(num => n === num)).length).includes(4) ? 1 : 2;
    }

    if (newArr.length === 3) {
        return newArr.map(n => (arr.filter(num => n === num)).length).includes(3) ? 4 : 5;
    }

    if (newArr.length === 4) return 6;

    if (newArr[newArr.length - 1] - newArr[0] === 4) return 3;

    return 7;
};

/**
 * 过滤结果
 * @param result   结果集
 * @param players  玩家
 * @param convenienceProperty  便利属性
 * @param filterType  过滤玩家类型4 跳过 0 1 2 玩家 机器人
 */
export function filterLotteryResult(result, players, convenienceProperty, filterType: number) {
    // 如果结果为4则跳过
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
};

/**
 * 转换牌 第一位为花色 第二位为值 值以十六进制表示 例 黑桃四: 转换为 34
 * 如果传过来的是数组如 红桃三，黑桃Q 转换为233C
 * 花色
 * 52 - 53 大小王转换为 4
 * 0 - 12 黑桃 花色转换 3
 * 13 - 25 红桃 花色转换为 2
 * 26 - 38 梅花 花色转换 1
 * 39 - 51 方块 花色转换为 0
 * 牌值
 * 1 - 10 J Q K 以16进制表示 J-B Q-C K-D
 * 小王 为 41 大王为42
 * @param cards
 */
export function conversionCards(cards: number[] | number): string {
    if (Array.isArray(cards)) {
        return cards.map(c => {
            return `${conversionColor(c)}${(c % 13 + 1).toString(16)}`;
        }).reduce((c1, c2) => c1 + c2, "");

    }

    return `${conversionColor(cards)}${(cards % 13 + 1).toString(16)}`;
}

/**
 * 转换花色
 * @param card
 */
function conversionColor(card: number): string {
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


/**
 * 原始牌转字符
 * @param arr
 */
export function cardsConversionStr(arr: number[]) {
    return arr.map(c => {
        const card = c % 13 + 1;
        let color, value;

        switch (Math.floor(c / 13)) {
            case 0: color = '黑桃'; break;
            case 1: color = '红桃'; break;
            case 2: color = '梅花'; break;
            case 3: color = '方块'; break;
        }


        if (card === 11) {
            value = 'J'
        } else if (card === 1) {
            value = 'A'
        } else if (card === 12) {
            value = 'Q'
        } else if (card === 13) {
            value = 'K'
        } else {
            value = card.toString()
        }

        return color + value
    });
}
