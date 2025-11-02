import { GameNidEnum } from "../../../../common/constant/game/GameNidEnum";

/**
 * 红包扫雷 房间 接口
 * @property nid 游戏编号
 * @property roomId 房间编号 (全局唯一)
 * @property sceneId 场 编码
 * @property entryCond 准入金额
 */
export default interface Room {
  nid: GameNidEnum;
  roomId: string;
  sceneId: number;
  // roundTimes: number;
  // status: number;
  // noneAction: any;
  // waitAction: any;
  // readyAction: any;
  // gameAction: any;
  // endAction: any;
  // redPackQueue: object[];
  // GrabTheRedPacketQueue: string[];
  // addPlayer?: (player) => Promise<boolean>;
  // changeGameStatues: (status) => void;
  // getCurretGameActionByStatues: () => any;
}