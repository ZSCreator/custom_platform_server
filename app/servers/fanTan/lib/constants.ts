/**
 * 房间状态
 * @property BET 下注状态
 * @property LOTTERY 开奖
 * @property SETTLEMENT 结算
 * @property READY 准备
 */
export enum RoomState {
    BET = 'fanTanBet',
    LOTTERY = 'fanTanLottery',
    SETTLEMENT = 'fanTanSettlement',
    READY = 'fanTanReady'
}

/**
 * 消息路由
 * @property PLAYERS_CHANGE 玩家列表发生变化
 * @property START_BET_STATE 开始下注状态
 * @property START_LOTTERY_STATE 开始开奖状态
 * @property START_SETTLEMENT_STATE 开始结算状态
 * @property START_READY_STATE 准备状态
 * @property PLAYER_BET 通知有玩家下注
 */
export enum MsgRoute {
    PLAYERS_CHANGE = 'playersChange',
    START_BET_STATE = 'startBetState',
    START_LOTTERY_STATE = 'startLotteryState',
    START_SETTLEMENT_STATE = 'startSettlementState',
    START_READY_STATE = 'startReadyState',
    PLAYER_BET = 'playerBet',
}
