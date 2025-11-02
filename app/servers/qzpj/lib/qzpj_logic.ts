



export enum CardV {
    /**丁三 */
    ding3 = 0,
    /**二四 */
    er4,
    /**杂五 */
    za51, za52,
    /**杂七 */
    za71, za72,
    /**杂八 */
    za81, za82,
    /**杂九 */
    za91, za92,
    /**零霖六 */
    oo6,
    /**高脚七 */
    gaojiao7,
    /**红头十 */
    hongtou10,
    /**斧头 */
    futou,
    /**板凳 */
    bandeng,
    /**长三 */
    chang3,
    /**梅牌 */
    meipai,
    /**鹅牌 */
    epai,
    /**人牌 */
    renpai,
    /**地牌 */
    dipai,
    /**天牌 */
    tianpai,
};

export enum CardType {
    /**点数牌 */
    points = 0,
    /**地高九 */
    digaojiu = 1,
    /**天高九 */
    tiangaojiu,
    /**地杠 */
    digang,
    /**天杠 */
    tiangang,
    /**地王 */
    diwang,
    /**双王 */
    tianwang,
    /**杂五 */
    zawu,
    /**杂七 */
    zaqi,
    /**杂八 */
    zaba,
    /**杂九 */
    zajiu,
    /**双零霖 */
    shuangoo,
    /**双高脚 */
    shuanggaojiao,
    /**双红头 */
    shuanghongtou,
    /**双斧头 */
    shuangfutou,
    /**双板凳 */
    shuangbandeng,
    /**双长三 */
    shuangchangsan,
    /**双梅 */
    shuangmei,
    /**双鹅 */
    shuangE,
    /**双人 */
    shuangren,
    /**双地 */
    shuangdi,
    /**双天 */
    shuangtian,
    /**至尊 */
    zhizhun,
}

/**洗牌 52张 */
export function shuffle_cards() {
    const cards = [
        0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 10, 11, 11, 12, 12,
        13, 13, 14, 14, 15, 15, 16, 16,
        17, 17, 18, 18, 19, 19, 20, 20
    ];
    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};


export const pukes = [
    "丁三", '二四', '杂五1',
    '杂五2', '杂七1', '杂七2', '杂八1', '杂八2', '杂九1',
    '杂九2', '零霖六', '高脚七', '红头十', '斧头', '板凳',
    '长三', '梅牌', '鹅牌', '人牌', '地牌', '天牌'
];
export const types = [
    "点数牌", "地高九", '天高九', '地杠',
    '天杠', '地王', '双王', '杂五', '杂七', '杂八',
    '杂九', '双零霖', '双高脚', '双红头', '双斧头', '双板凳',
    '双长三', '双梅', '双鹅', '双人', '双地', '双天', '至尊'
];


export function getCardType(theCards: number[], twoStrategy = false) {
    let theCards_ = theCards.slice();
    for (let idx = 0; idx < 2; idx++) {
        if (idx == 1) {
            theCards_ = [theCards_[1], theCards_[0]];
        }
        if (theCards_.toString() == `${CardV.gaojiao7},${CardV.dipai}`) {//地高九
            return CardType.digaojiu;
        } else if (theCards_.toString() == `${CardV.za71},${CardV.tianpai}`) {//天高九
            return CardType.tiangaojiu;
        } else if (theCards_.toString() == `${CardV.za82},${CardV.dipai}`) {//地杠
            return CardType.digang;
        } else if (theCards_.toString() == `${CardV.za82},${CardV.tianpai}`) {//天杠
            return CardType.tiangang;
        } else if (theCards_.toString() == `${CardV.za92},${CardV.dipai}`) {//地王
            return CardType.diwang;
        } else if (theCards_.toString() == `${CardV.za92},${CardV.tianpai}`) {//天王
            return CardType.tianwang;
        } else if (theCards_.toString() == `${CardV.za51},${CardV.za52}`) {//杂五
            return CardType.zawu;
        } else if (theCards_.toString() == `${CardV.za71},${CardV.za72}`) {//杂七
            return CardType.zaqi;
        } else if (theCards_.toString() == `${CardV.za81},${CardV.za82}`) {//杂八
            return CardType.zaba;
        } else if (theCards_.toString() == `${CardV.za91},${CardV.za91}`) {//杂九
            return CardType.zajiu;
        } else if (theCards_.toString() == `${CardV.oo6},${CardV.oo6}`) {//双零霖
            return CardType.shuangoo;
        } else if (theCards_.toString() == `${CardV.gaojiao7},${CardV.gaojiao7}`) {//双高脚
            return CardType.shuanggaojiao;
        } else if (theCards_.toString() == `${CardV.hongtou10},${CardV.hongtou10}`) {//双红头
            return CardType.shuanghongtou;
        } else if (theCards_.toString() == `${CardV.futou},${CardV.futou}`) {//双斧头
            return CardType.shuangfutou;
        } else if (theCards_.toString() == `${CardV.bandeng},${CardV.bandeng}`) {//双板凳
            return CardType.shuangbandeng;
        } else if (theCards_.toString() == `${CardV.chang3},${CardV.chang3}`) {//双长三
            return CardType.shuangchangsan;
        } else if (theCards_.toString() == `${CardV.meipai},${CardV.meipai}`) {//双梅
            return CardType.shuangmei;
        } else if (theCards_.toString() == `${CardV.epai},${CardV.epai}`) {//双鹅
            return CardType.shuangE;
        } else if (theCards_.toString() == `${CardV.renpai},${CardV.renpai}`) {//双人
            return CardType.shuangren;
        } else if (theCards_.toString() == `${CardV.dipai},${CardV.dipai}`) {//双地
            return CardType.shuangdi;
        } else if (theCards_.toString() == `${CardV.tianpai},${CardV.tianpai}`) {//双天
            return CardType.shuangtian;
        } else if (theCards_.toString() == `${CardV.ding3},${CardV.er4}`) {//至尊
            return CardType.zhizhun;
        }
    }

    // if (twoStrategy) {
    //     let ret = getCardType([theCards[1], theCards[0]]);
    //     return ret;
    // }
    return CardType.points;
}
export function getPoints(theCards: number[]) {
    let points = 0;
    for (const card of theCards) {
        switch (card) {
            case CardV.dipai:
                points += 2;
                break;
            case CardV.ding3:
                points += 3;
                break;
            case CardV.bandeng:
            case CardV.epai:
                points += 4;
                break;
            case CardV.er4:
            case CardV.oo6:
            case CardV.chang3:
                points += 6;
                break;
            case CardV.za51:
            case CardV.za52:
                points += 5;
                break;
            case CardV.za71:
            case CardV.za72:
            case CardV.gaojiao7:
                points += 7;
                break;
            case CardV.za81:
            case CardV.za82:
            case CardV.renpai:
                points += 8;
                break;
            case CardV.za91:
            case CardV.za92:
                points += 9;
                break;
            case CardV.hongtou10:
            case CardV.meipai:
                points += 10;
                break;
            case CardV.futou:
                points += 11;
                break;
            case CardV.tianpai:
                points += 12;
                break;
            default:
                break;
        }
    }
    // let points = theCards[0] + theCards[1];
    while (points >= 10) {
        points -= 10;
    }
    return points;
}
export function getPoint(theCard: number) {
    switch (theCard) {
        case CardV.ding3:
        case CardV.er4:
            return 0;
        case CardV.za51:
        case CardV.za52:
            return 1;
        case CardV.za71:
        case CardV.za72:
            return 2;
        case CardV.za81:
        case CardV.za82:
            return 3;
        case CardV.za91:
        case CardV.za92:
            return 4;
        case CardV.oo6:
            return 5;
        case CardV.gaojiao7:
            return 6;
        case CardV.hongtou10:
            return 7;
        case CardV.futou:
            return 8;
        case CardV.bandeng:
            return 9;
        case CardV.chang3:
            return 10;
        case CardV.meipai:
            return 11;
        case CardV.epai:
            return 12;
        case CardV.renpai:
            return 13;
        case CardV.dipai:
            return 14;
        case CardV.tianpai:
            return 15;
        default:
            break;
    }
    return 0;
}
/**比牌
 * @param theCards1 1-52
 * @param theCards2 1-52
 */
export function bipai(theCards1: number[], theCards2: number[]) {
    let fight1 = getCardType(theCards1, true);
    let fight2 = getCardType(theCards2, true);
    // 一样大 比点数
    if (fight1 != fight2) {
        return fight1 > fight2;
    }

    const max1 = getPoints(theCards1), max2 = getPoints(theCards2);
    // 点数一样 
    if (max1 != max2) {
        return max1 > max2;
    }
    const arr1 = theCards1.map(c => getPoint(c)).sort((a, b) => b - a);
    const arr2 = theCards2.map(c => getPoint(c)).sort((a, b) => b - a);
    if (arr1[0] != arr2[0]) {
        return arr1[0] > arr2[0];
    }

    if (arr1[1] != arr2[1]) {
        return arr1[1] > arr2[1];
    }
    return true;
}
