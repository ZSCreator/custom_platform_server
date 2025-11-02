import { RedPacketGameStatusEnum } from "../enum/RedPacketGameStatusEnum";

/**
 * @property mineNumber 雷号 0-9
 */
export interface ICurrentRedPacketInfo {
  /** 玩家基础信息 */
  uid: string;
  sex: number;
  gold: number;
  gain: number;
  nickname: string;
  headurl: string;
  status: number;
  /** 红包属性 */
  owner_uid: string;
  mineNumber: number;
  amount: number;
  isRobot: boolean;
}