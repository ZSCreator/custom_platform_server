/**
 * 房间状态
 * @property DEAL 下注状态
 * @property BET 下注状态
 * @property LOTTERY 开奖
 * @property SECOND_BET 再次押注
 * @property SECOND_LOTTERY 再次开奖
 * @property SETTLEMENT 结算
 */
export enum RoomState {
    DEAL = 'andarBaharDeal',
    BET = 'andarBaharBet',
    LOTTERY = 'andarBaharLottery',
    SECOND_BET = 'andarBaharSecondBet',
    SECOND_LOTTERY = 'andarBaharSecondLottery',
    SETTLEMENT = 'andarBaharSettlement'
}

/**
 * 消息路由
 * @property PLAYERS_CHANGE 玩家列表发生变化
 * @property START_BET_STATE 开始下注状态
 * @property START_START_DEAL_STATE_STATE 开始发牌状态
 * @property START_LOTTERY_STATE 开始开奖状态
 * @property START_SECOND_BET_STATE 开始再次下注状态
 * @property START_SECOND_LOTTERY_STATE 开始再次开奖状态
 * @property START_SETTLEMENT_STATE 开始结算状态
 * @property PLAYER_BET 通知有玩家下注
 * @property PLAYER_SKIP 玩家跳过第二轮下注
 * @property GET_OUT 踢出玩家
 */
export enum MsgRoute {
    PLAYERS_CHANGE = 'playersChange',
    START_BET_STATE = 'startBetState',
    START_DEAL_STATE = 'startDealState',
    START_LOTTERY_STATE = 'startLotteryState',
    START_SECOND_BET_STATE = 'startSecondBetState',
    START_SECOND_LOTTERY_STATE = 'startSecondLotteryState',
    START_SETTLEMENT_STATE = 'startSettlementState',
    PLAYER_BET = 'playerBet',
    PLAYER_SKIP = 'playerSkip',
    GO_OUT = 'goOut',
}
