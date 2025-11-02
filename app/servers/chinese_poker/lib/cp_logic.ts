'use strict'
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
    /**铁支7  */
    tiezhi,
    /**同花顺8 */
    tonghuashun
}

export enum SpecialType {
    /**没得  */
    N0 = 0,
    /**顺子  */
    N1,
    /**三同花  */
    N2,
    /**六对半  */
    N3,
    /**五对三条  */
    N4,
    /**四套三条  */
    N5,
    /**凑一色：牌中全黑或全红。  */
    N6,
    /**全小  */
    N7,
    /**全大：13张皆为8~K或A。  */
    N8,
    /**三分天下：牌中有三组铁支。 */
    N9,
    /**三同花顺  */
    N10,
    /**十二皇族：全部牌皆为JQKA。 */
    N11,
    /**一条龙：A.K.Q.J.10.9.8.7.6.5.4.3.2各一张。  */
    N12,
    /**如果是顺子又是同花 --- 至尊清龙：全同花的一条龙 */
    N13,
}
/**
 * 获取一副牌，不含大王小王 count =几副 默认1
 * 0 - 12 // 黑桃 1 - 13
 * 13 - 25 // 红桃 1 - 13
 * 26 - 38 // 梅花 1 - 13
 * 39 - 51 // 方块 1 - 13
 * @param count 
 */
export function getPai(count = 1) {
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
export function judgeCards(cards: number[]) {
    const config = ['黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
        '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
        '梅A', '梅2', '梅3', '梅4', '梅5', '梅6', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K',
        '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
    ];
    const type_config = [
        "高牌",
        "一对1",
        "两对2",
        "三条3",
        "顺子4",
        "同花5",
        "葫芦6",
        "铁支7",
        "同花顺8",
    ]
    const arr: string[] = [];
    cards.forEach(card => {
        arr.push(config[card]);
    });
    let type = type_config[detectionPoker(cards)];
    return { arr, type };
};
/**
 * @同花顺8> 铁支7>葫芦6>同花5>顺子4>三条3>两对2>一对1高牌0
 * @铁支=四张相同数字的牌,外加一单张。四条
 * @葫芦： 五张中有三张相同数字的牌及另外两张相同数字的牌。若别家也有此牌型，则比三张数字大小。
 * @同花：五张牌是同一花色中任意五张牌。若遇相同则先比这副牌中最大的一支，如又相同再比第二支、依此类推。如牌型全部相同则以花色大小轮输赢。黑桃>；红心>；梅花>；方块。
 * cards 判断五张牌是什么牌
 * @param cards 
 */
export function detectionPoker(cards: number[]) {
    const arr = cards.map(m => m % 13);
    arr.sort((a, b) => a - b);
    // 是否顺子
    const isShunzi = checkShunzi(arr);
    // 是否同花
    const tempH = Math.floor(cards[0] / 13);
    const isTonghua = cards.every(m => tempH === Math.floor(m / 13));
    // 相同的个数
    const alikeCount = checkAlike(arr);
    // 如果是顺子又是同花 --- 同花顺
    if (isShunzi && isTonghua) {
        return CardsType.tonghuashun
    }
    // --- 铁支（铁支）四条
    if (alikeCount[4] === 1) {
        return CardsType.tiezhi;
    }
    // --- 葫芦
    if (alikeCount[3] === 1 && alikeCount[2] === 1) {
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
    if (alikeCount[3] === 1) {
        return CardsType.santiao;
    }
    // --- 两对
    if (alikeCount[2] === 2) {
        return CardsType.twodui;
    }
    // --- 一对
    if (alikeCount[2] === 1 && alikeCount[1] === 3) {
        return CardsType.dui1;
    }
    return CardsType.gaopai;
}


/**找出特殊牌的牌 A已经处理 */
export function specialPoker(type: number, arr: number[]) {
    let arr_ = arr.slice();
    arr_ = arr_.map(m => m % 13 === 0 ? 14 : m % 13);
    let arrs = [];
    if (type == 1 || type == 3 || type == 7) {//一对,三条,四条
        let value;
        arr_.forEach(m => {
            if (!arrs.includes(m)) {
                arrs.push(m);
            } else {
                value = m;
            }
        });
        return value;
    } else if (type == 2) {//两对
        let arr2 = [];
        arr_.forEach(m => {
            if (!arrs.includes(m)) {
                arrs.push(m);
            } else {
                arr2.push(m);
            }

        });
        return arr2;
    } else if (type == 6) {//葫芦
        const obj = {};
        for (let i = 0; i < arr_.length; i++) {
            if (obj[arr_[i]]) {
                obj[arr_[i]] += 1;
            } else {
                obj[arr_[i]] = 1;
            }
        }
        let num;
        for (let x in obj) {
            if (obj[x] == 3) {
                num = x;
            }
        }
        return num;
    }
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

/**
 * 返回牌面值
 * @param card 1-54
 */
export function getCardValue(card: number) {
    let t = card % 13 == 0 ? 14 : card % 13 + 1;
    return t
}

/**
 * 比较两个牌 - 单人
 * @param cardtype1 
 * @param cardtype2 
 */
export function bipai(cardtype1: { type: number, cards: number[] }, cardtype2: { type: number, cards: number[] }) {
    if (cardtype1.type !== cardtype2.type) {
        return cardtype1.type - cardtype2.type;
    }
    //排序1
    const arr1 = cardtype1.cards.slice().sort((a, b) => getCardValue(b) - getCardValue(a));
    //排序2
    const arr2 = cardtype2.cards.slice().sort((a, b) => getCardValue(b) - getCardValue(a));
    //类型相同
    // 依次比较单张牌的大小
    if (cardtype1.type === CardsType.gaopai || cardtype1.type == CardsType.tonghua) {
        let cardNum1 = 0, cardNum2 = 0;
        for (let i = 0; i < arr1.length; i++) {
            cardNum1 = getCardValue(arr1[i]);
            cardNum2 = getCardValue(arr2[i]);
            if (cardNum1 !== cardNum2) {
                return cardNum1 - cardNum2;
            }
        }
        return 0;
    }//顺子=4 同花=5 同花顺= 8 
    else if (cardtype1.type == CardsType.tonghuashun || cardtype1.type == CardsType.shunzi) {
        let cardNum1 = 0, cardNum2 = 0;
        let str1 = arr1.map(c => getCardValue(c)).toString();
        if (str1 == `14,5,4,3,2`) {
            arr1.unshift(arr1.pop());
        }
        let str2 = arr2.map(c => getCardValue(c)).toString();
        if (str2 == `14,5,4,3,2`) {
            arr2.unshift(arr2.pop());
        }
        for (let i = 0; i < arr1.length; i++) {
            cardNum1 = getCardValue(arr1[i]);
            cardNum2 = getCardValue(arr2[i]);
            if (cardNum1 != cardNum2) {
                return cardNum1 - cardNum2;
            }
        }
        //比较花色5 黑桃>；红心>；梅花>；方块
        for (let i = 0; i < arr1.length; i++) {
            const tempH1 = getPokerFlowerColor(arr1[i]);
            const tempH2 = getPokerFlowerColor(arr2[i]);
            if (tempH1 != tempH2) {
                return tempH2 - tempH1;
            }
        }
        return 0;
    }
    // 1=一对 3=三条 6=葫芦 7=铁支 先比较一对的大小 在比较单张的
    else if (cardtype1.type == CardsType.dui1 ||
        cardtype1.type == CardsType.santiao ||
        cardtype1.type == CardsType.hulu ||
        cardtype1.type == CardsType.tiezhi) {
        let yiduiPoker1 = specialPoker(cardtype1.type, arr1);
        let yiduiPoker2 = specialPoker(cardtype2.type, arr2);
        if (yiduiPoker1 === yiduiPoker2) {//如果对子一样 比单牌
            let pokerSize1 = countPokerDot(arr1, yiduiPoker1);
            let pokerSize2 = countPokerDot(arr2, yiduiPoker2);
            for (let i = 0; i < pokerSize1.length; i++) {
                if (pokerSize1[i] != pokerSize2[i]) {
                    return pokerSize1[i] - pokerSize2[i];
                }
            }//杂牌也一样返回0
            return 0;
        }
        return yiduiPoker1 - yiduiPoker2;
    }
    // 两对 
    else if (cardtype1.type === CardsType.twodui) {
        let liangduiPoker1 = specialPoker(cardtype1.type, arr1);
        let liangduiPoker2 = specialPoker(cardtype2.type, arr2);

        //首先在两对里面找出最大的一对
        let liangdui1 = countPokerLiangdui(arr1, liangduiPoker1);
        let liangdui2 = countPokerLiangdui(arr2, liangduiPoker2);
        if (liangdui1.typeSize == liangdui2.typeSize) {
            if (liangdui1.typeSizeLiangdui == liangdui2.typeSizeLiangdui) {
                return liangdui1.pokerSize - liangdui2.pokerSize;
            }
            return liangdui1.typeSizeLiangdui - liangdui2.typeSizeLiangdui;
        }
        return liangdui1.typeSize - liangdui2.typeSize;

    }
    return 0;
};

/**获取牌型 返回最大的牌 和 牌的类型{cards: cards, type: type}; */
export function getCardtype(hold, publicCards) {
    if (!hold) {
        return null;
    }
    let res = [], type = -1, cards = null, typeSize = 0;
    perm(hold.concat(publicCards), res);
    for (let i = res.length - 1; i >= 0; i--) {
        const temp = detectionPoker(res[i]);
        const maxPoker = bipai({ cards: res[i], type: temp }, { cards: cards, type: type });
        if (temp > type || (temp == type && maxPoker > 0)) {
            type = temp;
            cards = res[i];
        }
    }
    if (type == 0 || type == 5) {//高牌，同花
        typeSize = cards[cards.length - 1] % 13 == 0 ? 14 : cards[0] % 13;
    }
    return { cards: cards, type: type };
};
/**返回一道<二道<三道;所有组合 */
export function getCardArr(hold: number[], type: number) {
    if (!hold) {
        return null;
    }
    let res: number[][] = [];
    let type_arr: number[][] = [];
    res = combine(hold, 5);
    for (let i = res.length - 1; i >= 0; i--) {
        const temp = detectionPoker(res[i]);
        if (temp === type) {
            type_arr.push(res[i]);
        }
    }
    return type_arr;
};

/**找到牌最大的玩家 arr 玩家对象，type =‘type’ */
export const getMaxPlayer = function (arr: { single1: number, single2: number, typeSize: number, type: number }[], type: number) {
    let maxType = getMax(arr, type);
    let typeArr = arr.filter(m => m.type == maxType.type);

    if (typeArr.length > 1) {
        let typeSize = getMax(typeArr, 'typeSize');
        let typeSizeArr = arr.filter(m => m.typeSize == typeSize.typeSize);

        if (typeSizeArr.length > 1) {
            let single1 = getMax(typeSizeArr, 'single1');
            let single1Arr = arr.filter(m => m.single1 == typeSize.single1);

            if (single1Arr.length > 1) {
                let single2 = getMax(single1Arr, 'single2');
                let single2Arr = arr.filter(m => m.single2 == typeSize.single2);

                if (single2Arr.length > 1) {
                    return getMax(single2Arr, 'single3');
                }
                return single2

            }
            return single1;

        }
        return typeSize;
    }
    return maxType;
}
function combine(arr: number[], num: number) {
    let r: number[][] = [];
    const fn = (t: number[], a: number[], n: number) => {
        if (n == 0) return r.push(t);
        for (let i = 0, l = a.length; i <= l - n; i++) {
            fn(t.concat(a[i]), a.slice(i + 1), n - 1);
        }
    }
    fn([], arr, num);
    return r;
};

function perm(arr: number[], res: number[]) {
    const fn = (source, result) => {
        if (result.length === 5) {
            res.push(result);
        } else {
            for (let i = 0; i < source.length; i++) {
                fn(source.slice(i + 1), result.concat(source[i]));
            }
        }
    };
    fn(arr, []);
};

/**是否顺子 */
export function checkShunzi(cards: number[]) {
    // 如果第一张是A 最后一张是K  那么就从第二张开始
    let i = (cards[0] === 0 && cards[4] === 12) ? 1 : 0;
    for (; i < cards.length - 1; i++) {
        if (cards[i] + 1 !== cards[i + 1]) {
            return false;
        }
    }
    return true;
};

/**检查相同的 */
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

/**找出数组对象中最大值 */
export function getMax(arr: any[], key) {
    arr.sort((a, b) => {
        return b[key] - a[key]
    });
    return arr[0];
}
/**返回杂牌数组 */
export function countPokerDot(arr: number[], noExit: number) {
    let num = [];
    arr.forEach(n => {
        if (![noExit].includes(n % 13)) {
            num.push(n % 13 == 0 ? 14 : n % 13);
        }
    });
    return num;
}
/**
 * [2,2,3,3,9] [2,3]//传入的是 已经%13的值
 * @param arr 
 * @param pokerType 
 */
export function countPokerLiangdui(arr: number[], pokerType) {
    let obj = {
        typeSize: 0,//大对子 大小
        typeSizeLiangdui: 0,// 小对子大小
        pokerSize: 0//单张大小
    };
    let max = Math.max(pokerType[0], pokerType[1]);
    let min = Math.min(pokerType[0], pokerType[1]);
    obj.typeSize = max;// % 13 == 0 ? 14 : max % 13;
    obj.typeSizeLiangdui = min;// % 13 == 0 ? 14 : min % 13;
    arr.forEach(n => {
        if (![pokerType[0], pokerType[1]].includes(n % 13)) {
            obj.pokerSize = n % 13 == 0 ? 14 : n % 13;
        }
    });
    return obj;
}

/**计算特殊牌型 传入玩家对象 */
export function countAlikePoker(player: { cards: number[], type1?: number, type2?: number, type3?: number }) {
    const cards = player.cards.slice();
    const arr = cards.map(m => m % 13);
    arr.sort((a, b) => a - b);
    // 是否顺子
    const isShunzi = checkShunzi(arr);
    // 是否同花
    const tempH = Math.floor(cards[0] / 13);
    const isTonghua = cards.every(m => tempH === Math.floor(m / 13));
    // 如果是顺子又是同花 --- 至尊清龙：全同花的一条龙
    if (isShunzi && isTonghua) {
        return SpecialType.N13;
    }
    if (isShunzi) {//一条龙：A.K.Q.J.10.9.8.7.6.5.4.3.2各一张。
        return SpecialType.N12;
    }
    const huangzhu12 = arr.every(m => m == 0 || m == 10 || m == 11 || m == 12);
    if (huangzhu12) {//十二皇族：全部牌皆为JQKA。
        return SpecialType.N11;
    }
    //三同花顺：第2.3道为同花顺，第1道亦为3张同花色且数字连续。
    if (player.type1 == 8 && player.type2 == 8 && player.type3 == 8) {
        return SpecialType.N10;
    }
    // 相同的个数
    const alikeCount = checkAlike(arr);
    if (alikeCount[4] == 3) {//三分天下：牌中有三组铁支。
        return SpecialType.N9;
    }
    //全大：13张皆为8~K或A。
    const allBig = arr.every(m => m == 0 || m == 7 || m == 8 || m == 9 || m == 10 || m == 11 || m == 12);
    if (allBig) {
        return SpecialType.N8;
    }
    //全小
    const allSmall = arr.every(m => m == 1 || m == 2 || m == 3 || m == 4 || m == 5 || m == 6 || m == 7);
    if (allSmall) {
        return SpecialType.N7;
    }
    //凑一色：牌中全黑或全红。
    const Color = getPokerFlowerColor(cards[0]);
    if (isTonghua && (Color === 0 || Color === 1)) {
        return SpecialType.N6;
    }
    //四套三条：4组三条加1张杂牌。
    if (alikeCount[3] == 4) {
        return SpecialType.N5;
    }
    //五对三条
    if (alikeCount[3] == 1 && alikeCount[2] == 5) {
        return SpecialType.N4;
    }
    //六对半
    if (alikeCount[2] == 6) {
        return SpecialType.N3;
    }
    //三同花
    if (player.type1 == 5 && player.type2 == 5 && player.type3 == 5) {
        return SpecialType.N2;
    }
    //三顺子：中道及尾道为顺子，首道亦为三张连续数字（QKA,KA2不算在内
    if (player.type1 == 4 && player.type2 == 4 && player.type3 == 4) {
        return SpecialType.N1;
    }
    return SpecialType.N0;
}