import { RedPacketRobotImpl } from "../../RedPacketRobotImpl";
import {getLogger} from "pinus";

const logger = getLogger("server_out", __filename);

/**
 * 机器人常规异常统一处理
 */
export class RobotException {

  robot: RedPacketRobotImpl;

  prefixLog: string;

  constructor(robot: RedPacketRobotImpl) {
    this.robot = robot;
    const { nid, uid, guestid } = this.robot;
    this.prefixLog = `游戏:${nid}|机器人:${guestid}|`;
  }

  debug(msg: string) {
    logger.debug(`${this.prefixLog}${msg}`);
  }

  channelWarn(msg: string) {
    logger.warn(`${this.prefixLog}${msg}`);
  }
}