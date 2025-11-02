

// 获取牌
// 0 - 12 // 黑桃 1 - 13
// 13 - 25 // 红桃 1 - 13
// 26 - 38 // 梅花 1 - 13
// 39 - 51 // 方块 1 - 13
/**生成一副牌 0-52  */
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

/**根据轮数 获取应该发牌张数
 * @Flop—同时发三张公牌
 * @Turn—发第4张牌
 * @River—发第五张牌
 */
export function getPaiCount(round: number) {
    const ROUND_COUNT = [3, 1, 1];
    return ROUND_COUNT[round] || ROUND_COUNT[0];
};

/**cards 判断五张牌是什么牌 */
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
    // 如果是顺子又是同花而且第一个还是10  --- 皇家同花顺
    if (isShunzi && isTonghua && arr[0] === 0 && arr[4] === 12) {
        return 9;
    }
    // 如果是顺子又是同花 --- 同花顺
    if (isShunzi && isTonghua) {
        return 8;
    }
    // --- 四条（炸弹）
    if (alikeCount[4] === 1) {
        return 7;
    }
    // --- 葫芦
    if (alikeCount[3] === 1 && alikeCount[2] === 1) {
        return 6;
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
    // --- 两对
    if (alikeCount[2] === 2) {
        return 2;
    }
    // --- 一对
    if (alikeCount[2] === 1 && alikeCount[1] === 3) {
        return 1;
    }
    return 0;
}


/**找出特殊牌的牌 */
export const specialPoker = function (type: number, arr: any[]) {

    let arr_ = arr.slice();
    arr_ = arr_.map(m => m % 13);
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


// 比较两个牌 - 单人
export function bipai(cardtype1, cardtype2) {
    if (cardtype1.type !== cardtype2.type) {
        return cardtype1.type - cardtype2.type;
    }
    cardtype1.cards.sort((a, b) => b % 13 - a % 13);//当前这组牌
    cardtype2.cards.sort((a, b) => b % 13 - a % 13);//上一组牌

    return sortPokerToType(cardtype1.cards) - sortPokerToType(cardtype2.cards);
};

/**获取牌型 */
export function getCardtype(hold: number[], publicCards: number[]) {
    if (!hold) {
        return null;
    }
    let res: number[][] = [], type = -1, cards: number[] = [];
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

const perm = function (arr: number[], res: number[][]) {
    const fn = (source: number[], result: number[]) => {
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
function checkShunzi(cards: number[]) {
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

/**找出数组对象中最大值 */
export function getMax<T>(arr: T[], key: string) {
    arr.sort((a, b) => {
        return b[key] - a[key]
    });
    return arr[0];
}


/**
 * 找出指定数量的牌
 * @param pokers 
 * @param cradType 
 */
function getNumPoker(pokers: number[], cradType: number) {
    let pokers_ = pokers.map(m => m % 13);
    pokers = pokers.map(m => {
        return m % 13 == 0 ? (cradType === 4 && pokers_.includes(0) ? m % 13 : 14) : m % 13
    });
    let arr = getArrNum(pokers);
    return arr;
}


/**找出数组中重复元素的个数 */
export function getArrNum(_arr: number[]) {
    let _res: number[][] = []; //
    _arr.sort(function (a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        else
            return 0;
    });
    for (let i = 0; i < _arr.length;) {
        let count = 0;
        for (let j = i; j < _arr.length; j++) {
            if (_arr[i] == _arr[j]) {
                count++;
            }
        }
        _res.push([_arr[i], count]);
        i += count;
    }
    let _newArr: { element: number, num: number }[] = [];
    for (let i = 0; i < _res.length; i++) {
        let obj: { element: number, num: number } = { element: null, num: null };
        obj.element = _res[i][0];
        obj.num = _res[i][1];
        _newArr.push(obj);
    }
    return _newArr;
}

/**计算德州牌的大小 */
export const sortPokerToType = function (pokers: number[]) {
    const pokerType = {
        9: 1000000000,
        8: 100000000,
        7: 10000000,
        6: 1000000,
        5: 100000,
        4: 10000,
        3: 1000,
        2: 100,
        1: 10,
        0: 1
    }
    let cradType = detectionPoker(pokers);
    let poker_ = getNumPoker(pokers, cradType);
    let arrs = [];
    poker_.sort((a, b) => {
        let a_ = a.num;
        let b_ = b.num;
        if (a_ == b_) {
            return b.element - a.element;
        } else {
            return b_ - a_;
        }
    });
    poker_.forEach(m => {
        for (let i = 0; i < m.num; i++) {
            arrs.push(m.element);
        }
    });
    arrs.forEach((m, i, arr) => {
        let str = m + '';
        if (str.length == 1) {
            arr[i] = '0' + m;
        }
    });
    let num = pokerType[cradType] * cradType + '' + arrs.join('');
    return Number(num);
}


