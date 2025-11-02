'use strict';
/**
 *  检测到http里面不包含key 值
 */
export const SUCCESS = { status: 0, msg: "成功" };  //成功
export const TOKEN_LOSE = { status: 1, msg: "TOKEN丢失" };  //TOKEN丢失
export const AGENT_NOT_EXIST = { status: 2, msg: "渠道不存在" };  //渠道不存在
export const TIMESTAMP_OVERTIME = { status: 3, msg: "验证时间超时" };  //成功
export const VALIDATION_ERROR = { status: 4, msg: "验证错误" };
export const AGENT_WHITE_ERROR = { status: 5, msg: "渠道白名单错误" };
export const VALIDATION_LOSE = { status: 6, msg: "验证字段丢失" };
export const NOT_FOUND_REQUEST = { status: 8, msg: "不存在的请求" };
export const AGENT_ERROR = { status: 15, msg: "渠道验证错误" };
export const DATA_NOT_EXIST = { status: 16, msg: "数据不存在" };
export const ACCOUNT_CLOSE = { status: 20, msg: "账号禁用" };
export const AES_ERROR = { status: 22, msg: "AES解密失败" };
export const ACCOUNT_LOSE = { status: 23, msg: "请传入会员账号" };
export const AGENT_GETDATA_OVERTIME = { status: 24, msg: "渠道拉取数据超过时间范围" };
export const ORDERID_NOT_EXIST = { status: 26, msg: "订单号不存在" };
export const MYSQL_ERROR = { status: 27, msg: "数据库异常" };
export const IP_CLOSE = { status: 28, msg: "ip禁用" };
export const ORDERID_RULE_ERROR = { status: 29, msg: "订单号与订单规则不符" };
export const ACCOUNT_OLINE_ERROR = { status: 30, msg: "获取玩家在线状态失败" };
export const UPDATE_MONEY_NEGATIVE = { status: 31, msg: "更新的分数小于或者等于0" };
export const UPDATE_PLAYER_ERROR = { status: 32, msg: "更新玩家信息失败" };
export const UPDATE_MONEY_ERROR = { status: 33, msg: "更新玩家金币失败" };
export const ORDERID_EXIST = { status: 34, msg: "订单重复" };
export const ACCOUNT_GET_LOSE = { status: 35, msg: "获取玩家信息失败" };
export const KINDID_NOT_EXIST = { status: 36, msg: "KindID不存在" };
export const LOGIN_ERROR = { status: 37, msg: "登陆瞬间禁止下分，导致下分失败" };
export const MONEY_BALANCE = { status: 38, msg: "余额不足导致下分失败" };
export const UP_DOWN_MONEY_ERROR = { status: 39, msg: "禁止同一个账号登陆带分，上分，下分并发请求，后一个请求被拒" };
export const NOT_OVER_MILLION = { status: 40, msg: "单次上下分数量不能超过一千万" };
export const STATISTICAL_TIME_ERROR = { status: 41, msg: "拉取对局汇总统计时间范围错误" };
export const AGENT_CLOSE = { status: 42, msg: "代理被禁用" };
export const LA_DAN = { status: 43, msg: "拉单过于频繁" };
export const ORDERID_ING = { status: 44, msg: "订单正在处理中" };
export const CANSHU_ERROR = { status: 45, msg: "参数错误" };
export const ACCOUNT_PLAYING = { status: 46, msg: "玩家正在游戏中,不允许操作" };
export const LA_DAN_LOSE = { status: 47, msg: "拉单失败" };
export const MONEY_ERROR = { status: 48, msg: "金币异常" };
export const GAME_LIMIT_ERROR =  {status: 49, msg: "拉取游戏记录限流"};
export const GAME_CLOSE =  {status: 50, msg: "游戏停服中,请稍后登陆"};
export const GAME_NOT_EXIST =  {status: 51, msg: "游戏不存在"};
export const REGISTER_EROR = { status: 1001, msg: "注册会员账号系统异常" };
export const AGENT_MONEY_NOT_ENOUGH = { status: 1002, msg: "代理商金额不足" };
export const Request_Timeout = { status: 1003, msg: "请求超时" };

/**
 * @property  HUNDRED              100
 */
export enum MONEY_BATE {
    HUNDRED = 100
}


/** 查询订单状态
 * @property  SUCCESS              成功
 * @property  EXIST              不存在
 * @property  FAIL              失败
 * @property  PROCESSING         处理中
 */
export enum THIRD_ORDERID_TYPE {
    SUCCESS = 0,
    EXIST = -1,
    FAIL = 2,
    PROCESSING = 3
}

/** 查看玩家是否在线
 * @property  NOT_ONLINE          不在线
 * @property  EXIST              不存在
 * @property  ONLINE             在线
 * @property  CLOSE             封停
 */
export enum PLAYER_ONLIE_TYPE {
    NOT_ONLINE = 0,
    EXIST = -1,
    ONLINE = 1,
    CLOSE = 2
}

/** 第三方平台的上下分的NID
 * @property  NID              t1
 */
export enum THIRD_ADD_GOLD {
    ADDNID = 't1',
    LOWERNID = 't2',
    ADDNAME = '平台上分',
    LOWERNAME = '平台下分'

}