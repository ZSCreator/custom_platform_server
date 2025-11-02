/**
 * 元素
 * @property NONE 哭脸
 * @property ONE_FIFTH 1/5
 * @property HALF 1/2
 * @property CAPITAL 1倍
 * @property DOUBLED 2倍
 * @property TRIPLE 3倍
 * @property QUADRUPLE 四倍
 * @property SIXFOLD 六倍
 * @property TENFOLD 十倍
 * @property FIFTY_FOLD 50倍
 * @property TWO_HUNDRED 200倍
 * @property SIX_HUNDRED 600倍
 */
export enum Elements {
    NONE = 0,
    ONE_FIFTH = 10,
    HALF = 2,
    CAPITAL = 8,
    DOUBLED = 4,
    TRIPLE = 6,
    QUADRUPLE = 5,
    SIXFOLD = 11,
    TENFOLD = 3,
    FIFTY_FOLD = 9,
    TWO_HUNDRED = 7,
    SIX_HUNDRED = 1,
}

// 一个轮盘
export const wheel = [Elements.NONE, Elements.ONE_FIFTH, Elements.HALF, Elements.CAPITAL, Elements.DOUBLED,
 Elements.TRIPLE, Elements.QUADRUPLE, Elements.SIXFOLD, Elements.TENFOLD, Elements.FIFTY_FOLD, Elements.TWO_HUNDRED, Elements.SIX_HUNDRED];

// 赔率
export const ELEMENT_ODDS = {
    [Elements.NONE]: 0,
    [Elements.ONE_FIFTH]: 0.2,
    [Elements.HALF]: 0.5,
    [Elements.CAPITAL]: 1,
    [Elements.DOUBLED]: 2,
    [Elements.TRIPLE]: 3,
    [Elements.QUADRUPLE]: 4,
    [Elements.SIXFOLD]: 6,
    [Elements.TENFOLD]: 10,
    [Elements.FIFTY_FOLD]: 50,
    [Elements.TWO_HUNDRED]: 200,
    [Elements.SIX_HUNDRED]: 600,
}


export const probability = {
    [Elements.NONE]: 2000,
    [Elements.ONE_FIFTH]: 1880,
    [Elements.HALF]: 1500,
    [Elements.CAPITAL]: 500,
    [Elements.DOUBLED]: 200,
    [Elements.TRIPLE]: 200,
    [Elements.QUADRUPLE]: 150,
    [Elements.SIXFOLD]: 120,
    [Elements.TENFOLD]: 60,
    [Elements.FIFTY_FOLD]: 12,
    [Elements.TWO_HUNDRED]: 3,
    [Elements.SIX_HUNDRED]: 1,
}
