import { RedPacketRobotImpl } from "../../RedPacketRobotImpl";
import {getLogger} from "pinus";

const logger = getLogger("server_out", __filename);

/**
 * 机器人通信代理
 */
export class RobotAgentMessage {

  robot: RedPacketRobotImpl;

  constructor(robot: RedPacketRobotImpl) {
    this.robot = robot;
  }

  /**
   * 进入房间后调用，初始化游戏信息
   */
  async loaded() {
    try {
      await this.robot.requestByRoute('redPacket.redPacketHandler.loaded', {});
    } catch (error) {

    }
  }

  /**
   * 发红包
   * @param amount     金额:分
   * @param mineNumber 雷号:0-9
   */
  async handOutRedPacket(amount: number, mineNumber: number) {

    try {
      let result = await this.robot.requestByRoute("redPacket.redPacketHandler.handOutRedPacket", { amount, mineNumber });
    } catch (error) {

    }
  }

  /**
   * 抢红包
   */
  async grabRedPacket() {
    try {
      this.robot.grabbedCount += 1;
      const result = await this.robot.requestByRoute("redPacket.redPacketHandler.grabRedPacket", {});
    } catch (error) {
      switch (typeof error) {
        case 'string':
          logger.error(`机器人抢红包出错|返回出错信息为:${error}`);
          break;
        case 'object':
          if (error.code === 81001) {
            // this.robot.logger.debug(`机器人${this.robot.uid}"抢红包"异常分支|机器人不可再抢`);
          } else {
            // this.robot.logger.debug(`机器人${this.robot.uid}"抢红包"异常分支|返回信息:${error.msg}`);
            // this.robot.logger.debug(`机器人${this.robot.uid}|离开房间|补充新的机器人进来`);
            await this.robot.leave();
          }
          break;
        default:
          logger.error(`机器人抢红包出错`);
          break;
      }
    }
  }

  /**
   * 取消发红包
   */
  async cancelHandOutRedPacket() {
    try {
      await this.robot.requestByRoute("redPacket.redPacketHandler.cancelHandOutRedPacket", {});
    } catch (error) {

    }
  }

  /**
   * 离开房间
   */
  async leaveRoom() {
    const disConnect = await this.robot.leaveGameAndReset();
  }
}
