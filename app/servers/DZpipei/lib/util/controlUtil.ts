import { dealCardsModels, TYPE_TWO, TYPE_ONE, TYPE_FIVE, TYPE_FOUR, TYPE_THREE, TYPE_SIX, TYPE_SEVEN } from "../DZpipeiConst";
import { random } from "../../../../utils";
import { getCardsType, detectionPoker, getPai } from "../dz_logic";
import {cardsConversionStr} from "../../../../utils/GameUtil";

/**
 * 获取调控的牌模型
 * @return 发牌模型
 */
export function getCardsModel(): string {
    return dealCardsModels[random(0, dealCardsModels.length - 1)];
}

/**
 * 选择公牌
 * @param cards 52张牌
 * @param model 发牌模型
 */
export function selectPublicCards(cards: number[], model: string) {
    const _cards = cards.slice();

    switch (model) {
        // 顺子 vs 两对
        case TYPE_ONE: return getShunPublicCards(_cards);
        // 同花 vs 两对
        case TYPE_TWO: return getSameColorPublicCards(_cards);
        // 顺子 vs 顶对
        case TYPE_THREE: return getSpecialShunPublicCards(_cards);
        // 三条 vs 两对
        case TYPE_FOUR: return getSinglePublicCards(cards);
        // 葫芦 vs 三条
        case TYPE_FIVE: return getPairsPublicCards(_cards);
        // 顺子 vs 三条
        case TYPE_SIX: return getShunPublicCards(_cards);
        // 同花 vs 顺子
        case TYPE_SEVEN: return getShunPublicCards(_cards, true);
        default:
            throw new Error(`德州:selectPublicCards error => ${model}`);
    }
}

/**
 * 获取玩家牌
 * @param cards
 * @param model 发牌模型
 * @param publicCards 发牌模型
 * @param playersCount 玩家数量
 */
export function selectPlayersCards(cards: number[], model: string, publicCards: number[], playersCount: number) {
    const playersCards = [];

    switch (model) {
        // 顺子 vs 两对
        case TYPE_ONE: {
            // 先选出一副顺子
            const s = getShunPlayerCards(cards, publicCards);
            playersCards.push(s);
            // 删除这一副
            deleteHolds(cards, s);
            // 获取一只两对
            const twoPairs = getTwoPairsPlayerCards(cards, publicCards);
            playersCards.push(twoPairs);
            deleteHolds(cards, twoPairs);

            for (let i = 0; i < playersCount - 2; i++) {
                playersCards.push(getHolds(cards));
            }
            break;
        }
        // 同花 vs 两对
        case TYPE_TWO: {
            // 先选出同花牌
            const c = getSameColorPlayerCards(cards, publicCards);
            playersCards.push(c);
            // 删除这一副
            deleteHolds(cards, c);
            // 获取一只两对
            const twoPairs = getTwoPairsPlayerCards(cards, publicCards);
            playersCards.push(twoPairs);
            deleteHolds(cards, twoPairs);

            for (let i = 0; i < playersCount - 2; i++) {
                playersCards.push(getHolds(cards));
            }
            break;
        }
        // 顺子 vs 顶对
        case TYPE_THREE: {
            // 先选出一副顺子
            const s = getShunPlayerCards(cards, publicCards);
            playersCards.push(s);
            // 删除这一副
            deleteHolds(cards, s);
            // 获取一个顶对
            const twoPairs = getBigPairsPlayerCards(cards, publicCards);
            playersCards.push(twoPairs);
            deleteHolds(cards, twoPairs);

            for (let i = 0; i < playersCount - 2; i++) {
                playersCards.push(getHolds(cards));
            }
            break;
        }
        // 三条 vs 两对
        case TYPE_FOUR: {
            // 先选出一个三条
            const t = getTripsPlayerCards(cards, publicCards);
            playersCards.push(t);
            // 删除这一副
            deleteHolds(cards, t);
            // 获取一只两对
            const twoPairs = getTwoPairsPlayerCards(cards, publicCards);
            playersCards.push(twoPairs);
            deleteHolds(cards, twoPairs);

            for (let i = 0; i < playersCount - 2; i++) {
                playersCards.push(getHolds(cards));
            }
            break;
        }
        // 葫芦 vs 三条
        case TYPE_FIVE: {
            // 先选出一个葫芦
            const t = getFullHousePlayerCards(cards, publicCards);
            playersCards.push(t);
            // 删除这一副
            deleteHolds(cards, t);
            // 获取一个三条 此时的公牌里已经有一个对子
            const twoPairs = getFTripsPlayerCards(cards, publicCards);
            playersCards.push(twoPairs);
            deleteHolds(cards, twoPairs);

            for (let i = 0; i < playersCount - 2; i++) {
                playersCards.push(getHolds(cards));
            }
            break;
        }
        // 顺子 vs 三条
        case TYPE_SIX: {
            // 先选出一副顺子
            const s = getShunPlayerCards(cards, publicCards);
            playersCards.push(s);
            // 删除这一副
            deleteHolds(cards, s);
            // 获取一个三条
            const t = getTripsPlayerCards(cards, publicCards);
            playersCards.push(t);
            deleteHolds(cards, t);

            for (let i = 0; i < playersCount - 2; i++) {
                playersCards.push(getHolds(cards));
            }
            break;
        }

        // 同花 vs 顺子
        case TYPE_SEVEN: {
            // 先选出一副同花
            const s = getSameColorPlayerCards(cards, publicCards);
            playersCards.push(s);
            // 删除这一副
            deleteHolds(cards, s);
            // 获取一个顺子
            const t = getShunPlayerCards(cards, publicCards);
            playersCards.push(t);
            deleteHolds(cards, t);

            for (let i = 0; i < playersCount - 2; i++) {
                playersCards.push(getHolds(cards));
            }
            break;
        }

        default:
            throw new Error(`德州:selectPlayersCards error => ${model}`);
    }

    return playersCards;
}

/**
 * 剔除手牌
 * @param cards
 * @param holds 牌
 */
export function deleteHolds(cards: number[], holds: number[]) {
    holds.forEach(card => {
        let index = cards.findIndex(c => c === card);
        cards.splice(index, 1);
    })
}


/**
 * 获取随机手牌
 * @param cards
 */
function getHolds(cards: number[]) {
    return cards.splice(random(0, cards.length - 3), 2);
}


/**
 * 从牌中选出一个含有顺子牌型的手牌
 * @param cards
 * @param publicCards
 */
function getShunPlayerCards(cards: number[], publicCards: number[]) {
    let holds: number[], type = -1;
    while (type !== 4) {
        const _cards = cards.slice();
        let h = [],
            index = random(0, _cards.length - 1),
            card = _cards.splice(index, 1)[0];
        h.push(card, _cards[random(0, _cards.length - 1)]);

        const { type: _type } = getCardsType(h, publicCards);

        holds = h;
        type = _type;
    }

    holds.sort((a, b) => Math.random() - 0.5);

    return holds;
}

/**
 * 从牌中选出一个含有三条牌型的手牌
 * @param cards
 * @param publicCards
 */
function getTripsPlayerCards(cards: number[], publicCards: number[]) {
    let holds: number[] = [];

    const card = publicCards[random(0, publicCards.length - 1)];

    const sameValueCards = cards.filter(c => c % 13 === card % 13);

    holds.push(sameValueCards[0], sameValueCards[1]);

    holds.sort((a, b) => Math.random() - 0.5);

    return holds;
}

/**
 * 从公牌中已经有对子中选出一个含有三条牌型的手牌
 * @param cards
 * @param publicCards
 */
function getFTripsPlayerCards(cards: number[], publicCards: number[]) {
    let holds: number[] = [], _cards = cards.slice();

    // 先查找第一张或者第二张牌是对子牌
    let pairCards = publicCards.filter(c => publicCards[0] % 13 === c % 13);

    if (pairCards.length === 1) {
        pairCards = publicCards.filter(c => publicCards[1] % 13 === c % 13);
    }

    // 找到第一张对子牌
    let card = _cards.find(c => c % 13 === pairCards[0] % 13);

    // 过滤掉对子牌
    _cards = _cards.filter(c => c % 13 !== pairCards[0] % 13);

    // 然后再找另外一张手牌 这张手牌不能跟任何一张公牌一样
    const notSamePublicCards = publicCards.filter(c => pairCards[0] % 13 !== c % 13).map(c => c % 13);
    const notSameCards = _cards.filter(c => !notSamePublicCards.includes(c % 13));

    // 第二张牌
    const secondCard = notSameCards[random(0, notSameCards.length - 1)];

    holds.push(card, secondCard);

    holds.sort((a, b) => Math.random() - 0.5);

    return holds;
}

/**
 * 从牌中选出一个含有葫芦牌型的手牌
 * @param cards
 * @param publicCards
 */
function getFullHousePlayerCards(cards: number[], publicCards: number[]) {
    let holds: number[] = [], _cards = cards.slice();

    // 先查找第一张或者第二张牌是对子牌
    let pairCards = publicCards.filter(c => publicCards[0] % 13 === c % 13);

    if (pairCards.length === 1) {
        pairCards = publicCards.filter(c => publicCards[1] % 13 === c % 13);
    }

    // 找到第一张对子牌
    let card = _cards.find(c => c % 13 === pairCards[0] % 13);

    // 然后再找另外一张公牌做对子 组成葫芦
    const notSamePublicCards = publicCards.filter(c => pairCards[0] % 13 !== c % 13);

    // 第二张牌
    const second = notSamePublicCards[random(0, notSamePublicCards.length - 1)];
    const secondCard = _cards.find(c => c % 13 === second % 13);

    holds.push(card, secondCard);

    holds.sort((a, b) => Math.random() - 0.5);

    return holds;
}


/**
 * 从牌中选出一个含有同花牌型的手牌
 * @param cards
 * @param publicCards
 */
function getSameColorPlayerCards(cards: number[], publicCards: number[]) {
    // 查找公牌中多次出现的花色
    const colors = publicCards.map(c => Math.floor(c / 13));
    const color = [...(new Set(colors))].find(color => colors.filter(c => c === color).length > 2);

    let sameColorCards = cards.filter(c => Math.floor(c / 13) === color);

    let holds: number[] = [];

    const card = sameColorCards[random(0, sameColorCards.length - 1)];
    holds.push(card);
    sameColorCards = sameColorCards.filter(c => c !== card);
    holds.push(sameColorCards[random(0, sameColorCards.length - 1)]);

    holds.sort((a, b) => Math.random() - 0.5);

    return holds;
}

/**
 * 从顺子或者同花公牌中获取一个两对 前两张手牌要有一个对子
 * @param cards
 * @param publicCards
 */
function getTwoPairsPlayerCards(cards: number[], publicCards: number[]) {
    let holds: number[] = [], _cards = cards.slice();

    let _publicCards = publicCards.slice();

    // 先保证前两张公牌有个对
    const first = _publicCards[random(0, 1)];
    const f = _cards.find(c => c % 13 === first % 13);
    holds.push(f);

    // 找第二张牌
    const second = _publicCards.filter(c => c % 13 !== first % 13)[random(0, 3)];
    holds.push(_cards.find(c => c % 13 === second % 13));

    // 如果类型不为两对  重新随机
    if (getCardsType(holds, publicCards).type !== 2) {
        return getTwoPairsPlayerCards(cards, publicCards);
    }

    holds.sort((a, b) => Math.random() - 0.5);

    return holds;
}

/**
 * 从顺子公牌中获取一个顶对 前两张手牌中要看到顶对
 * @param cards
 * @param publicCards
 */
function getBigPairsPlayerCards(cards: number[], publicCards: number[]) {
    let holds: number[] = [], _cards = cards.slice();

    let _publicCards = publicCards.slice();

    const previousThree = _publicCards.slice(0, 3);

    // 找到前两张牌中的K或者A
    const first = previousThree.find(c => c % 13 === 0 || c % 13 === 12);
    const f = _cards.find(c => c % 13 === first % 13);
    holds.push(f);
    _cards = _cards.filter(c => c !== f);

    // 第二张牌不能跟 公牌的其他牌相同
    const publicCardsValues = _publicCards.map(c => c % 13);
    const notSameCards = _cards.filter(c => !publicCardsValues.includes(c % 13));
    holds.push(notSameCards[random(0, notSameCards.length - 1)]);

    if (getCardsType(holds, publicCards).type !== 1) {
        return getBigPairsPlayerCards(cards, publicCards);
    }

    holds.sort((a, b) => Math.random() - 0.5);

    return holds;
}


/**
 * 获取可以做顺子的公牌
 * @param cards
 * @param variety 为true时公牌只能有3种花色 false时只能有3种或者4种花色
 */
function getShunPublicCards(cards: number[], variety: boolean = false) {
    let publicCards = [], _cards = cards.slice();
    // 随机一个顺子范围
    const min = random(0, 7);
    const max = min + 4;
    let s = new Array(5).fill(-1).map((n, index) => min + index + 1);

    // 查找
    while (publicCards.length < 3) {
        s.sort((a, b) => 0.5 - Math.random());
        const card = _cards.find(c => c % 13 === s[0]);

        publicCards.push(card);

        s = s.slice(1,);
        _cards = _cards.filter(c => c !== card);
    }

    // 保证顺子干净
    _cards = _cards.filter(c => {
        const value = c % 13;
        return value < min - 1 || value > max + 1;
    })


    // 再随机找两个
    while (publicCards.length < 5) {
        const index = random(0, _cards.length - 1);
        let card: number = _cards[index];
        publicCards.push(card);
        _cards = _cards.filter(c => c % 13 !== card % 13);
    }

    const colorCount = [...new Set(publicCards.map(c => Math.floor(c / 13)))].length;

    // 多样性
    if (variety) {
        // 查找公牌中多次出现的花色
        const colors = publicCards.map(c => Math.floor(c / 13));
        const color = [...(new Set(colors))].find(color => colors.filter(c => c === color).length > 3);
        // 花色不等于2种且同一种花色不出现四次
        if (colorCount !== 2 || color) {
            return getShunPublicCards(cards, variety);
        }
    } else {
        // 如果花色不满3种重新随机 防止同花
        if (colorCount < 3) {
            return getShunPublicCards(cards, variety);
        }
    }

    // 如果这五张公牌不等高牌重新随机
    if (detectionPoker(publicCards).type !== 0) {
        return getShunPublicCards(cards, variety);
    }

    publicCards.sort((a, b) => 0.5 - Math.random());

    return publicCards;
}

/**
 * 获取可能做顶对和顺子的牌
 * @param cards
 */
function getSpecialShunPublicCards(cards: number[]) {
    let _cards = cards.slice();
    let publicCards = [];
    // 随机一个顺子范围
    const min = random(0, 8);
    const max = min + 4;
    let s = new Array(5).fill(-1).map((n, index) => min + index + 1);

    // 查找
    while (publicCards.length < 4) {
        s.sort((a, b) => 0.5 - Math.random());
        const card = cards.find(c => c % 13 === s[0] % 13);

        publicCards.push(card);
        s = s.slice(1,);
        cards = cards.filter(c => c !== card);
    }

    // 保证顺子干净
    cards = cards.filter(c => {
        const value = c % 13;
        return value < min - 1 || value > max + 1;
    })

    // 找 A 或者 Ｋ的下标
    const index = publicCards.findIndex(c => c % 13 === 0 || c % 13 === 12);

    // 如果本身就有
    if (index !== -1) {
        const exchangeIndex = Math.random() > 0.5 ? 0 : 1;
        [publicCards[exchangeIndex], publicCards[index]] = [publicCards[index], publicCards[exchangeIndex]];

        let card: number = cards[random(0, cards.length - 1)];
        publicCards.push(card);
    } else {
        let card: number = cards.find(c => c % 13 === 0 || c % 13 === 12);
        publicCards.unshift(card);

        if (Math.random() > 0.5) {
            [publicCards[0], publicCards[1]] = [publicCards[1], publicCards[0]];
        }
    }

    // 如果花色不满3种或者公牌牌型不为单牌重新随机
    if ([...new Set(publicCards.map(c => Math.floor(c / 13)))].length < 3 || detectionPoker(publicCards).type !== 0) {
        return getSpecialShunPublicCards(_cards);
    }

    return publicCards;
}

/**
 * 获取可能做顺子和三条的公牌
 * @param cards
 */
function getTripsShunPublicCards(cards: number[]) {
    let _cards = cards.slice();
    let publicCards = [];
    // 随机一个顺子范围
    const min = random(0, 8);
    const max = min + 4;
    let s = new Array(5).fill(-1).map((n, index) => min + index + 1);

    // 查找
    while (publicCards.length < 4) {
        s.sort((a, b) => 0.5 - Math.random());
        const card = cards.find(c => c % 13 === s[0] % 13);

        publicCards.push(card);
        s = s.slice(1,);
        cards = cards.filter(c => c !== card);
    }

    // 保证顺子干净
    cards = cards.filter(c => {
        const value = c % 13;
        return value < min - 1 || value > max + 1;
    })

    // 找 A 或者 Ｋ的下标
    const index = publicCards.findIndex(c => c % 13 === 0 || c % 13 === 12);

    // 如果本身就有
    if (index !== -1) {
        const exchangeIndex = Math.random() > 0.5 ? 0 : 1;
        [publicCards[exchangeIndex], publicCards[index]] = [publicCards[index], publicCards[exchangeIndex]];

        let card: number = cards[random(0, cards.length - 1)];
        publicCards.push(card);
    } else {
        let card: number = cards.find(c => c % 13 === 0 || c % 13 === 12);
        publicCards.unshift(card);

        if (Math.random() > 0.5) {
            [publicCards[0], publicCards[1]] = [publicCards[1], publicCards[0]];
        }
    }

    // 如果花色不满3种重新随机 防止同花
    if ([...new Set(publicCards.map(c => Math.floor(c / 13)))].length < 3) {
        return getSpecialShunPublicCards(_cards);
    }

    return publicCards;
}

/**
 * 获取一个是高牌的公牌
 * @param cards
 */
function getSinglePublicCards(cards: number[]) {
    let publicCards = [];

    while (true) {
        const _cards = cards.slice();
        _cards.sort((a, b) => Math.random() - 0.5);
        publicCards = _cards.splice(random(0, _cards.length - 6), 5);

        // 选出牌型为高牌的结果
        if (detectionPoker(publicCards).type === 0) {
            break;
        }
    }

    return publicCards;
}

/**
 * 获取可以做同花的公牌
 * @param cards
 */
function getSameColorPublicCards(cards: number[]) {
    let publicCards = [];
    // 随机一个花色
    const color = random(0, 3);
    let sameColorCards = cards.filter(c => Math.floor(c / 13) === color);
    let notSameColorCards = cards.filter(c => Math.floor(c / 13) !== color);

    // 查找
    while (publicCards.length < 3) {
        const card = sameColorCards[random(0, sameColorCards.length - 1)];
        publicCards.push(card);
        // 过滤掉这张牌
        sameColorCards = sameColorCards.filter(c => c !== card);
        // 不同花色也过滤掉这张值
        notSameColorCards = notSameColorCards.filter(c => c % 13 !== card % 13);
    }

    // 再随机找两个
    while (publicCards.length < 5) {
        const card = notSameColorCards[random(0, notSameColorCards.length - 1)];
        publicCards.push(card);
        notSameColorCards = notSameColorCards.filter(c => c % 13 !== card % 13);
    }

    // 如果这五张公牌不等高牌重新随机
    if (detectionPoker(publicCards).type !== 0) {
        return getSameColorPublicCards(cards);
    }

    publicCards.sort((a, b) => 0.5 - Math.random());
    return publicCards;
}

/**
 * 获取包含对子的公牌
 * @param cards
 */
function getPairsPublicCards(cards: number[]) {
    const card = cards[random(0, cards.length - 1)];

    // 查找另外一张牌
    const sameCard = cards.find(c => c !== card && c % 13 === card % 13);

    // 过滤出相同牌型
    cards = cards.filter(c => c % 13 !== card % 13);

    // 头一张
    let publicCards = [];
    while (publicCards.length < 3) {
        const _c = cards[random(0, cards.length - 1)];
        publicCards.push(_c);
        cards = cards.filter(c => c % 13 !== _c % 13);
    }

    publicCards.push(sameCard);
    publicCards.sort((a, b) => 0.5 - Math.random());

    publicCards.unshift(card);

    if (Math.random() > 0.5) {
        [publicCards[0], publicCards[1]] = [publicCards[1], publicCards[0]];
    }

    return publicCards;
}


function test(num: number) {
    const c1 = {}, c2 = {};

    // for (let i = 0; i < num; i++) {
    //     const cards = getPai();
    //     const publicCards = selectPublicCards(cards, TYPE_ONE);
    //     // 删除公牌
    //     deleteHolds(cards, publicCards);
    //     const cs = selectPlayersCards(cards, TYPE_ONE, publicCards, 6);
    //     sum(4, 2, cs[0], cs[1], publicCards, c1, c2)
    // }

    // for (let i = 0; i < num; i++) {
    //     const cards = getPai();
    //     const publicCards = selectPublicCards(cards, TYPE_TWO);
    //     // 删除公牌
    //     deleteHolds(cards, publicCards);
    //     const cs = selectPlayersCards(cards, TYPE_TWO, publicCards, 6);
    //     sum(5, 2, cs[0], cs[1], publicCards, c1, c2);
    // }
    // console.warn('1111111111')
    // for (let i = 0; i < num; i++) {
    //     const cards = getPai();
    //     const publicCards = selectPublicCards(cards, TYPE_THREE)
    //     // 删除公牌
    //     deleteHolds(cards, publicCards);
    //     const cs = selectPlayersCards(cards, TYPE_THREE, publicCards, 6);
    //     sum(4, 1, cs[0], cs[1], publicCards, c1, c2)
    // }
    // console.warn('22222222')
    // for (let i = 0; i < num; i++) {
    //     const cards = getPai();
    //     const publicCards = selectPublicCards(cards, TYPE_FOUR)
    //     // 删除公牌
    //     deleteHolds(cards, publicCards);
    //     const cs = selectPlayersCards(cards, TYPE_FOUR, publicCards, 6);
    //     sum(3, 2, cs[0], cs[1], publicCards, c1, c2)
    // }
    // console.warn('33333333333')
    // for (let i = 0; i < num; i++) {
    //     const cards = getPai();
    //     // const publicCards = selectPublicCards(cards, TYPE_FIVE)
    //     const publicCards = [48, 49, 22, 51, 7];
    //     deleteHolds(cards, publicCards);
    //     const cs = selectPlayersCards(cards, TYPE_FIVE, publicCards, 8);
    //     sum(6, 3, cs[0], cs[1], publicCards, c1, c2)
    // }
    // console.warn('444444444')
    // console.warn('5555555555')
    //
    // for (let i = 0; i < num; i++) {
    //     const cards = getPai();
    //     const publicCards = selectPublicCards(cards, TYPE_SIX);
    //     deleteHolds(cards, publicCards);
    //     const cs = selectPlayersCards(cards, TYPE_SIX, publicCards, 6);
    //     sum(4, 3, cs[0], cs[1], publicCards, c1, c2)
    // }
    // console.warn('666666666666666666')
    //
    // for (let i = 0; i < num; i++) {
    //     const cards = getPai();
    //     const publicCards = selectPublicCards(cards, TYPE_SEVEN);
    //     deleteHolds(cards, publicCards);
    //     const cs = selectPlayersCards(cards, TYPE_SEVEN, publicCards, 6);
    //     sum(5, 4, cs[0], cs[1], publicCards, c1, c2)
    // }
    // console.warn('77777777777777')

    // console.log(c1, c2);
}

function sum(h1, h2, hold1, hold2, publicCards, sum1, sum2) {
    const typeOne = getCardsType(hold1, publicCards).type;
    const typeTwo = getCardsType(hold2, publicCards).type;

    // console.warn('111', typeOne, typeTwo)
    if (typeOne !== h1 || typeTwo !== h2) {
        const k1 = typeOne, k2 = typeTwo;
        if (sum1[k1] === undefined) {
            sum1[k1] = 1;
        } else {
            sum1[k1]++;
        }

        if (sum2[k2] === undefined) {
            sum2[k2] = 1
        } else {
            sum2[k2]++;
        }
    }
}

// test(1000);