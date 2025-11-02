"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redPacketSceneImpl = void 0;
const ISceneInfo_1 = require("../../../pojo/baseClass/ISceneInfo");
class redPacketSceneImpl extends ISceneInfo_1.ISceneInfo {
    constructor(prop) {
        super(prop);
        const { redParketNum, maxMineNum, robotGrabRedPacketMin, robotGrabRedPacketMax } = prop;
        this.redParketNum = redParketNum;
        this.maxMineNum = maxMineNum;
        this.robotGrabRedPacketMin = robotGrabRedPacketMin;
        this.robotGrabRedPacketMax = robotGrabRedPacketMax;
    }
}
exports.redPacketSceneImpl = redPacketSceneImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkUGFja2V0U2NlbmVJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9jb25zdGFudC9nYW1lL3NjZW5lL3JlZFBhY2tldFNjZW5lSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtRUFBZ0U7QUFFaEUsTUFBYSxrQkFBbUIsU0FBUSx1QkFBVTtJQWlCOUMsWUFBWSxJQUFJO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRVosTUFBTSxFQUNGLFlBQVksRUFDWixVQUFVLEVBQ1YscUJBQXFCLEVBQ3JCLHFCQUFxQixFQUN4QixHQUFHLElBQUksQ0FBQztRQUVULElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUNuRCxJQUFJLENBQUMscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7SUFDdkQsQ0FBQztDQUVKO0FBakNELGdEQWlDQyJ9