'use strict';
/**
 * 手牌类型
 * @property {Array} sameColor 相同颜色手牌类型集合 [typeA,typeB,typeC]
 * @property {Array} diffrentColor 不同颜色手牌类型集合 [typeD,typeE,typeF]
 * @function getInstance 单例模式:获取实例，防反复加载 
 * @description 手牌判断依据，前3（类型1-3）为手牌相同花色，后3为不同花色，不在其中则默认类型7
 */
class PokerType {
    typeA: string[];
    typeB: string[];
    typeC: string[];
    typeD: string[];
    typeE: string[];
    typeF: string[];
    sameColor: any[];
    diffrentColor: any[];
    static instance: any;
    constructor() {
        /** @property {Array} typeA 类型1 */
        this.typeA = ['AK', 'KA', 'AQ', 'QA', 'AJ', 'JA', 'A10', '10A', 'KQ', 'QK', 'KJ', 'JK', 'K10', 'QJ', 'JQ', 'Q10', '10Q', 'J10', '10J', 'J9', '9J', '109', '910'];

        /** @property {Array} typeB 类型2 */
        this.typeB = ['A9', '9A', 'A8', '8A', 'A7', '7A', 'A6', '6A', 'K9', '9K', 'Q9', '9Q', 'Q8', '8Q', 'J8', '8J', '108', '810', '98', '89'];

        /** @property {Array} typeC 类型3 */
        this.typeC = ['A5', '5A', 'A4', '4A', 'A3', '3A', 'A2', '2A', 'K8', '8K', 'K7', '7K', 'K6', '6K', 'K5', '5K', 'K4', '4K', 'K3', '3K', 'K2', '2K', 'J7', '7J', '107', '710', '97', '79', '96', '69', '87', '78', '86', '68', '76', '67', '75', '57', '65', '56', '54', '45'];

        /** @property {Array} typeD 类型4 */
        this.typeD = ['AA', 'KK', 'QQ', 'JJ', '1010', '99', '88', '77', 'AK', 'KA', 'AQ', 'QA', 'AJ', 'JA', 'A10', '10A', 'KQ', 'QK', 'KJ', 'JK'];

        /** @property {Array} typeE 类型5 */
        this.typeE = ['66', '55', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'Aj', 'AQ', 'AK', '1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', 'JA', 'QA', 'KA'];

        /** @property {Array} typeF 类型6 */
        this.typeF = ['44', '33', '22', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'Kj', 'KQ', '1K', '2K', '3K', '4K', '5K', '6K', '7K', '8K', '9K', '10K', 'JK', 'QK', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Qj', '1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q', '9Q', '10Q', 'JQ'];

        this.sameColor = [];
        this.sameColor.push(this.typeA);
        this.sameColor.push(this.typeB);
        this.sameColor.push(this.typeC);
        this.diffrentColor = [];
        this.diffrentColor.push(this.typeD);
        this.diffrentColor.push(this.typeE);
        this.diffrentColor.push(this.typeF);
    }

    static getInstance() {
        if (!PokerType.instance) return new PokerType();
        return PokerType.instance;
    }
}

export = PokerType;