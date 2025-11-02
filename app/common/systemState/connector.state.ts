/**
 * @property MISS_FIELD 参数缺失
 * @property BIND_SESSION_FAIL 绑定 session 失败
 * @property AUTH_TOKEN_FAIL token 不合法
 * @property CAN_NOT_FIND_PLAYER 未查询到玩家信息
 */
export enum connectorEnum {
    MISS_FIELD = 13001,
    BIND_SESSION_FAIL = 13002,
    AUTH_TOKEN_FAIL = 13003,
    CAN_NOT_FIND_PLAYER = 13004,
    HAD_BIND_SESSION = 13005
}