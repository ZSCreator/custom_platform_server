/**
 * 房间状态
 * @property BET 下注状态
 * @property LOTTERY 开奖
 * @property SETTLEMENT 结算
 */
export enum RoomState {
    BET = 'crashBet',
    LOTTERY = 'crashLottery',
    SETTLEMENT = 'crashSettlement'
}

// 每秒增长速度
export const SPEED_UP = 1.063;
// 最大赔率
export const MAX_ODDS = 450;
// 最小赔率
export const MIN_ODDS = 0;


/**
 * 消息路由
 * @property START_BET_STATE 开始下注状态
 * @property START_LOTTERY_STATE 开始开奖状态
 * @property START_SETTLEMENT_STATE 开始结算状态
 * @property TOOK_PROFIT 拿走了利润
 */
export enum MsgRoute {
    START_BET_STATE = 'startBetState',
    START_LOTTERY_STATE = 'startLotteryState',
    START_SETTLEMENT_STATE = 'startSettlementState',
    TOOK_PROFIT = 'tookProfit',
}
