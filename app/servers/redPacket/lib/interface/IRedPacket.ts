import { RedPacketGameStatusEnum } from "../enum/RedPacketGameStatusEnum";

/**
 * 游戏里“埋雷红包”属性
 * @property owner_uid 埋雷者 uid
 * @property mineNumber 地雷编号: 0-9
 * @property amount 金额 单位：分 10 * 100 倍数
 * @property status 红包状态
 * @property nickname 玩家昵称
 */
export default class IRedPacket {

  owner_uid: string;

  mineNumber: number;

  amount: number;

  isRobot: boolean;

  status: RedPacketGameStatusEnum = RedPacketGameStatusEnum.WAIT;

  nickname: string;

}