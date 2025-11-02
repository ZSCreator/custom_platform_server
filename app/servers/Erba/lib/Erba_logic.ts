'use strict';

export const CardsType = {
    /**鳖十 */
    "6,4": 0, "7,3": 1, "9,1": 2,
    /**一点 */
    "6,5": 3, "7,4": 4, "8,3": 5, "9,2": 6,
    /**一点半 */
    "1,0": 7,
    /**二点 */
    "7,5": 8, "8,4": 9, "9,3": 10,
    /**二点半 */
    "2,0": 11,
    /**三点 */
    "2,1": 12, "7,6": 13, "8,5": 14, "9,4": 15,
    /**三点半 */
    "3,0": 16,
    /**四点 */
    "3,1": 17, "8,6": 18, "9,5": 19,
    /**四点半 */
    "4,0": 20,
    /**五点 */
    "3,2": 21, "4,1": 22, "8,7": 23, "9,6": 24,
    /**五点半 */
    "5,0": 25,
    /**六点 */
    "4,2": 26, "5,1": 27, "9,7": 28,
    /**六点半 */
    "6,0": 29,
    /**七点 */
    "4,3": 30, "5,2": 31, "6,1": 32, "9,8": 33,
    /**七点半 */
    "7,0": 34,
    /**八点 */
    "5,3": 35, "6,2": 36, "7,1": 37,
    /**八点半 */
    "8,0": 38,
    /**九点 */
    "5,4": 39, "6,3": 40, "7,2": 41, "8,1": 42,
    /**九点半 */
    "9,0": 43,
    /**二八杠 */
    "8,2": 44,
    /**一宝 */
    "1,1": 45,
    /**二宝 */
    "2,2": 46,
    /**三宝 */
    "3,3": 47,
    /**四宝 */
    "4,4": 48,
    /**五宝 */
    "5,5": 49,
    /**六宝 */
    "6,6": 50,
    /**七宝 */
    "7,7": 51,
    /**八宝 */
    "8,8": 52,
    /**九宝 */
    "9,9": 53,
    /**天王 */
    "0,0": 51,
};

/**
 * 打乱麻将
 */
export function shuffle_cards() {
    // 1.筒子牌：从一筒至九筒，各4张，共36张。
    let cards = [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//筒子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//筒子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//筒子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//筒子牌
        0, 0, 0, 0,//4张白板
    ];
    cards.sort((a, b) => 0.5 - Math.random());
    return cards;
}

/**获取类型 */
export function get_cards_type(cards: number[]) {
    let temp_cards = cards.slice();
    let cards_string = temp_cards.sort((a, b) => b - a).toString();
    return CardsType[cards_string];
}

/**
 * 
 * @param cards1 
 * @param cards2 
 * @returns 1 大于 0 等于 -1小于
 */
export function bipai(cards1: number[], cards2: number[]) {
    let type1 = get_cards_type(cards1);
    let type2 = get_cards_type(cards2);
    if (type1 == undefined || type2 == undefined) {
        console.error("", cards1.toString(), cards2.toString());
    }
    if (type1 > type2) {
        return 1;
    }
    if (type1 == type2) {
        return 0;
    }
    return -1;
}

/**
 * 按牌型的大小降序排序
 * @param cards
 */
export function sortResult(cards: number[][]) {
    cards.sort((a, b) => bipai(b, a));
}