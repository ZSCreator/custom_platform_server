/**
 * 下注区域名字
 */
export enum BetAreasName {
    SINGLE = 'single',
    DOUBLE = 'double',
    FOUR_WHITE = 'fourWhite',
    FOUR_RED = 'fourRed',
    THREE_WHITE = 'threeWhite',
    THREE_RED = 'threeRed',
}

export const areas = [
    BetAreasName.SINGLE,
    BetAreasName.DOUBLE,
    BetAreasName.FOUR_WHITE,
    BetAreasName.FOUR_RED,
    BetAreasName.THREE_RED,
    BetAreasName.THREE_WHITE
];

/**
 * 下注区域赔率
 */
export const betAreaOdds  = {
    [BetAreasName.SINGLE]: {odds: 1.96, name: '单', limit: 1e7},
    [BetAreasName.DOUBLE]: {odds: 1.96, name: '双', limit: 1e7},
    [BetAreasName.FOUR_WHITE]: {odds: 13, name: '四白', limit: 5e5},
    [BetAreasName.FOUR_RED]: {odds: 13, name: '四红', limit: 5e5},
    [BetAreasName.THREE_RED]: {odds: 3.6, name: '三红一白', limit: 3e6},
    [BetAreasName.THREE_WHITE]: {odds: 3.6, name: '三白一红', limit: 3e6},
};