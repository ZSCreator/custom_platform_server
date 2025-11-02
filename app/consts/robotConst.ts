/** 
 * 机器人的常量
 */

// robot服务器类型
export const ROBOT_SERVER_TYPE = 'robot';

// IP 类型：1是国内、2是国外
export const IP_TYPE = { DOMESTIC: 1, FOREIGN: 2 };

export const AVAILABLE_ROBOT_SET = 'robot:available_robot_set';                   // 可用的未分配的机器人
export const AVAILABLE_DOMESTIC_NAME = 'robot:available_domestic_name';           // 可用的中文名
export const AVAILABLE_FOREIGN_NAME = 'robot:available_foreign_name';             // 可用的英文名
export const AVAILABLE_HEAD_IMG_NAME = 'robot:available_img_head_name';           // 可用的机器人头像名称

/**最短的间隔 */
export const MIN_CHECK_ROBOT_NUM_INTERVAL = 1 * 10 * 1000;
export const MIN_CHECK_ROBOT_NUM_INTERVAL2 = 1 * 5 * 1000;
// 时时彩
export const SSC = {
    // 添加机器人的事件
    ADD_ROBOT_TO_SSC: 'ssc_add_robot',
    // 每一期的押注次数范围
    PERIOD_BET_TIMES: { LOW: 5, HIGH: 10 },
    // 每一次押注的金币范围
    EACH_BET_GOLD_RANGE: { LOW: 1000, HIGH: 100000 }
};

// 初级场金币范围单独处理的游戏（有上庄，初始金币增加）
export const SPECIAL_PRIMARY_INIT_GOLD_GAMES = ['9', '42', '53', '55'];
// 对战类机器人数量单独控制
export const PVP_ROBOT_GAMES = ['6', '15', '20', '45', '46', '47', '50'];

// 骰宝
export const SICBO = {
    // 添加机器人的事件
    ADD_ROBOT_TO_SICBO: 'sicbo_add_robot',
    //下注面板1
    POINTS: ['p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17'],
    //下注面板2
    THREE: ['t1', 't2', 't3', 't4', 't5', 't6', 'tany'],
    //两个异号组合
    TWO_GROUP_D: ['t12', 't13', 't14', 't15', 't16', 't23', 't24', 't25', 't26', 't34', 't35', 't36', 't45', 't46', 't56'],
    //两个同号组合
    TWO_GROUP_E: ['t11', 't22', 't33', 't44', 't55', 't66'],
    //骰子点数
    DICE_NUM: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'],
    //大小单双
    YZGL: ['big', 'small', 'single', 'double'],
};

// 欢乐百人
export const BAI_JIA = {
    BET_AREA: ["big", "small", 'bank', 'play', 'draw', 'pair0', 'pair1'],
    // 添加机器人的事件
    ADD_ROBOT_TO_BAIJIA: 'bai_jia_add_robot',
};

// 推筒子
export const TTZ = {
    // 添加机器人的事件
    ADD_ROBOT_TO_TTZ: 'ttz_add_robot',
    // 无庄的下注区域
    NO_BANKER_BET_AREA: ['east', 'south', 'west', 'north', 'center'],
    // 有庄的下注区域
    HAS_BANKER_BET_AREA: ['east', 'south', 'west', 'north'],
};

// 百人牛牛
export enum BULL_FIGHT {
    // 添加机器人的事件
    ADD_ROBOT_TO_BULLFIGHT = 'bull_fight_add_robot',
};

// 德州匹配
export enum TEXAS {
    // 添加机器人的事件
    ADD_ROBOT_TO_TEXAS = 'texas_add_robot',
};

// 红黑大战
export enum RED_BLACK {
    // 添加机器人的事件
    ADD_ROBOT_TO_RED_BLACK = 'red_black_add_robot',
};

// 龙虎
export const DRAGON_TIGER = {
    // 添加机器人的事件
    ADD_ROBOT_TO_DRAGON_TIGER: 'dragon_tiger_add_robot',
    DT_ARR: [
        "db",
        "dr",
        "dd",
        "ds",
        "tb",
        "tr",
        "td",
        "ts"
    ]
};

// 万人金花
export enum GOLDEN_FLOWER {
    // 添加机器人的事件
    ADD_ROBOT_TO_GOLDEN_FLOWER = 'golden_flower_add_robot'
};

// 21点
export enum BLACKJACK {
    // 添加机器人的事件
    ADD_ROBOT_TO_BLACKJACK = 'blackJack_add_robot'
};

// 国王与水手
export enum KING_SAILOR {
    // 添加机器人的事件
    ADD_ROBOT_TO_KING_SAILOR = 'king_sailor_add_robot'
};

// 斗地主
export enum DOU_DI_ZHU {
    // 添加机器人的事件
    ADD_ROBOT_TO_DOU_DI_ZHU = 'dou_di_zhu_add_robot',
    // 每个房间的机器人的最少数量
    LEAST_ROOM_ROBOT_NUM = 2,
    // 每次玩家进入时的最大补充次数
    MAX_SUPPLEMENT_TIMES = 20,
};

// 十三张
export enum CHINESE_POKER {
    // 添加机器人的事件
    ADD_ROBOT_TO_CHINESE_POKER = 'chinese_poker_add_robot',
};

// 三公
export enum SAN_GONG {
    // 添加机器人的事件
    ADD_ROBOT_TO_SAN_GONG = 'san_gong_add_robot',
};

// 比牌牛牛
export enum BI_PAI {
    // 添加机器人的事件
    ADD_ROBOT_TO_BI_PAI = 'bi_pai_add_robot',
};

// 三张牌
export enum ZHA_JIN_HUA {
    // 添加机器人的事件
    ADD_ROBOT_TO_ZHA_JIN_HUA = 'zha_jin_hua_add_robot',
};
// 抢庄牛牛
export enum QZNN {
    // 添加机器人的事件
    ADD_ROBOT_TO_QZNN = 'qznn_add_robot',
}
// 红包扫雷
export enum RED_PACKET {
    // 添加机器人的事件
    ADD_ROBOT = 'redPacket_add_robot'
}

// 色碟
export enum ColorPlate {
    ADD_ROBOT = 'colorAddRobot',
}

// 猜AB
export enum AndarBahar {
    ADD_ROBOT = 'andarBaharAddRobot',
}

// Rummy
export enum Rummy {
    ADD_ROBOT = 'RummyAddRobot',
}

// 番摊
export enum FanTan {
    ADD_ROBOT = 'fanTanAddRobot',
}