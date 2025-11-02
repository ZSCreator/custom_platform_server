"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaijiaRoomManager = void 0;
const pinus_1 = require("pinus");
const BaiJiaRoomImpl_1 = require("./BaiJiaRoomImpl");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const baijiaConst = require("./baijiaConst");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const baijiaErrorLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class BaijiaRoomManager extends tenantRoomManager_1.TenantRoomManager {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    stopTheRoom(room) {
        room.close();
    }
    createRoom(sceneId, roomId) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum_1.GameNidEnum.baijia,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/baijia').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['sceneId'] = sceneInfo.id;
        room['tallBet'] = sceneInfo.tallBet;
        room['lowBet'] = sceneInfo.lowBet;
        room['ShangzhuangMinNum'] = sceneInfo.ShangzhuangMinNum;
        room['twainUpperLimit'] = sceneInfo.tallBet * baijiaConst.BET_XIANZHI2;
        room['betUpperLimit'] = sceneInfo.tallBet * baijiaConst.BET_XIANZHI;
        room['ChipList'] = sceneInfo.ChipList;
        let roomInfo = new BaiJiaRoomImpl_1.default(room);
        roomInfo.run();
        return roomInfo;
    }
}
exports.BaijiaRoomManager = BaijiaRoomManager;
exports.default = new BaijiaRoomManager(GameNidEnum_1.GameNidEnum.baijia, GameTypeEnum_1.InteriorGameType.Br, 'baijia');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFpamlhUm9vbU1hbmFnZXJJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYmFpamlhL2xpYi9CYWlqaWFSb29tTWFuYWdlckltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQTJDO0FBQzNDLHFEQUE4QztBQUU5QywrQ0FBeUM7QUFDekMsMkVBQXdFO0FBQ3hFLDZDQUE4QztBQUU5QywwRkFBdUY7QUFDdkYsNkRBQTBFO0FBQzFFLDZFQUE4RTtBQUM5RSxNQUFNLGlCQUFpQixHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFtQjlELE1BQWEsaUJBQWtCLFNBQVEscUNBQWlDO0lBRXBFLFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUtELFdBQVcsQ0FBQyxJQUFvQjtRQUM1QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUlELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE1BQU07WUFDdkIsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFDRCxNQUFNLFNBQVMsR0FBYyxJQUFBLGFBQWdCLEVBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDekcsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7UUFFOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDO1FBRXhELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQztRQUV2RSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsU0FBUyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ3RDLElBQUksUUFBUSxHQUFHLElBQUksd0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDZixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0o7QUF4Q0QsOENBd0NDO0FBQ0Qsa0JBQWUsSUFBSSxpQkFBaUIsQ0FBQyx5QkFBVyxDQUFDLE1BQU0sRUFBRSwrQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMifQ==