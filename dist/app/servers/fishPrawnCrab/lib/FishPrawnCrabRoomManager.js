"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FishPrawnCrabRoomManager = void 0;
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const FishPrawnCrabRoomImpl_1 = require("./FishPrawnCrabRoomImpl");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class FishPrawnCrabRoomManager extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.fishPrawnCrab,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/fishPrawnCrab').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['sceneId'] = sceneInfo.id;
        room['maxCount'] = 100;
        room['ChipList'] = sceneInfo.ChipList;
        const _room = new FishPrawnCrabRoomImpl_1.FishPrawnCrabRoomImpl(room, this);
        _room.run();
        return _room;
    }
}
exports.FishPrawnCrabRoomManager = FishPrawnCrabRoomManager;
exports.default = new FishPrawnCrabRoomManager(GameNidEnum_1.GameNidEnum.fishPrawnCrab, GameTypeEnum_1.InteriorGameType.Br, '鱼虾蟹');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlzaFByYXduQ3JhYlJvb21NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmlzaFByYXduQ3JhYi9saWIvRmlzaFByYXduQ3JhYlJvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUF3RTtBQUN4RSwyRUFBc0U7QUFDdEUsaUNBQThCO0FBQzlCLDBGQUFxRjtBQUNyRixtRUFBOEQ7QUFDOUQsNkVBQTRFO0FBSTVFLE1BQWEsd0JBQTBCLFNBQVEscUNBQXdDO0lBQ25GLFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQU1ELFdBQVcsQ0FBQyxJQUEyQjtRQUNuQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQU9ELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLGFBQWE7WUFDOUIsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsc0JBQXNCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUNyRyxNQUFNLEVBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUksNkNBQXFCLENBQUMsSUFBSSxFQUFFLElBQVcsQ0FBQyxDQUFDO1FBQzNELEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNaLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQXJDRCw0REFxQ0M7QUFFRCxrQkFBZSxJQUFJLHdCQUF3QixDQUFDLHlCQUFXLENBQUMsYUFBYSxFQUFFLCtCQUFnQixDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyJ9