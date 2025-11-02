/**
 * 下注区域名字
 */
export enum BetAreasName {
    SINGLE = 'single',
    DOUBLE = 'double',

    ONE = 'one',
    TWO = 'two',
    THREE = 'three',
    FOUR = 'four',

    ONE_FOR_TWO = 'oneForTwo',
    ONE_FOR_THREE = 'oneForThree',
    ONE_FOR_FOUR = 'oneForFour',

    TWO_FOR_ONE = 'twoForOne',
    TWO_FOR_THREE = 'twoForThree',
    TWO_FOR_FOUR = 'twoForFour',

    THREE_FOR_ONE = 'threeForOne',
    THREE_FOR_TWO = 'threeForTwo',
    THREE_FOR_FOUR = 'threeForFour',

    FOUR_FOR_ONE = 'fourForOne',
    FOUR_FOR_TWO = 'fourForTWO',
    FOUR_FOR_THREE = 'fourForThree',

    ONE_TWO_ANGLE = 'oneTwoAngle',
    TWO_THREE_ANGLE = 'twoThreeAngle',
    THREE_FOUR_ANGLE = 'threeFourAngle',
    ONE_FOUR_ANGLE = 'oneFourAngle',

    ONE_TWO_THREE_DOOR = 'oneTwoThreeDoor',
    ONE_TWO_FOUR_DOOR = 'oneTwoFourDoor',
    TWO_THREE_FOUR_DOOR = 'twoThreeFourDoor',
    ONE_THREE_FOUR_DOOR = 'oneThreeFourDoor'
}

export const areas = [
    BetAreasName.SINGLE,
    BetAreasName.DOUBLE,
    BetAreasName.ONE,
    BetAreasName.TWO,
    BetAreasName.THREE,
    BetAreasName.FOUR,
    BetAreasName.ONE_FOR_TWO,
    BetAreasName.ONE_FOR_THREE,
    BetAreasName.ONE_FOR_FOUR,
    BetAreasName.TWO_FOR_ONE,
    BetAreasName.TWO_FOR_THREE,
    BetAreasName.TWO_FOR_FOUR,
    BetAreasName.THREE_FOR_ONE,
    BetAreasName.THREE_FOR_TWO,
    BetAreasName.THREE_FOR_FOUR,
    BetAreasName.FOUR_FOR_ONE,
    BetAreasName.FOUR_FOR_TWO,
    BetAreasName.FOUR_FOR_THREE,
    BetAreasName.ONE_TWO_ANGLE,
    BetAreasName.TWO_THREE_ANGLE,
    BetAreasName.THREE_FOUR_ANGLE,
    BetAreasName.ONE_FOUR_ANGLE,
    BetAreasName.ONE_TWO_THREE_DOOR,
    BetAreasName.ONE_TWO_FOUR_DOOR,
    BetAreasName.TWO_THREE_FOUR_DOOR,
    BetAreasName.ONE_THREE_FOUR_DOOR
];


// 单一区域
export const singleAreas = [BetAreasName.ONE, BetAreasName.TWO, BetAreasName.THREE, BetAreasName.FOUR];

// 念 区域
export const jointAreas = [
    BetAreasName.ONE_FOR_TWO,
    BetAreasName.ONE_FOR_THREE,
    BetAreasName.ONE_FOR_FOUR,
    BetAreasName.TWO_FOR_ONE,
    BetAreasName.TWO_FOR_THREE,
    BetAreasName.TWO_FOR_FOUR,
    BetAreasName.THREE_FOR_ONE,
    BetAreasName.THREE_FOR_TWO,
    BetAreasName.THREE_FOR_FOUR,
    BetAreasName.FOUR_FOR_ONE,
    BetAreasName.FOUR_FOR_TWO,
    BetAreasName.FOUR_FOR_THREE,
];

// 角区域
export const doubleAreas = [
    BetAreasName.ONE_TWO_ANGLE,
    BetAreasName.TWO_THREE_ANGLE,
    BetAreasName.THREE_FOUR_ANGLE,
    BetAreasName.ONE_FOUR_ANGLE,
];

// 门区域
export const threeAreas = [
    BetAreasName.ONE_TWO_THREE_DOOR,
    BetAreasName.ONE_TWO_FOUR_DOOR,
    BetAreasName.TWO_THREE_FOUR_DOOR,
    BetAreasName.ONE_THREE_FOUR_DOOR
];

/**
 * 下注区域赔率
 * odds 为赔率 name为区域名字 limit 为单个区域限红
 */
export const betAreaOdds  = {
    [BetAreasName.SINGLE]: {odds: 1.85, name: '单', limit: 25e5},
    [BetAreasName.DOUBLE]: {odds: 1.85, name: '双', limit: 25e5},
    [BetAreasName.ONE]: {odds: 3.7, name: '1番', limit: 13e5},
    [BetAreasName.TWO]: {odds: 3.7, name: '2番', limit: 13e5},
    [BetAreasName.THREE]: {odds: 3.7, name: '3番', limit: 13e5},
    [BetAreasName.FOUR]: {odds: 3.7, name: '4番', limit: 13e5},
    [BetAreasName.ONE_FOR_TWO]: {odds: 2.75, name: '1念2', limit: 18e5},
    [BetAreasName.ONE_FOR_THREE]: {odds: 2.75, name: '1念3', limit: 18e5},
    [BetAreasName.ONE_FOR_FOUR]: {odds: 2.75, name: '1念4', limit: 18e5},
    [BetAreasName.TWO_FOR_FOUR]: {odds: 2.75, name: '2念4', limit: 18e5},
    [BetAreasName.TWO_FOR_ONE]: {odds: 2.75, name: '2念1', limit: 18e5},
    [BetAreasName.TWO_FOR_THREE]: {odds: 2.75, name: '2念3', limit: 18e5},
    [BetAreasName.THREE_FOR_ONE]: {odds: 2.75, name: '3念1', limit: 18e5},
    [BetAreasName.THREE_FOR_TWO]: {odds: 2.75, name: '3念2', limit: 18e5},
    [BetAreasName.THREE_FOR_FOUR]: {odds: 2.75, name: '3念4', limit: 18e5},
    [BetAreasName.FOUR_FOR_ONE]: {odds: 2.75, name: '4念1', limit: 18e5},
    [BetAreasName.FOUR_FOR_TWO]: {odds: 2.75, name: '4念2', limit: 18e5},
    [BetAreasName.FOUR_FOR_THREE]: {odds: 2.75, name: '4念3', limit: 18e5},
    [BetAreasName.ONE_TWO_ANGLE]: {odds: 1.85, name: '1/2角', limit: 25e5},
    [BetAreasName.TWO_THREE_ANGLE]: {odds: 1.85, name: '2/3角', limit: 25e5},
    [BetAreasName.THREE_FOUR_ANGLE]: {odds: 1.85, name: '3/4角', limit: 25e5},
    [BetAreasName.ONE_FOUR_ANGLE]: {odds: 1.85, name: '1/4角', limit: 25e5},
    [BetAreasName.ONE_TWO_THREE_DOOR]: {odds: 1.25, name: '123门', limit: 4e6},
    [BetAreasName.ONE_TWO_FOUR_DOOR]: {odds: 1.25, name: '124门', limit: 4e6},
    [BetAreasName.ONE_THREE_FOUR_DOOR]: {odds: 1.25, name: '134门', limit: 4e6},
    [BetAreasName.TWO_THREE_FOUR_DOOR]: {odds: 1.25, name: '234门', limit: 4e6},
};