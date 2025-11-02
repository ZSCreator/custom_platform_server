import dzpipeiConst = require('./DZpipeiConst');
export const pukes = [
    '黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
    '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
    '梅A', '梅2', '梅3', '梅4', '梅5', '梅6', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K',
    '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
];

/**
 * 返回牌面值
 * @param card 1-54
 */
export function GetGrad(card: number) {
    let t = card % 13;//1:A 2:2 13:K
    if (t == 0) {
        t = 13;
    }
    return t;
};
/**获取颜色 */
export function GetColour(card: number) {
    if (card >= 0 && card < 13) {
        return 4;
    } else if (card >= 13 && card < 26) {
        return 3;
    } else if (card >= 26 && card < 39) {
        return 2;
    } else {
        return 1;
    }
}

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

function perm(arr: number[], res: number[][]) {
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
/**获取牌型 */
export function getCardsType(hold: number[], publicCards: number[]) {
    if (!hold) {
        return null;
    }
    let res: number[][] = [], type = -1, cards: number[] = [];
    let prompt: number[] = [];
    perm(hold.concat(publicCards), res);
    for (let i = res.length - 1; i >= 0; i--) {
        const temp = detectionPoker(res[i]);
        const maxPoker = bipai({ cards: res[i], type: temp.type }, { cards: cards, type: type });
        if (temp.type > type || (temp.type == type && maxPoker > 0)) {
            type = temp.type;
            cards = res[i];
            prompt = temp.prompt;
        }
    }
    return { cards: cards, type: type, prompt: prompt };
};

/**cards
 *  判断五张牌是什么牌 
 * 0高牌|1对子|2两队|3三条|4顺子|5同花|6葫芦|7四条|8同花顺|9皇家同花顺
 * 前端需要提升 对子是哪2张牌 类似
 * */
export function detectionPoker(cards: number[]) {
    const theCards = cards.map(c => c).sort((a, b) => a % 13 - b % 13);
    const arr = theCards.map(m => m % 13);
    // arr.sort((a, b) => a - b);
    // 是否顺子
    const isShunzi = cards.length >= 4 && checkShunzi(arr);
    // 是否同花
    const tempH = Math.floor(theCards[0] / 13);
    const isTonghua = cards.length >= 4 && theCards.every(m => tempH === Math.floor(m / 13));
    // 相同的个数
    const alikeCount = checkAlike(arr);
    // 如果是顺子又是同花而且第一个还是10  --- 皇家同花顺
    if (isShunzi && isTonghua && arr[0] === 0 && arr[4] === 12) {
        return { type: 9, prompt: theCards };
    }
    // 如果是顺子又是同花 --- 同花顺
    if (isShunzi && isTonghua) {
        return { type: 8, prompt: theCards };
    }
    // --- 四条（炸弹）
    const res7 = alikeCount.find(c => c.count == 4);
    if (res7) {
        return { type: 7, prompt: theCards.filter((c, index) => res7.Subscript.includes(index)) };
    }
    // --- 葫芦
    const res6_1 = alikeCount.find(c => c.count == 3);
    const res6_2 = alikeCount.find(c => c.count == 2);
    if (res6_1 && res6_2) {
        return { type: 6, prompt: theCards };
    }
    // --- 同花
    if (isTonghua) {
        return { type: 5, prompt: theCards };
    }
    // --- 顺子
    if (isShunzi) {
        return { type: 4, prompt: theCards };
    }
    // --- 三条
    const res3 = alikeCount.find(c => c.count == 3);
    if (res3) {
        return { type: 3, prompt: theCards.filter((c, index) => res3.Subscript.includes(index)) };
    }
    // --- 两对
    const res2 = alikeCount.filter(c => c.count == 2);
    if (res2.length == 2) {
        return { type: 2, prompt: theCards.filter((c, index) => res2[0].Subscript.includes(index) || res2[1].Subscript.includes(index)) };
    }
    // --- 一对
    const res1_1 = alikeCount.filter(c => c.count == 2);
    const res1_2 = alikeCount.filter(c => c.count == 1);
    if (res1_1.length === 1 && res1_2.length === 3) {
        return { type: 1, prompt: theCards.filter((c, index) => res1_1[0].Subscript.includes(index)) };
    }
    return { type: 0, prompt: [] };
}

/**是否顺子 
 * A  10 J Q K 
 * A 2 3 4 5 
*/
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

/**比较两个牌 - 单人 */
export function bipai(cardtype1: { cards: number[], type: number }, cardtype2: { cards: number[], type: number }) {
    if (cardtype1.type != cardtype2.type) {
        return cardtype1.type - cardtype2.type;
    }
    cardtype1.cards.sort((a, b) => b % 13 - a % 13);//当前这组牌
    cardtype2.cards.sort((a, b) => b % 13 - a % 13);//上一组牌

    return sortPokerToType(cardtype1.cards) - sortPokerToType(cardtype2.cards);
};

/**检查相同的number数组返回对应数据 */
function checkAlike(theCards: number[]) {
    //[1,1,1,2,2] --->[{ key: 1, count: 3, Subscript: [ 0, 1, 2 ] }, { key: 2, count: 2, Subscript: [ 3, 4 ] }]
    const arr_1: { key: number, count: number, Subscript: number[] }[] = [];
    for (let i = 0; i < theCards.length; i++) {
        const card = theCards[i];
        let temp_arr = arr_1.find(c => c.key == card);
        if (temp_arr) {
            temp_arr.count += 1;
            temp_arr.Subscript.push(i);
        } else {
            arr_1.push({ key: card, count: 1, Subscript: [i] });
        }
    }
    // console.warn(arr_1);
    return arr_1;
};
/**计算德州牌的大小 */
export function sortPokerToType(pokers: number[]) {
    let cradType = detectionPoker(pokers);
    let poker_ = getNumPoker(pokers, cradType.type);
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
    let num = 1 * cradType.type + '' + arrs.join('');
    return Number(num);
}

/**
 * 找出指定数量的牌
 * @param pokers 
 * @param cradType 
 */
function getNumPoker(pokers: number[], cradType: number) {
    let pokers_ = pokers.map(m => m % 13);
    pokers = pokers.map(m => {
        // return m % 13 == 0 ? (cradType == 4 && pokers_.includes(0) ? m % 13 : 14) : m % 13
        /**顺子的时候 K顺 A最大,其他顺A最小 */
        return m % 13 == 0 ? (cradType == 4 && !pokers_.includes(12) ? m % 13 : 14) : m % 13
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
/**找出数组对象中最大值 */
export function getMax<T>(arr: T[], key: string) {
    arr.sort((a, b) => {
        return b[key] - a[key]
    });
    return arr[0];
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

export function getY1_4(cardsData: number[]) {
    let arr = ['', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let temp = cardsData.map(c => GetGrad(c));
    temp.sort((a, b) => b - a);
    let istonghua = GetColour(cardsData[0]) == GetColour(cardsData[1]);
    for (const c of dzpipeiConst.Robot_Y1_Y4[0]) {
        if (c.length == 3) {
            let c1 = c.substring(0, 2);
            let c3 = c.substring(2, 3);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2 && c3 == "s" && istonghua) {
                return "Y1"
            }
            if (c1 == c2 && c3 == "o" && !istonghua) {
                return "Y1"
            }
        }

        if (c.length == 2) {
            let c1 = c.substring(0, 2);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2) {
                return "Y1"
            }
        }
    }
    for (const c of dzpipeiConst.Robot_Y1_Y4[1]) {
        if (c.length == 3) {
            let c1 = c.substring(0, 2);
            let c3 = c.substring(2, 3);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2 && c3 == "s" && istonghua) {
                return "Y2"
            }
            if (c1 == c2 && c3 == "o" && !istonghua) {
                return "Y2"
            }
        }

        if (c.length == 2) {
            let c1 = c.substring(0, 2);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2) {
                return "Y2"
            }
        }
    }
    for (const c of dzpipeiConst.Robot_Y1_Y4[2]) {
        if (c.length == 3) {
            let c1 = c.substring(0, 2);
            let c3 = c.substring(2, 3);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2 && c3 == "s" && istonghua) {
                return "Y3"
            }
            if (c1 == c2 && c3 == "o" && !istonghua) {
                return "Y3"
            }
        }

        if (c.length == 2) {
            let c1 = c.substring(0, 2);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2) {
                return "Y3"
            }
        }
    }
    for (const c of dzpipeiConst.Robot_Y1_Y4[3]) {
        if (c.length == 3) {
            let c1 = c.substring(0, 2);
            let c3 = c.substring(2, 3);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2 && c3 == "s" && istonghua) {
                return "Y4"
            }
            if (c1 == c2 && c3 == "o" && !istonghua) {
                return "Y4"
            }
        }

        if (c.length == 2) {
            let c1 = c.substring(0, 2);
            let c2 = `${arr[temp[0]]}${arr[temp[1]]}`;
            if (c1 == c2) {
                return "Y4"
            }
        }
    }
    return "";
}
