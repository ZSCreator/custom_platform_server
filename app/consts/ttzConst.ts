import * as hallConst from './hallConst';
export const CHANNEL_NAME = 'ttz';
export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;//离线玩家最大能参加游戏的局数

//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;

// 下注倒计时
export const BET_TIME = 25e3;



export const ERROR_MESSAGE = {
    0: '加载失败',
    1: '申请开始下注失败',
    2: '申请结果失败',
    3: '下注失败',
    4: '需押失败',
    5: '申请玩家列表失败',
    6: '获取排行榜失败',
}
