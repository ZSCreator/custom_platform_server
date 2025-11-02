
// 1 - 13  // 黑桃 A 2 - K
// 14 - 26 // 红桃 A 2 - K
// 27 - 39 // 梅花 A 2 - K
// 40 - 52 // 方块 A 2 - K
// 52大王

/**牛牛牌型 */
export enum CardsType {
    /**无牛 5张手牌里任意三张点数之和都不能成为10的整数倍*/
    niuniu_00 = 0,
    /**牛一 5张手牌里有三张点数之和为10的整数倍，剩余两张牌点数之和不为10的整数倍，取和的个位数即为牛几*/
    niuniu_01,
    /**牛二 */
    niuniu_02,
    /**牛三 */
    niuniu_03,
    /**牛四 */
    niuniu_04,
    /**牛五 */
    niuniu_05,
    /**牛六 */
    niuniu_06,
    /**牛七 */
    niuniu_07,
    /**牛八 */
    niuniu_08,
    /**牛九 */
    niuniu_09,
    /**牛牛 5张手牌里有三张点数之和为10的整数倍，剩余两张牌点数之和也为10的整数倍。*/
    niuniu_10,
    /**四花牛：5张手牌里有4张任意的花牌，且第5张牌是10点。 */
    niuniu_11,
    /**五花牛：5张手牌都为花牌中任意牌。 */
    niuniu_12,
    /**四炸：5张手牌里有4张一样的牌，第5张随意。此时无需有牛。 */
    niuniu_13,
    /**五小牛：五张牌的点数都小于5，且点数之和小于等于10。 */
    niuniu_14,
};

/**洗牌 52张 */
export function shuffle() {
    const cards: number[] = [];
    for (let i = 1; i <= 52; i++) {// 52张牌
        cards.push(i);
    }
    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};
export const pukes = ["", '黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
    '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
    '梅A', '梅2', '梅3', '梅4', '梅5', '梅6', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K',
    '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
];
/**
 * 判断牛几
 * 点数：A,2,3,4,5,6,7,8,9,10为牌面点数，J,Q,K称花牌都作10点
 * 五小牛>四炸>五花牛>四花牛>牛牛>牛九>牛八>牛七>牛六>牛五>牛四>牛三>牛二>牛一>无牛
 * @param cards 1-52
 */
export function getCardType(theCards: number[]) {
    /**牛X */
    let cow = 0;
    /**提示那3个是牛 */
    let cows: number[] = [];
    let total = 0;
    let arr_2: { id: number, count: number }[] = [];
    // 全部加1(算牛用J Q K当10算 A 算1)
    const arr_1 = theCards.map(card => {
        let ret = getCardValue(card);
        let value = arr_2.find(m => m.id === ret);
        value ? (value.count += 1) : arr_2.push({ id: ret, count: 1 });
        ret = ret >= 10 ? 10 : ret;
        total += ret;
        return ret;
    });

    if (total <= 10 && arr_1.every(c => c < 5)) {
        return { count: CardsType.niuniu_14, cows: [0, 1, 2] };
    }
    // 13炸弹：4张相同点数的牌+1张散牌
    if (arr_2.find(m => m.count == 4)) {
        return { count: CardsType.niuniu_13, cows: [0, 1, 2] };
    }
    // 12五花牛：5张全是J,Q,K
    if (arr_1.every(card => card >= 11)) {
        return { count: CardsType.niuniu_12, cows: [0, 1, 2] };
    }
    if (arr_1.reduce((total, v) => total += v >= 11 ? 1 : 0, 0) == 4 && arr_1.includes(10)) {
        return { count: CardsType.niuniu_11, cows: [0, 1, 2] };
    }
    // 正常牛
    for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 5; j++) {
            if ((total - arr_1[i] - arr_1[j]) % 10 == 0) {
                // console.warn(total, arr_1[i], arr_1[j]);
                cows = [0, 1, 2, 3, 4].filter(m => m !== i && m !== j);
                cow = (arr_1[i] + arr_1[j]) % 10;
                cow = cow === 0 ? 10 : cow;
            }
        }
    }
    // cow = cow === 0 ? 10 : cow;
    // cow = cow === -1 ? 0 : cow;
    return { count: cow, cows };
}

/**比牌
 * @param theCards1 1-52
 * @param theCards2 1-52
 */
export function bipai(theCards1: number[], theCards2: number[]) {
    let fight1 = getCardType(theCards1);
    let fight2 = getCardType(theCards2);
    // 一样大 比点数
    if (fight1.count === fight2.count) {
        const arr1 = theCards1.slice();
        const arr2 = theCards2.slice();

        arr1.sort((a, b) => {
            let ret = getCardValue(b) - getCardValue(a);
            if (ret == 0) {
                ret = getCardColour(b) - getCardColour(a)
                return ret;
            }
            return ret;
        });
        arr2.sort((a, b) => {
            let ret = getCardValue(b) - getCardValue(a);
            if (ret == 0) {
                ret = getCardColour(b) - getCardColour(a)
                return ret;
            }
            return ret;
        });

        const max1 = getCardValue(arr1[0]), max2 = getCardValue(arr2[0]);
        // 点数一样 比花色
        if (max1 === max2) {
            return getCardColour(arr1[0]) > getCardColour(arr2[0]);
        }
        return max1 > max2;
    }
    return fight1.count > fight2.count;
}


/**
 * 返回牌面值
 * @param card 1-54
 */
export function getCardValue(card: number) {
    let t = card % 13;//1:A 2:2 13:K
    if (t == 0) {
        t = 13;
    }
    return t;
};

/**
 * 获取花色
 * @param card 1-54
 * @returns 黑红梅方
 */
export function getCardColour(poker: number) {
    if (poker >= 1 && poker <= 13) {
        return 4;
    } else if (poker >= 14 && poker <= 26) {
        return 3;
    } else if (poker >= 27 && poker <= 39) {
        return 2;
    } else {
        return 1;
    }
}

/**翻倍 */
export function getDoubleByConfig(row: number) {
    // 无牛--牛六： 1倍
    // 牛七--牛九： 2倍
    // 牛牛：  3倍
    // 四花牛、五花牛  4倍
    // 五小牛、四炸：  5倍
    if ([0, 1, 2, 3, 4, 5, 6].includes(row)) {
        return 1;
    }
    if ([7, 8, 9].includes(row)) {
        return 2;
    }
    if ([CardsType.niuniu_10].includes(row)) {
        return 3;
    }
    if ([CardsType.niuniu_11, CardsType.niuniu_12].includes(row)) {
        return 4;
    }
    if ([CardsType.niuniu_13, CardsType.niuniu_14].includes(row)) {
        return 5;
    }
    return 1;
}
