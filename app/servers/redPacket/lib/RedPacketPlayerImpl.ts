import {PlayerInfo} from '../../../common/pojo/entity/PlayerInfo';
import { PlayerGameStatusEnum, PlayerStatusAcitonEnum } from "./enum/PlayerGameStatusEnum";
import { BlackListLevelEnum } from './enum/BlackListLevelEnum'
import {CommonControlState} from "../../../domain/CommonControl/config/commonConst";

/**
 * 红包扫雷 玩家
 * @property seat 座位号: -1.未参与游戏 ;0.发红包;
 * @property status 状态
 * @property vipScore vip 积分
 * @property gain 收益 (含发红包和抢红包收益)
 */
export default class RedPacketPlayerImpl extends PlayerInfo {

  seat: number = -1;

  status: PlayerGameStatusEnum = PlayerGameStatusEnum.READY;

  controlState: CommonControlState = null;

  gain: number = 0;
  correctedValue: number = 1;
  minCorrectedValue: number = 1.25;
  maxCorrectedValue: number = 0.75;
  blackListLevel: BlackListLevelEnum = BlackListLevelEnum.NONE;
  BlackListLevelValue: number[] = [1, 1.25, 1.5, 2];
  // totalRedPacketAmount: number = 0;

  // redPacketCount: number = 0;

  // 上局盈利
  profitAmount: number = 0;

  constructor(opt) {
    super(opt);
  }

  async initGame() {
    this.controlState = null;
  }

  /**
   * 修改玩家状态
   * @param {PlayerGameStatusEnum} _status
   */
  changePlayerStatus(_status: PlayerGameStatusEnum): void {
    this.status = _status;
  }

  /**
   * 返回玩家信息给客户端
   */
  sendPlayerInfoForFrontEnd() {
    return {
      uid: this.uid,
      gold: this.gold,
      gain: this.gain,
      nickname: this.nickname,
      headurl: this.headurl,
      status: this.status
    };
  }

  /**
   * 包装数据 => 玩家列表
   */
  sendInfoForPlayerList() {
    return {
      uid: this.uid,
      nickname: this.nickname,
      profitAmount: this.gain,
    };
  }

  /**
   * 获取个人修正值
   * @return {number}
   */
  getPersonalCorrectedValue(): number {
    return this.correctedValue;
  }

  /**
   * 获取黑名单监控等级修正值
   */
  getBlackListCorrectedValue(): number {
    return this.BlackListLevelValue[this.blackListLevel];
  }

}