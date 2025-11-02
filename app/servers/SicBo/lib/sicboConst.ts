import * as  hallConst from '../../../consts/hallConst';

export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;//玩家离线局数
export const CHANNEL_NAME = 'sicbo';//游戏名字
export const FAN_JIANG = 5;//返奖倍数（播放走马灯）
export const BET_XIANZHI = 10;//押注限制（顶注的10倍）
/**下注时间 */
export const BETTING = 15;
/**开奖时间 */
export const KAIJIANG = 4;
/**结算时间 */
export const JIESUAN = 4;

//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;

// export const ERROR_MESSAGE = {
//     0: '获取押注区域失败',
//     1: '获取玩家列表失败',
//     2: '获取排行榜失败',
//     3: '下注失败',
//     4: '获取开奖记录失败'
// }
//特殊骰子
export const SPECIAL_DOT = {
    THREE_ONE: [1, 1, 1],
    THREE_SIX: [6, 6, 6]
}

// 对押区域
export const mapping = {
    big: 'small',
    small: 'big',
    single: 'double',
    double: 'single',
};

export const mappingAreas = ['small', 'big', 'double', 'single'];

// 复式押注区域
export const diceNum = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

// 对押限制
export const betLimit = 1000000;

// 豹子
export const leopards = ['t1', 't2', 't3', 't4', 't5', 't6'];
