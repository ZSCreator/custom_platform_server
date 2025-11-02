


/**
 * 获取一副牌，不含大王小王 count =几副 默认1
 * 0 - 12 // 黑桃 1 - 13
 * 13 - 25 // 红桃 1 - 13
 * 26 - 38 // 梅花 1 - 13
 * 39 - 51 // 方块 1 - 13
 * @param count 
 */
export function getPai(count = 1) {
    const cards = [];
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
 * @同花顺8> 同花5>顺子4>三条3>三条2>一对1>高牌0
*  @cards 判断三张牌是什么牌 同步5张的返回
 * @param cards 0-52
 */
function detectionPoker(cards: number[]) {
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
        return 8;
    }
    // --- 同花
    if (isTonghua) {
        return 5;
    }
    // --- 顺子
    if (isShunzi) {
        return 4;
    }
    // --- 三条
    if (alikeCount[3] === 1) {
        return 3;
    }
    // --- 一对
    if (alikeCount[2] === 1 && alikeCount[1] === 1) {
        return 1;
    }
    return 0;
}
/**
 * 返回牌面值
 * @param card 1-54
 */
export function getCardValue(card: number) {
    let t = card % 13 == 0 ? 14 : card % 13;
    return t
}

/**找出特殊牌的牌 返回对子的 对子大小  */
function specialPoker(type: number, arr: number[]) {

    let arr_ = arr.slice();
    arr_ = arr_.map(m => m % 13);
    let arrs = [];
    if (type == 1 || type == 2) {//一对,三条
        let value;
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


/**比较两个牌 - 单人 >0 1>2,=0 1=2,<0 1<2 */
export function bipai(cardtype1: { cards: number[], type: number }, cardtype2: { cards: number[], type: number }) {
    if (cardtype1.type !== cardtype2.type) {
        return cardtype1.type - cardtype2.type;
    }
    cardtype1.cards.sort((a, b) => {
        return getCardValue(b) - getCardValue(a)
    });//当前这组牌 从大到小排序
    cardtype2.cards.sort((a, b) => {
        return getCardValue(b) - getCardValue(a)
    });//上一组牌

    // 依次比较单张牌的大小
    if (cardtype1.type === 0) {
        let cardNum1 = 0, cardNum2 = 0;
        //第三张牌开始
        cardNum1 = getCardValue(cardtype1.cards[0]);
        cardNum2 = getCardValue(cardtype2.cards[0]);
        if (cardNum1 !== cardNum2) {
            return cardNum1 - cardNum2;
        }
        //第二张
        cardNum1 = getCardValue(cardtype1.cards[1]);
        cardNum2 = getCardValue(cardtype2.cards[1]);
        if (cardNum1 !== cardNum2) {
            return cardNum1 - cardNum2;
        }
        //第一张
        cardNum1 = getCardValue(cardtype1.cards[2]);
        cardNum2 = getCardValue(cardtype2.cards[2]);
        if (cardNum1 !== cardNum2) {
            return cardNum1 - cardNum2;
        }
        return 0;
    }
    if (cardtype1.type === 4 || cardtype1.type === 5 || cardtype1.type === 8) {
        let cardNum1 = 0, cardNum2 = 0;
        //第三张牌开始
        cardNum1 = getCardValue(cardtype1.cards[0]);
        cardNum2 = getCardValue(cardtype2.cards[0]);
        if (cardNum1 !== cardNum2) {
            return cardNum1 - cardNum2;
        }
        //第二张
        cardNum1 = getCardValue(cardtype1.cards[1]);
        cardNum2 = getCardValue(cardtype2.cards[1]);
        if (cardNum1 !== cardNum2) {
            return cardNum1 - cardNum2;
        }
        //第一张
        cardNum1 = getCardValue(cardtype1.cards[2]);
        cardNum2 = getCardValue(cardtype2.cards[2]);
        if (cardNum1 !== cardNum2) {
            return cardNum1 - cardNum2;
        }
        //比较花色3 黑桃>；红心>；梅花>；方块
        let tempH1 = Math.floor(cardtype1.cards[2] / 13);
        let tempH2 = Math.floor(cardtype2.cards[2] / 13);
        if (tempH1 !== tempH2) {
            return tempH2 - tempH1;
        }
        //比较花色2
        tempH1 = Math.floor(cardtype1.cards[1] / 13);
        tempH2 = Math.floor(cardtype2.cards[1] / 13);
        if (tempH1 !== tempH2) {
            return tempH2 - tempH1;
        }
        //比较花色1
        tempH1 = Math.floor(cardtype1.cards[0] / 13);
        tempH2 = Math.floor(cardtype2.cards[0] / 13);
        if (tempH1 !== tempH2) {
            return tempH2 - tempH1;
        }
    }
    // 一对 炸弹 先比较一对的大小 在比较单张的
    if (cardtype1.type === 1 || cardtype1.type === 3) {
        let yiduiPoker1 = specialPoker(cardtype1.type, cardtype1.cards);
        let yiduiPoker2 = specialPoker(cardtype2.type, cardtype2.cards);

        if (yiduiPoker1 == yiduiPoker2) {//如果对子一样 比单牌
            let pokerSize1 = countPokerDot(cardtype1.cards, yiduiPoker1);
            let pokerSize2 = countPokerDot(cardtype2.cards, yiduiPoker2);
            return pokerSize1 - pokerSize2;
        }
        //处理A
        yiduiPoker1 = yiduiPoker1 % 13 == 0 ? 14 : yiduiPoker1 % 13;
        yiduiPoker2 = yiduiPoker2 % 13 == 0 ? 14 : yiduiPoker2 % 13;
        return yiduiPoker1 - yiduiPoker2;
    }
    return 0;
};

/**
 * 获取牌型 返回最大的牌 和 牌的类型
 * @param hold 
 * @param publicCards 
 */
export function getCardtype(hold: number[], publicCards?: number[]) {
    if (!hold) {
        return null;
    }
    let res: number[][] = [], type = -1, cards: number[] = null, typeSize = 0;
    perm(hold.concat(publicCards), res);
    for (let i = res.length - 1; i >= 0; i--) {
        const temp = detectionPoker(res[i]);
        const maxPoker = bipai({ cards: res[i], type: temp }, { cards: cards, type: type });
        if (temp > type || (temp == type && maxPoker > 0)) {
            type = temp;
            cards = res[i];
        }
    }
    return { cards: cards, type: type };
};

/**找到牌最大的玩家 arr 玩家对象，type =‘type’ */
export const getMaxPlayer = function (arr, type) {
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

/**是否顺子 */
function checkShunzi(cards: number[]) {
    // 如果第一张是A 最后一张是K  那么就从第二张开始
    let i = (cards[0] === 0 && cards[2] === 12) ? 1 : 0;
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

/**找出数组对象中最大值 */
function getMax(arr: any[], key) {
    arr.sort((a, b) => {
        return b[key] - a[key]
    });
    return arr[0];
}

/**返回单个牌 */
function countPokerDot(arr: number[], noExit: number) {
    let num = 0;
    arr.forEach(n => {
        if (![noExit].includes(n % 13)) {
            num += n % 13 == 0 ? 14 : n % 13;
        }
    });
    return num;
}