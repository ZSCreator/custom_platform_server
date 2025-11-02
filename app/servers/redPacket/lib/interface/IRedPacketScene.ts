import { IBaseScene } from "../../../../common/interface/IBaseScene";
import Room from "../RedPacketRoomImpl";

export interface IRedPacketScene extends IBaseScene {
    /** @property redParketNum 每次游戏 拆分红包数 */
    redParketNum: number;

    /** @property maxMineNum 最大地雷数 */
    maxMineNum: number;

    /** @property robotGrabRedPacketMin 机器人允许抢包数下限 */
    robotGrabRedPacketMin: number;

    /** @property robotGrabRedPacketMax 机器人允许抢包数上限 */
    robotGrabRedPacketMax: number;

    /** @property rooms 房间信息列表 */
    roomList: Room[];
}