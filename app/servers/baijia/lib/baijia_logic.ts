import baijiaConst = require('./baijiaConst');
import JsonMgr = require('../../../../config/data/JsonMgr');
import utils = require('../../../utils');
import BaiJiaRoomImpl from './BaiJiaRoomImpl'

/**
 * 获取结果 - 欢乐百人
 * @param cards0
 * @param cards1
 * @param cardType0
 * @param cardType1
 */
export function getResultTo9(cards0: number[], cards1: number[], cardType0: number, cardType1: number) {
    const ret: baijiaConst.KaiJiangReulst = {
        play: false, bank: false, draw: false,
        big: false, small: false, pair0: false, pair1: false
    };
    if (cardType0 > cardType1) {
        ret.play = true; // 闲赢
    } else if (cardType0 < cardType1) {
        ret.bank = true; // 庄赢
    } else {
        ret.draw = true; // 和局
    }
    if (cards0.length + cards1.length > 4) {
        ret.big = true; // 大
    } else {
        ret.small = true; // 小
    }
    if (hasPair(cards0)) {
        ret.pair0 = true;// 闲对
    }
    if (hasPair(cards1)) {
        ret.pair1 = true;// 庄对
    }
    return ret;
};

/**获取牌型 - 欢乐百人
 * A 1点 10 J Q K 0点 2-9点数不变
 */
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
 * 检查 庄 是否需要补第三张牌  - 欢乐百人
 * @param cardType0 闲家
 * @param cardType1 庄家
 * @param bupai number[]fun内部转换成number在用
 */
export function canBupaiByBank(cardType0: number, cardType1: number, bupai: number = -1) {
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

/**
 * 是否对
 * @param cards
 */
function hasPair(cards: number[]) {
    return cards[0] % 13 === cards[1] % 13;
};
