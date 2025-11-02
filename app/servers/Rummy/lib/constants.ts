/**
 * 房间状态
 * @property NONE 无状态
 * @property READY 准备阶段
 * @property PLAY_CARD 发牌阶段
 * @property SEND_AWARD 结算阶段
 */
export enum RoomState {
    NONE = 'INWAIT',
    READY = 'Rummy_READY',
    PLAY_CARD = 'PLAY_CARD',
    SEND_AWARD = 'SEND_AWARD',
}

/**
 * 消息路由
 * @property RUMMY_START_FAPAI 监听发牌
 * @property RUMMY_PLAY 该谁发话
 * @property RUMMY_LOST_CARD 丢牌
 * @property RUMMY_GET_CARD 要牌
 * @property RUMMY_SHAW 胡牌
 * @property RUMMY_SEND_AWARD 派奖
 */
export enum MsgRoute {
    RUMMY_START_FAPAI = 'Rummy_Start_FAPAI',
    RUMMY_PLAY = 'Rummy_Play',
    RUMMY_LOST_CARD = 'Rummy_LOST_CARD',
    RUMMY_GET_CARD = 'Rummy_GET_CARD',
    RUMMY_SHAW = 'Rummy_SHAW',
    RUMMY_SEND_AWARD = 'Rummy_SEND_AWARD',
    RUMMY_REALPLAYER_READY = 'Rummy_RealPlayer_Ready',
    RUMMY_READY = 'Rummy_READY',
    RUMMY_CHANGE_CARDS = 'Rummy_CHANGE_CARDS',
    RUMMY_ONEXIT = 'Rummy_onExit',
}
