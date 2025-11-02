// 小游戏布局
export const littleGameLayout = {
    '1': [
        'silver', 'copper', 'silver', 'copper', 'copper', 'null',
        'silver', 'copper', 'dice', 'copper', 'null', 'copper',
        'gold', 'null', 'silver', 'dice', 'gold', 'null',
        'copper', 'silver', 'gold', 'null', 'copper', 'silver',
        'copper', 'silver', 'gold', 'bonus'
    ],
    '2': [
        'gold', 'copper', 'silver', 'copper', 'silver', 'null',
        'silver', 'dice', 'null', 'copper', 'null', 'copper',
        'gold', 'null', 'copper', 'silver', 'gold', 'null',
        'dice', 'silver', 'gold', 'null', 'copper', 'silver',
        'gold', 'silver', 'gold', 'bonus'
    ],
    '3': [
        'silver', 'copper', 'copper', 'copper', 'copper', 'null',
        'silver', 'dice', 'copper', 'copper', 'null', 'copper',
        'copper', 'gold', 'silver', 'copper', 'copper', 'null',
        'copper', 'silver', 'copper', 'gold', 'silver', 'dice',
        'copper', 'silver', 'gold', 'bonus'
    ]
};

// 小游戏award 赔率
export const awardOdds = {
    'null': 0,
    'gold': 1,
    'silver': 0.2,
    'copper': 0.1,
    'dice': 1,
};

// 终极宝箱 对应前端宝箱colossal
export const king = 'king';

// 钻石宝箱 对应前端宝箱monster
export const diamond = 'diamond';

// 铂金宝箱 对应前端宝箱mega
export const platinum = 'platinum';

// 黄金宝箱
export const gold = 'gold';

/**
 * 小游戏bonus宝箱配置
 * @property king 终极宝箱
 * @property diamond 钻石宝箱
 * @property platinum 铂金宝箱
 * @property gold 黄金宝箱
 */
export const littleGameBonusOdds = {
    [king]: 0.0008,
    [diamond]: 0.00008,
    [platinum]: 0.00005,
    [gold]: 0.00001,
};