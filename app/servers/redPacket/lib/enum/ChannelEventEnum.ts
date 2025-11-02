/**
 * 消息通道 事件名称
 * @property roomWaitForHandout             to 玩  家  房间等待发红包
 * @property roomReady                      to 玩  家  房间可开始抢红包
 * @property redPacket_handout              to 玩  家  有人发红包：返回新的 红包队列
 * @property redPacket_grab                 to 玩  家  有人抢包
 * @property redPacket_settle               to 玩  家  游戏倒计时结束
 * @property redPacket_settled              to 玩  家  游戏结算
 * @property redPacketQueueWithUpdate       to 玩  家  红包队列减少时发送变化通知
 * @property beInRedPacketQueue             to 玩  家  红包队列减少时，针对红包队列里的玩家发送通知
 * @property currentGraberQueue             to 机器人  当前对局待抢红包队列
 */
export enum ChannelEventEnum {
  roomWaitForHandout = 'redPacket_wait_for_handout',
  roomReady = 'redPacket_wait_for_grab',
  handout = 'redPacket_handout',
  grab = 'redPacket_grab',
  settle = 'redPacket_settle',
  settled = 'redPacket_settled',
  redPacketQueueWithUpdate = 'redPacket_redPacketQueueWithUpdate',
  redPacketPlayerListWithUpdate = 'redPacket_PlayerListWithUpdate',
  beInRedPacketQueue = 'redPacket_beInRedPacketQueue',
  currentGraberQueue = 'redPacket_currentGraberQueue',
  timeout = 'redPacket_playerTimeOut'
}
