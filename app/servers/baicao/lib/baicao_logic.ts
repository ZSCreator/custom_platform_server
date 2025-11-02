
import baicaoPlayer from './baicaoPlayer';
import baicaoConst = require('./baicaoConst');



export const pukes = ["", '黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
    '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
    '梅A', '梅2', '梅3', '梅4', '梅5', '梅6', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K',
    '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
];


function getRandomNumber(min: number, max: number) {
    if (max % 1 !== 0 || min % 1 !== 0) {
        throw "min, max不能为非整数";
    }

    const MAX = Math.max(min, max);
    const MIN = Math.min(min, max);
    const MM = MAX - MIN + 1;

    return Math.floor(Math.random() * MM) + MIN;
}

/**
 * 洗牌
 */
export function riffle(gamePlayers?: baicaoPlayer[]) {
    let aPoker = getpai();

    const cards: { cards: number[], cardType: number, Points: number, total_CardValue: number }[] = [];
    while (aPoker.length >= 3) {
        const card = aPoker.splice(0, 3);
        const cardType = getCardTypeBySg(card);
        cards.push({ cards: card, cardType: cardType.cardType, Points: cardType.Points, total_CardValue: cardType.total_CardValue });
    }


    // 给几副牌逆序排序
    return cards;
}

export function getpai() {
    const cards: number[] = [];

    for (let p = 1; p <= 52; p++) {
        cards.push(p);
    }
    // 打乱
    cards.sort(() => 0.5 - Math.random());
    return cards;
};

/**
 * 计算三张牌 点数用
 * @param card 0-53
 */
export function getCardValue_p(card: number) {
    let CardValue = card % 13;
    if (CardValue == 10 ||
        CardValue == 11 ||
        CardValue == 12 ||
        CardValue == 13) {//10 J Q K
        return 0;
    }
    // return (CardValue <= 1) ? (CardValue + 13) : CardValue;
    return CardValue;
};
/**
 * 单个牌 比较用
 * @param card 0-53
 */
export function getCardValue_x(card: number) {
    let CardValue = card % 13;
    if (CardValue == 0) {
        // CardValue == 11 ||
        // CardValue == 12 ||
        // CardValue == 13) {//10 J Q K
        return 13;
    }
    // return (CardValue <= 1) ? (CardValue + 13) : CardValue;
    return CardValue;
};
/**比牌 两个人比
 * return 0 f1 胜利
 * return 1 f2 胜利
 * return 2 平局
 */
export function bipaiSoleBySg(fight1: { cardType: number, Points: number, total_CardValue: number },
    fight2: { cardType: number, Points: number, total_CardValue: number }) {
    // 比点数
    if ((fight1.cardType == fight2.cardType && fight1.cardType == 2) ||
        (fight1.cardType == fight2.cardType && fight1.cardType == 1)) {
        if (fight1.total_CardValue > fight2.total_CardValue) {
            return 0;
        }
        if (fight2.total_CardValue > fight1.total_CardValue) {
            return 1;
        }
    }
    if (fight1.cardType > fight2.cardType) {
        return 0;
    }
    if (fight1.cardType < fight2.cardType) {
        return 1;
    }

    if (fight1.Points > fight2.Points) {
        return 0;
    }
    if (fight1.Points < fight2.Points) {
        return 1;
    }

    if (fight1.Points == 0 && fight2.Points == 0) {// 如果都是0点 某人判庄赢
        return 2;
    }
};

/**获取三公 牌型 */
export function getCardTypeBySg(cards: number[]) {
    let Points = cards.reduce((total, Value) => { return total + getCardValue_p(Value) }, 0);
    Points = Points % 10;

    let lottery = { cardType: 0, Points: Points, total_CardValue: 0 };
    //三公：三张相同牌面组成的牌型。333，JJJ
    if (getCardValue_x(cards[0]) == getCardValue_x(cards[1]) && getCardValue_x(cards[1]) == getCardValue_x(cards[2])) {
        lottery.cardType = 2;
    }
    //混三公：三张不同的人牌（JQK）组成的牌型。JQK，JJK
    if (cards.every(c => [11, 12, 13].includes(getCardValue_x(c)))) {
        lottery.cardType = 1;
    }
    if (lottery.cardType == 1 || lottery.cardType == 2) {
        let z1 = cards.map(c => getCardValue_x(c)).sort((c1, c2) => c2 - c1);
        lottery.total_CardValue = z1[0] * 100000000 + z1[1] * 10000 + z1[2];
    } else {
        lottery.total_CardValue = lottery.Points;
    }

    return lottery;
};
