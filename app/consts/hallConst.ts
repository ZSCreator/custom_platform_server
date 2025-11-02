'use strict';



/**百人类分场的游戏 */
export const BAIREN_SCENE_ID = ['3', '8', '9', '14', '17', '19', '41', '42', '43', '49', '51', '53', '58', '81', '82', '85'];

/**需要断线重连的游戏 */
export const OFF_LINE_CONNECT = ['2', '3', '4', '5', '6', '8', '9', '11', '13', '14', '15', '16', '17', '18', '19', "20", '21', '23', '25', '34', '40', '42', '43', '45', '46', '47', '49',
    '51', '50', '53', '54', '58', '81', '82', '83', '84', '41', '85'];

// http请求的最长等待时间，超过这个时间就抛出超时异常
export const HTTP_REQUEST_TIMEOUT = 6000;


// 语言类型 language
export const LANGUAGE = {
    DEFAULT: 'chinese_zh',        //（暂时改为简体）
    CHINESE_ZH: 'chinese_zh',     // 简体
    ENGLISH: 'english',           // 英文
    Dai: 'Dai',                   // 泰语
    Vietnamese: 'Vietnamese',     // 越南语
    Portugal: 'Portugal',         // 葡萄牙语
    Indonesia: 'Indonesia',       // 印尼
    Malaysia: 'Malaysia',         // 马来西亚
    Spanish: 'Spanish',           // 西班牙语
    Hindi: 'Hindi',               // 印尼语
};

// 语言类型
export const LANGUAGE_LIST = ['chinese_zh', 'english', 'Dai', 'Vietnamese', 'Portugal', 'Indonesia', 'Malaysia', 'Spanish', 'Hindi'];



// 玩家所处的位置
export const PLAYER_POSITIONS = {
    HALL: 0,            // 大厅里
    BEFORE_ENTER: 1,    // 选场或选房间界面
    GAME: 2,            // 游戏中
};




/**离线后游戏回合数 */
export const OFFLINE_NUM = 3;

/**服务器状态 */
export const SERVER_STATUS = 4;//服务器即将关闭


/**是否记录机器人行为日志 */
export const LOG_ISROBOT = false;


/**支付页面消息通道名字 */
export const PAY_CHANNEL = 'PAY_NOTE';
/**跑马灯最大缓存数量 */
export const NOTEMAXNUM = 100;

/**提示金币不足状态码 */
export const CODE = 400;



// 发送重置救济金的通知
export const SEND_BENEFITS_MSG = 'SEND_BENEFITS_MSG';

/**谷歌刷新令牌 */
export const REFRESH_TOKEN = '1/M7Cb3r_vlCh7qNlRgtqKByrQdYzl88D-3sxlvtoBC7k';
export const CLIENT_ID = '490922536918-0pf67v1mobd1ob08uog3rqg9enl22kr9.apps.googleusercontent.com';
export const CLIENT_SECRET = 'I_YeR8JD0GLKMat5YfXBE9K0';

/**redis中系统赠送玩家的金币数量 key eg：绑定手机赠送金币、绑定邀请码赠送金币 */
export const GIVE_GOLD_COUNT = 'hall:give_gold_count';


/**有兜底配置的游戏 */
export const SLOT_WIN_LIMIT_NID_LIST = ['1', '7', '11', '12', '6', '10',
    '24', '15', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',
    '37', '38', '39', '52', '54', '60'];




/**基础类型 */
export const BASE_TYPE = {
    ARR: '[object Array]',
    OBJ: '[object Object]',
    STR: '[object String]',
    NUM: '[object Number]',
    SYMBOL: '[object Symbol]',
    BOOL: '[object Boolean]',
    NULL: '[object Null]',
    UNDEFINED: '[object Undefined]',
    FUN: '[object Function]',
};

/**所有街机 */
export const SLOTS_GAME = ['1', '7', '10', '11', '12', '26', '27', '44', '24',
    '15', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '37',
    '38', '39', '52', '54', '60'];


/**钱包最大存储的金币上限：亿 */
export const MAX_DEPOSIT_COUNT = 999999999;

/**钱包操作类型 */
export const OP_TYPE = {
    DEPOSIT: 1,
    WITHDRAW: 2,
};

/**救济金操作记录类型 */
export const ALMS_TYPE = {
    ADD_NID: 't3',
    ADD_NAME: '救济金',
};

/**绑定手机操作记录类型 */
export const CELLPHONE_TYPE = {
    ADD_NID: 't4',
    ADD_NAME: '绑定手机',
};

