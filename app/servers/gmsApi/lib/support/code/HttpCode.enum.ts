export enum HttpCode {
    // 成功
    SUCCESS = 200,

    // 参数错误
    BAD_REQUEST = 400,

    // 出错
    FAIL = 500,

    /** 会员充值 */
    // 未找到管理员信息
    Not_Find_ManagerInfo = 10001,
    // 充值失败
    Recharge_Failure = 10002,

    /** 根据uid查询昵称 */
    // 未查询到玩家信息
    Not_Find_PlayerInfo = 10003,

    /** 支付类型 pay_type */
    // 未查询到支付信息
    PayType_Not_Find = 10004,

    // 正在对局无法扣款
    Player_Is_Gaming = 10005,

    // 玩家金币不足
    Player_Gold_Not_Enough = 10006,

    // 玩家钱包金币不足
    Player_WalletGold_Not_Enough = 10007,

    /** 管道统计 */
    // 查询区间不应超过30天
    No_More_Than_30_Days = 10008,

    /** 代理、平台、租户 */

    /** @property 平台已存在 */
    Platform_Existence = 20001,

    /** @property 代理已存在 */
    Agent_Existence = 20002,

    /** @property 平台不存在 */
    Platfrom_Nonexistence = 20003,

    /** @property 平台金币不足 */
    PlatformGold_Not_Enough = 20004,

    /** @property 代理不存在 */
    Agent_Nonexistence
}