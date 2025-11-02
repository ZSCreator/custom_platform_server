/**
 * 下注区域名字
 */
export enum BetAreasName {
    ANDAR = 'andar',
    BAHAR = 'bahar'
}

export const areas = [
    BetAreasName.ANDAR,
    BetAreasName.BAHAR
];

/**
 * 下注区域赔率
 */
export const betAreaOdds  = {
    [BetAreasName.ANDAR]: {odds: 2, name: 'andar', limit: 1e6},
    [BetAreasName.BAHAR]: {odds: 2, name: 'bahar', limit: 1e6},
};