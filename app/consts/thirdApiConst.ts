'use strict'
/**
 * 构建Redis的token key
 * @param token
 * @returns {string}
 */
export const buildTokenKey = (token) => {
    return redisTokenKey + ":" + token;
};
export const buildTokenUidKey = (uid) => {
    return redisTokenUidKey + ":" + uid;
};

export const redisTokenKey        = 'token';
export const redisTokenUidKey     = 'uid-token';
export const redisTokenTime       = 300;                              // token的缓存时间（秒）
export const tokenNotLimitTimes   = false;                            // 是否不限制token的使用次数，默认false,限制 1次
export const THIRD_INTRGRAL_TABLE = 'third_gold_record';              // 第三方上分下分操作记录
export const THIRD_CONFIG_REBATE  = 'third_config_rebate';            // 第三方返点全局配置
export const AGENT_NAME           = '皇家_API';                         // 代理名称
export const ATTACK_REGEX         = /.*[\\|%|<|>|'|"].*/;             // 攻击字符
export const ARGUMENT_ERROR       = {status: 2, err_msg: '参数错误'};     // 参数错误
export const ILLEGALITY_REQ       = {status: 3, err_msg: '非法调用方'};    // 非法调用方
export const DANGER_REQ           = {status: 501, err_msg: '参数非法'};   // 不安全调用
export const INVALID_CAPTCHA      = {status: 101, err_msg: '验证码错误'};  // 验证码错误
export const SYS_ERR              = {status: 500, err_msg: '系统错误'};   // 系统错误
export const SYS_CLOSE            = {status: 501, err_msg: '系统维护'};   // 系统维护

/**
 * 注册返回参数
 * @type {{USER_HAS_EXIST: number, SUCCESS: number, ARGUMENT_ERROR: number, ILLEGALITY_REQ: number}}
 */
export const register = {
    USER_HAS_EXIST : {status: 0, err_msg: '用户名已存在'},     //用户名已存在
    PHONE_HAS_EXIST: {status: 102, err_msg: '手机号已注册'},   //用户名已存在
    SUCCESS        : {status: 1, err_msg: '成功注册'},       //成功注册
};
/**
 * 用户查询返回参数
 * @type {{HAS_NOT_EXIST: {status: number, err_msg: string}, SUCCESS: {status: number, err_msg: string}}}
 */
export const queryUser = {
    HAS_NOT_EXIST: {status: 0, err_msg: '用户不存在'},    //用户不存在
    SUCCESS      : {status: 1, err_msg: '存在指定用户'},   //存在指定用户
};
/**
 * 登录返回参数
 * @type {{SUCCESS: {status: number, err_msg: string}, HAS_NOT_EXIST: {status: number, err_msg: string}}}
 */
export const login = {
    SUCCESS      : {status: 1, err_msg: '成功登录'},         //成功登录
    HAS_NOT_EXIST: {status: 502, err_msg: '用户名或密码错误'},   //用户名或密码错误
};
/**
 * 修改密码返回参数
 * @type {{SUCCESS: {status: number, err_msg: string}, HAS_NOT_EXIST: {status: number, err_msg: string}, EQUAL_CHANGE: {status: number, err_msg: string}}}
 */
export const changePwd = {
    SUCCESS      : {status: 1, err_msg: '修改密码成功'},        //修改密码成功
    HAS_NOT_EXIST: {status: 4, err_msg: '用户不存在'},         //用户不存在
    EQUAL_CHANGE : {status: 5, err_msg: '修改密码与原始密码相同'},   //修改密码与原始密码相同
};
/**
 * 查询剩余积分返回参数
 * @type {{SUCCESS: {status: number, err_msg: string}, HAS_NOT_EXIST: {status: number, err_msg: string}}}
 */
export const queryGold = {
    SUCCESS      : {status: 1, err_msg: '查询成功'},    //查询成功
    HAS_NOT_EXIST: {status: 4, err_msg: '用户不存在'},   //用户不存在
};
/**
 * 添加积分返回参数
 * @type {{SUCCESS: {status: number, err_msg: string}, HAS_NOT_EXIST: {status: number, err_msg: string}, EQUAL_CHANGE: {status: number, err_msg: string}}}
 */
export const addGold = {
    SUCCESS         : {status: 1, err_msg: '上分成功'},    //上分成功
    HAS_NOT_EXIST   : {status: 4, err_msg: '用户不存在'},   //用户不存在
    PLAYER_NOT_EXIST: {status: 6, err_msg: '玩家不存在'},   //用户不存在
};
/**
 * 下分的返回参数
 * @type {{SUCCESS: {status: number, err_msg: string}, HAS_NOT_EXIST: {status: number, err_msg: string}, ILLEGALITY_REDUCE: {status: number, err_msg: string}}}
 */
export const reduceGold = {
    SUCCESS          : {status: 1, err_msg: '下分成功'},     //下分成功
    HAS_NOT_EXIST    : {status: 4, err_msg: '用户不存在'},    //用户不存在
    ILLEGALITY_REDUCE: {status: 5, err_msg: '下分金额非法'},   //下分金额非法
};
/**
 * 踢出玩家的返回参数
 * @type {{SUCCESS: {status: number, err_msg: string}, HAS_NOT_EXIST: {status: number, err_msg: string}}}
 */
export const logoffUser = {
    SUCCESS      : {status: 1, err_msg: '成功踢出玩家'},   //下分成功
    HAS_NOT_EXIST: {status: 4, err_msg: '用户不存在'},    //用户不存在
};

/**
 * 更新用户返点返回参数
 * @type {{SUCCESS: {status: number, err_msg: string}, HAS_NOT_EXIST: {status: number, err_msg: string}}}
 */
export const syncRebate = {
    SUCCESS      : {status: 1, err_msg: '设置成功'},    //下分成功
    HAS_NOT_EXIST: {status: 4, err_msg: '用户不存在'},   //用户不存在
};

/**
 * 简单返回
 * @param code      状态码
 * @param message   消息
 */
export const simpleResp = (code, message) => {
    return {
        status : code,
        err_msg: message
    };
}

/**
 * 皇家返点全局默认值
 * 
 */
export const defaultThirdConfigRebate = {
    add_time   : Date.now(),   // 添加时间时间
    modify_time: Date.now(),   // 更改时间
    agent_name : AGENT_NAME,   // 代理名字
    max        : 10,           // 顶层代理返点可设置上限
    min        : 0,            // 顶层代理返点可设置下限
    min_step   : 0,            // 代理最小保留间隔
}