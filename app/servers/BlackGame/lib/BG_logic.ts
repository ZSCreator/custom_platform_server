
export const Card2RealCard = {
    1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
    8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q',
    13: 'K',
    14: 'A', 15: '2', 16: '3', 17: '4', 18: '5', 19: '6', 20: '7',
    21: '8', 22: '9', 23: '10', 24: 'J', 25: 'Q',
    26: 'K',
    27: 'A', 28: '2', 29: '3', 30: '4', 31: '5', 32: '6', 33: '7',
    34: '8', 35: '9', 36: '10', 37: 'J', 38: 'Q',
    39: 'K',
    40: 'A', 41: '2', 42: '3', 43: '4', 44: '5', 45: '6', 46: '7',
    47: '8', 48: '9', 49: '50', 51: 'J', 52: 'Q',
    53: 'K',
};

/**
 * 8副牌 不包含大小王
 */
export function shuffle_cards() {
    let cards: number[] = [];
    for (let index = 0; index < 8; index++) {
        for (let i = 1; i < 52; i++) {
            cards.push(i)
        }
    }
    cards.sort((a, b) => 0.5 - Math.random());
    return cards;
}

/**
 * 返回牌面值
 * @param card 0-53
 */
export function getCardValue(card: number) {
    let CardValue = card % 13;
    //A 2 3 4 5 6 7 8 9 10 J Q K
    //1 2 3 4 5 6 7 8 9 10 11 12 13
    if (CardValue == 0)
        return 13;
    return CardValue;
};
export function is_eq_cards(card1: number, card2: number) {
    if (getCardValue(card1) == getCardValue(card2)) {
        return true;
    }
    if (getCardValue(card1) >= 10 && getCardValue(card2) >= 10) {
        return true;
    }
    return false;
}

/**是否包含A */
export function is_A(card: number) {
    if (getCardValue(card) == 1) {
        return true;
    }
    return false;
}
/**获取点数 */
export function get_Points(cards: number[], isSeparatePoker = false) {
    /** 0爆牌，1点数牌，2五小龙，3黑杰克*/
    let res = { type: 1, Points: 0, Points_t: 0 };
    for (const card of cards) {
        let vv = getCardValue(card);
        if (vv >= 10) {
            vv = 10;
        }
        if (vv == 1) {
            vv = 11;
        }
        res.Points += vv;
    }
    let Points = res.Points;
    for (const c of cards) {
        if (res.Points > 21 && is_A(c)) {
            res.Points -= 10;
        }
    }
    res.Points_t = Points;
    for (const c of cards) {
        if (is_A(c)) {
            res.Points_t -= 10;
        }
    }
    if (cards.length == 5) {
        res.type = 2;
    }
    if (cards.length == 2 && res.Points == 21 && isSeparatePoker == false) {
        res.type = 3;
    }
    if (res.Points > 21) {
        res.type = 0;
    }
    return res;
}
/**
 * 
 * @param cards1 
 * @param cards2 
 * @returns 1 庄胜 0 等于 -1庄输
 */
export function bipai(banker_res: { type: number, Points: number }, res: { type: number, Points: number }) {
    if (res.type == 0) {
        return 1;
    }
    if (banker_res.Points > 21) {
        return -1;
    }
    if (banker_res.type > res.type) {
        return 1;
    } else if (banker_res.type < res.type) {
        return -1;
    }
    if (banker_res.type == res.type && banker_res.type >= 2) {
        return 0;
    }
    if (banker_res.Points > res.Points) {
        return 1;
    } else if (banker_res.Points < res.Points) {
        return -1;
    }
    return 0;
}

// let cardsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
// console.warn(cardsData.map(c => getCardValue(c)));
