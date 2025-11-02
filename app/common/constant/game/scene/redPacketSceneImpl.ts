import { ISceneInfo } from "../../../pojo/baseClass/ISceneInfo";

export class redPacketSceneImpl extends ISceneInfo {

    /** @property {number} magnification 倍率 */
    magnification: number;
    
    /** @property {number} redParketNum 红包数 */
    redParketNum: number;

    /** @property {number} maxMineNum 最大地雷数 */
    maxMineNum: number;

    /** @property {number} robotGrabRedPacketMin 机器人可抢最少红包 */
    robotGrabRedPacketMin: number;

    /** @property {number} robotGrabRedPacketMax 机器人可抢最多红包 */
    robotGrabRedPacketMax: number;

    constructor(prop) {
        super(prop);

        const {
            redParketNum,
            maxMineNum,
            robotGrabRedPacketMin,
            robotGrabRedPacketMax
        } = prop;

        this.redParketNum = redParketNum;
        this.maxMineNum = maxMineNum;
        this.robotGrabRedPacketMin = robotGrabRedPacketMin;
        this.robotGrabRedPacketMax = robotGrabRedPacketMax;
    }

}
