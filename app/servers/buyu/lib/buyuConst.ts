export const CHANNEL_NAME = 'buyu';
/**每个人最大子弹限制 */
export const MAX_BULLET_COUNT = 20;
/**屏幕最多可以容纳多少鱼 */
export const G_iFish_Count = 300;
export const Width = 1440;
export const Height = 900;
/**坐标 */
export interface Position {
    x: number,
    y: number
};

/**鱼信息结构体 */
export interface Fish_info {
    kind: number,
    name?: string,
    /**类型 */
    type?: number,
    multiple: number,
    /**鱼id */
    fish_id?: number,
    /**创建时间 */
    create_time?: number,
    /**持续时间 */
    aliveTime?: number,
    /**一网打尽 */
    // net_all?: boolean;
    path_arr?: number[];
    fish_group?: number
    /**游动路线 */
    path?: number,
    places?: number[]
}
/**子弹信息结构体 */
export interface Bullet_info {
    kind: number,
    name: string,
    speed: number,
    /**鱼网半径 */
    netRadius: number,
    /**子弹id 递增 */
    Bullet_id?: number,
    angle?: number,
    lock_fishid?: number,
    multiple?: number,
}

/**各种鱼 */
export const Fish_list: Fish_info[] = [
    { kind: 1, name: "蜗牛鱼", type: 1, multiple: 2, aliveTime: 60 * 1000, },
    { kind: 2, name: "绿草鱼", type: 1, multiple: 3, aliveTime: 60 * 1000, },
    { kind: 3, name: "黄草鱼", type: 1, multiple: 4, aliveTime: 60 * 1000, },
    { kind: 4, name: "大眼鱼", type: 1, multiple: 5, aliveTime: 60 * 1000, },
    { kind: 5, name: "黄边鱼", type: 1, multiple: 6, aliveTime: 60 * 1000, },
    { kind: 6, name: "小丑鱼", type: 1, multiple: 7, aliveTime: 60 * 1000, },
    { kind: 7, name: "小刺鱼", type: 1, multiple: 8, aliveTime: 60 * 1000, },
    { kind: 8, name: "蓝鱼", type: 1, multiple: 10, aliveTime: 60 * 1000, },
    { kind: 9, name: "灯笼鱼", type: 1, multiple: 12, aliveTime: 60 * 1000, },
    { kind: 10, name: "海龟", type: 1, multiple: 15, aliveTime: 60 * 1000, },
    { kind: 11, name: "孔雀鱼", type: 1, multiple: 18, aliveTime: 60 * 1000, },
    { kind: 12, name: "蝴蝶鱼", type: 1, multiple: 18, aliveTime: 60 * 1000, },
    { kind: 13, name: "长尾鱼", type: 1, multiple: 18, aliveTime: 60 * 1000, },
    { kind: 14, name: "剑鱼", type: 1, multiple: 20, aliveTime: 60 * 1000, },
    { kind: 15, name: "蝙蝠鱼", type: 1, multiple: 25, aliveTime: 60 * 1000, },
    { kind: 16, name: "银锤头鲨", type: 1, multiple: 30, aliveTime: 60 * 1000, },
    { kind: 17, name: "黄锤头鲨", type: 1, multiple: 35, aliveTime: 60 * 1000, },
    { kind: 18, name: "黄金鲨", type: 1, multiple: 35, aliveTime: 60 * 1000, },
    { kind: 19, name: "海豚", type: 1, multiple: 35, aliveTime: 60 * 1000, },
    /**(闪电鱼：击杀后把周围鱼 击杀)，places:[1] (组合鱼 只要 一条鱼 类型 1~10 随机) */
    { kind: 20, name: "闪电鱼", type: 1, multiple: 1, aliveTime: 60 * 1000, },
    { kind: 21, name: "企鹅", type: 1, multiple: 35, aliveTime: 60 * 1000, },
    { kind: 22, name: "美人鱼", type: 1, multiple: 75, aliveTime: 60 * 1000, },
    /**(大闹天空: 击杀同类型鱼)，places:[1] (组合鱼 只要 一条鱼 类型 1~10 随机) */
    { kind: 23, name: "大闹天空", type: 1, multiple: 1, aliveTime: 60 * 1000, },
    { kind: 24, name: "丑章鱼", type: 1, multiple: 80, aliveTime: 60 * 1000, },
    /**(一箭双雕: 顾名思义)，places:[1，5] (组合鱼 只要 俩条鱼 类型 1~10 随机) */
    { kind: 25, name: "一箭双雕", type: 1, multiple: 1, aliveTime: 60 * 1000, },
    /**(一箭三雕: 顾名思义)，places:[1，5，10] (组合鱼 只要 三条鱼 类型 1~10 随机) */
    { kind: 26, name: "一箭三雕", type: 1, multiple: 1, aliveTime: 60 * 1000, },
    /** 小范围爆炸 大范围爆炸 全屏冰冻*/
    { kind: 27, name: "炼丹炉1", type: 1, multiple: 90, aliveTime: 60 * 1000, },
    { kind: 28, name: "炼丹炉2", type: 1, multiple: 90, aliveTime: 60 * 1000, },
    { kind: 29, name: "炼丹炉3", type: 1, multiple: 90, aliveTime: 60 * 1000, },

    { kind: 30, name: "银龙", type: 1, multiple: 100, aliveTime: 60 * 1000, },
    { kind: 31, name: "黄金龙", type: 1, multiple: 120, aliveTime: 60 * 1000, },
    { kind: 32, name: "玉皇大帝", type: 5, multiple: 200, aliveTime: 60 * 1000, },
    /**鬼船 ，默认 4 条鱼 [17, 15, 9, 9] */
    { kind: 33, name: "神仙船", type: 1, multiple: 50, aliveTime: 60 * 1000, },
    /**全屏击杀 */
    { kind: 34, name: "万佛朝宗", type: 1, multiple: 20, aliveTime: 60 * 1000, },
    { kind: 35, name: "孙悟空", type: 4, multiple: 180, aliveTime: 60 * 1000, },
]

/**各种子弹 */
export const Bullet_lsit: Bullet_info[] = [
    { kind: 0, name: "1炮筒", speed: 16, netRadius: 70, multiple: 1 },
    { kind: 1, name: "2炮筒", speed: 16, netRadius: 70, multiple: 2 },
    { kind: 2, name: "3炮筒", speed: 16, netRadius: 70, multiple: 3 },
    { kind: 3, name: "4炮筒", speed: 16, netRadius: 70, multiple: 4 },
    { kind: 4, name: "5炮筒", speed: 16, netRadius: 80, multiple: 5 },
    { kind: 5, name: "6炮筒", speed: 16, netRadius: 80, multiple: 6 },
    { kind: 6, name: "7炮筒", speed: 16, netRadius: 80, multiple: 7 },
    { kind: 7, name: "8炮筒", speed: 16, netRadius: 80, multiple: 8 },
    { kind: 8, name: "9炮筒", speed: 16, netRadius: 80, multiple: 9 },
    { kind: 9, name: "10炮筒", speed: 16, netRadius: 80, multiple: 10 },
]

/**鱼组权重 */
export const weights = [
    { id: 1, name: "小鱼", group: 1, min: 30, max: 40, weight: 10 },
    { id: 2, name: "小鱼2", group: 2, min: 30, max: 40, weight: 10 },
    { id: 3, name: "小中鱼", group: 3, min: 19, max: 23, weight: 10 },
    { id: 4, name: "炸弹组", group: 4, min: 2, max: 3, weight: 30 },
    { id: 5, name: "中大鱼", group: 5, min: 2, max: 5, weight: 50 },
    { id: 6, name: "大鱼", group: 6, min: 2, max: 2, weight: 50 },
    { id: 7, name: "冰冻组", group: 7, min: 1, max: 1, weight: 70 },
    { id: 8, name: "大大鱼1", group: 8, min: 1, max: 1, weight: 70 },
    { id: 9, name: "黄金鱼", group: 9, min: 1, max: 1, weight: 90 },
    { id: 10, name: "boos1", group: 10, min: 1, max: 1, weight: 90 },
    { id: 11, name: "boos2", group: 11, min: 1, max: 1, weight: 90 },
    { id: 12, name: "boos3", group: 12, min: 2, max: 2, weight: 50 },
]

/**鱼组中的鱼 */
export const fish_group = [
    {
        group: 1, name: "小鱼", weights: [
            { kind: 1, weight: 20 },
            { kind: 2, weight: 20 },
            { kind: 3, weight: 20 },
            { kind: 4, weight: 20 },
            { kind: 5, weight: 20 },
        ]
    },
    {
        group: 2, name: "小鱼2", weights: [
            { kind: 1, weight: 20 },
            { kind: 2, weight: 20 },
            { kind: 3, weight: 20 },
            { kind: 4, weight: 20 },
            { kind: 5, weight: 20 },
            { kind: 6, weight: 20 },
            { kind: 7, weight: 20 },
            { kind: 8, weight: 20 },
            { kind: 9, weight: 20 },
            { kind: 10, weight: 20 },
            { kind: 11, weight: 20 },
            { kind: 12, weight: 20 },
            { kind: 13, weight: 20 },
            { kind: 14, weight: 20 },
            { kind: 15, weight: 20 },
        ]
    },
    {
        group: 3, name: "小中鱼", weights: [
            { kind: 1, weight: 10 },
            { kind: 2, weight: 10 },
            { kind: 3, weight: 10 },
            { kind: 4, weight: 10 },
            { kind: 5, weight: 10 },
            { kind: 6, weight: 10 },
            { kind: 7, weight: 10 },
            { kind: 8, weight: 10 },
            { kind: 9, weight: 10 },
            { kind: 10, weight: 10 },
            { kind: 23, weight: 20 },
        ]
    },
    {
        group: 4, name: "炸弹组", weights: [
            { kind: 6, weight: 13 },
            { kind: 8, weight: 13 },
            { kind: 18, weight: 13 },
            { kind: 20, weight: 13 },
            { kind: 25, weight: 15 },
        ]
    },
    {
        group: 5, name: "中大鱼", weights: [
            { kind: 7, weight: 7 },
            { kind: 8, weight: 7 },
            { kind: 9, weight: 7 },
            { kind: 10, weight: 7 },
            { kind: 11, weight: 7 },
            { kind: 12, weight: 7 },
            { kind: 13, weight: 7 },
            { kind: 14, weight: 7 },
            { kind: 15, weight: 11 },
            { kind: 16, weight: 11 },
            { kind: 17, weight: 11 },
            // { kind: 33, weight: 11 },
        ]
    },
    {
        group: 6, name: "大鱼", weights: [
            { kind: 12, weight: 14 },
            { kind: 13, weight: 14 },
            { kind: 14, weight: 14 },
            { kind: 15, weight: 14 },
            { kind: 16, weight: 14 },
            { kind: 17, weight: 14 },
            { kind: 18, weight: 16 },
            { kind: 20, weight: 15 },
        ]
    },
    {
        group: 7, name: "冰冻组", weights: [
            // { kind: 18, weight: 15 },
            { kind: 19, weight: 15 },
            { kind: 20, weight: 15 },
            // { kind: 21, weight: 15 },
            { kind: 22, weight: 15 },
        ]
    },
    {
        group: 8, name: "大大鱼1", weights: [
            { kind: 15, weight: 13 },
            { kind: 18, weight: 13 },
            { kind: 19, weight: 13 },
            // { kind: 21, weight: 13 },
            { kind: 22, weight: 24 },
            { kind: 24, weight: 24 },
        ]
    },
    {
        group: 9, name: "黄金鱼", weights: [
            { kind: 1, weight: 13 },
            { kind: 2, weight: 12 },
            { kind: 10, weight: 25 },
            { kind: 17, weight: 25 },
            // { kind: 18, weight: 25 },
            { kind: 30, weight: 30 },
            { kind: 31, weight: 30 },
        ]
    },
    {
        group: 10, name: "boos1", weights: [
            { kind: 20, weight: 15 },
            { kind: 25, weight: 15 },
            { kind: 26, weight: 15 },
        ]
    },
    {
        group: 11, name: "boos2", weights: [
            { kind: 27, weight: 15 },
            { kind: 28, weight: 15 },
            { kind: 29, weight: 15 },
            { kind: 32, weight: 20 },
            { kind: 33, weight: 15 },
            { kind: 34, weight: 15 },
            { kind: 35, weight: 20 },
        ]
    },
    {
        group: 12, name: "boos3", weights: [
            { kind: 20, weight: 30 },
            { kind: 23, weight: 30 },
        ]
    }
]
/**鱼阵 0-6 */
export const fishZhen_arr = [
    [
        { fish_kind: 3, fish_count: 40 },
        { fish_kind: 14, fish_count: 16 },
        { fish_kind: 30, fish_count: 6 },
        { fish_kind: 4, fish_count: 52 },
        { fish_kind: 11, fish_count: 26 },
        { fish_kind: 31, fish_count: 6 },
    ],
    [
        { fish_kind: 2, fish_count: 11 * 4 },
        { fish_kind: 4, fish_count: 18 + 14 },
        { fish_kind: 31, fish_count: 1 },
        { fish_kind: 1, fish_count: 11 * 4 },
        { fish_kind: 4, fish_count: 18 + 14 },
        { fish_kind: 35, fish_count: 1 },
        { fish_kind: 2, fish_count: 11 * 4 },
        { fish_kind: 3, fish_count: 18 + 14 },
        { fish_kind: 32, fish_count: 1 }
    ],
    [
        { fish_kind: 4, fish_count: 30 },
        { fish_kind: 6, fish_count: 14 },
        { fish_kind: 14, fish_count: 12 },
        { fish_kind: 15, fish_count: 6 },
        { fish_kind: 30, fish_count: 5 },
        { fish_kind: 31, fish_count: 5 }
    ],
    [
        { fish_kind: 1, fish_count: 40 },
        { fish_kind: 3, fish_count: 40 },
        { fish_kind: 4, fish_count: 24 },
        { fish_kind: 6, fish_count: 13 },
        { fish_kind: 35, fish_count: 1 }
    ],
    [
        { fish_kind: 1, fish_count: 40 },
        { fish_kind: 3, fish_count: 40 },
        { fish_kind: 4, fish_count: 24 },
        { fish_kind: 6, fish_count: 13 },
        { fish_kind: 32, fish_count: 1 }
    ],
    [
        { fish_kind: 1, fish_count: 50 },
        { fish_kind: 2, fish_count: 50 },
        { fish_kind: 3, fish_count: 40 },
        { fish_kind: 4, fish_count: 40 },
        { fish_kind: 5, fish_count: 22 },
        { fish_kind: 6, fish_count: 22 },
        { fish_kind: 32, fish_count: 1 },
        { fish_kind: 35, fish_count: 1 }
    ]
]
