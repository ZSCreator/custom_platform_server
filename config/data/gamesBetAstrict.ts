/**游戏限红配置 */
export const betAstrict = {
    /**baijia */
    nid_8: {
        sceneId_0: [1, 10000],
        sceneId_1: [5, 20000],
        sceneId_2: [20, 50000],
    },
    /**bairen */
    nid_9: {
        sceneId_0: [1, 10000],
        sceneId_1: [1, 20000],
        // sceneId_2: [20, 50000],
    },
    /**BenzBmw */
    nid_14: {
        sceneId_0: [1, 10000],
        sceneId_1: [5, 20000],
        sceneId_2: [20, 50000],
    },
    /**RedBlack */
    nid_19: {
        sceneId_0: [1, 10000],
        sceneId_1: [5, 20000],
        sceneId_2: [20, 50000],
    },
    /**DragonTiger */
    nid_42: {
        sceneId_0: [1, 10000],
        sceneId_1: [10, 20000],
        sceneId_2: [20, 50000],
    },
    /**SicBo */
    // nid_43: {
    // },
    /**redPacket */
    nid_81: {
        sceneId_0: [10, 500],
        sceneId_1: [10, 500],
    },
    ratio: 100
};
/**
 * 押注区域
 */
enum BetAreas {
    /**BetAreas.BMW */
    BMW = 'BMW',
    /**BetAreas.Benz */
    Benz = 'Benz',
    /**BetAreas.Audi */
    Audi = 'Audi',
    /**阿尔法·罗密欧 */
    AlfaRomeo = 'AlfaRomeo',
    /**BetAreas.Maserati */
    Maserati = 'Maserati',
    /**BetAreas.Porsche */
    Porsche = 'Porsche',
    /**BetAreas.Lamborghini */
    Lamborghini = 'Lamborghini',
    /**BetAreas.Ferrari */
    Ferrari = 'Ferrari'
}

export const BenzLimit_totalBet = [
    { area: BetAreas.BMW, Limit: [1500 * 100, 3000 * 100] },
    { area: BetAreas.Benz, Limit: [1500 * 100, 3000 * 100] },
    { area: BetAreas.Audi, Limit: [1500 * 100, 3000 * 100] },
    { area: BetAreas.AlfaRomeo, Limit: [1500 * 100, 3000 * 100] },
    { area: BetAreas.Maserati, Limit: [550 * 100, 800 * 100] },
    { area: BetAreas.Porsche, Limit: [450 * 100, 700 * 100] },
    { area: BetAreas.Lamborghini, Limit: [300 * 100, 600 * 100] },
    { area: BetAreas.Ferrari, Limit: [250 * 100, 500 * 100] },
]
