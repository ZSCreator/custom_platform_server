import * as  hallConst from './hallConst';

export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;
export const CHANNEL_NAME = 'WanRenJH';
export const FAN_JIANG = 10;//返奖达到十倍
export const XIAN_HONG = 10;//限红倍数
export const TIAO_KONG = 7;//调控结果集获取次数（次数越大，调控精度越准确）
export const ZHUANG_NUM = 5;//当庄轮数
export const CHOU_SHUI = 0.4;//提前下庄抽水

//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;

// export const ERROR_MESSAGE = {
//     0: '加载失败',
//     1: '申请开始下注失败',
//     2: '申请结果失败',
//     3: '下注失败',
//     4: '需押失败',
//     5: '申请玩家列表失败',
//     6: '获取排行榜失败',
//     7: '申请上庄列表失败',
//     8: '申请上庄失败',
//     9: '申请下庄失败',
//     10: '取消上庄队列失败',
// }