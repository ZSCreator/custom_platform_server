// import Room from "./Room";
import Room from "../RedPacketRoomImpl";

/**
 * @property id 场 序号(唯一)
 * @property nid 游戏编号
 * @property name 游戏名称
 * @property entryCond 准入金额
 * @property lowBet 参与游戏最小金额
 * @property capBet 参与游戏最大金额
 * @property redParketNum 每次游戏 拆分红包数
 * @property lossRation 赔付倍率  
 * @property maxMineNum 最大地雷数
 * @property room_count 场最大房间数
 * @property robotGrabRedPacketMin 机器人允许抢包数下限
 * @property robotGrabRedPacketMax 机器人允许抢包数上限
 * @property rooms 房间信息列表
 * @property realPlayerMineNum 真人玩家发包雷的数量
 */
export default interface Scene {
  id: number;
  nid: string;
  name: string;
  entryCond: number;
  lowBet: number;
  capBet: number;
  allinMaxNum: number;
  room_count: number;
  redParketNum: number;
  lossRation: number;
  maxMineNum: number;
  robotGrabRedPacketMin: number,
  robotGrabRedPacketMax: number
  roomList?: Room[];
  realPlayerMineNum: number;
}