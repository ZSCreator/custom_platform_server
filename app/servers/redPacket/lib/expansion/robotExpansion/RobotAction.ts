import { RedPacketRobotImpl } from "../../RedPacketRobotImpl";
import { randomFromRange } from "../../../../../utils/lottery/commonUtil";
import {getLogger} from "pinus";

const logger = getLogger("server_out", __filename);

export class RobotAction {

  robot: RedPacketRobotImpl;

  constructor(robot: RedPacketRobotImpl) {
    this.robot = robot;
  }

  /**
   * 机器人发红包
   * @description 10元的倍数
   */
  handoutRedPacket() {

    let amount = 0;
    try {
      const { playerGold } = this.robot;
      const min = this.robot.lowBet / 1000;
      let max = this.robot.capBet / 1000;
      
      // 判断当前携带金额是否低于随机上限
      if (playerGold < this.robot.capBet) max = Math.floor(playerGold / 1000);

      amount = randomFromRange(min, 5) * 1000;

      if (this.robot.playerGold < this.robot.capBet) {
        this.robot.leave();
        return;
      }

      this.robot.agentMessage.handOutRedPacket(amount, randomFromRange(0, 9));
    } catch (e) {
      logger.error(`机器人:${this.robot.uid}|发红包出错|当前金额:${this.robot.playerGold}|红包金额:${amount}|错误详情:${e}`);
    }

  }

  /**
   * 机器人抢红包
   */
  grabTheRedPacket() {
    const currentProbability = randomFromRange(0, 100);

    if (currentProbability > 20) {

      this.robot.hadGrabFlag = true;

      this.robot.grabTimeOut = setTimeout(() => {
        this.robot.agentMessage.grabRedPacket();
      }, randomFromRange(0, 4000));
    }
  }
}
