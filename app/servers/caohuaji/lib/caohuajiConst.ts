import * as hallConst from '../../../consts/hallConst';
export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;
export const CHANNEL_NAME = 'caohuaji';

//流水池转基础奖池时间
export const JACKPOTTIME = 20 * 1000;

//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;

export const ERROR_MESSAGE = {
    0: '加载失败',
    1: '下注失败',
    2: '玩家列表失败',
    3: '获取奖池失败',
    4: '获取开奖记录失败'
};