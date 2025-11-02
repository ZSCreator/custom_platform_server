"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FanTanRoomManager = void 0;
const room_1 = require("./room");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class FanTanRoomManager extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.fanTan,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/fanTan').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['ChipList'] = sceneInfo.ChipList;
        const _room = new room_1.Room(room, this);
        _room.init();
        _room.run();
        return _room;
    }
}
exports.FanTanRoomManager = FanTanRoomManager;
exports.default = new FanTanRoomManager(GameNidEnum_1.GameNidEnum.fanTan, GameTypeEnum_1.InteriorGameType.Br, '番摊');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9mYW5UYW4vbGliL3Jvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE0QjtBQUM1Qiw2REFBd0U7QUFDeEUsMkVBQXNFO0FBQ3RFLGlDQUE0QjtBQUM1QiwwRkFBcUY7QUFDckYsNkVBQTRFO0FBSzVFLE1BQWEsaUJBQWtCLFNBQVEscUNBQXVCO0lBQzFELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQU1ELFdBQVcsQ0FBQyxJQUFVO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBT0QsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLHlCQUFXLENBQUMsTUFBTTtZQUN2QixRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUVELE1BQU0sU0FBUyxHQUFHLElBQUEsYUFBZ0IsRUFBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUM5RixNQUFNLEVBQUMsV0FBVyxFQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRVosT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBckNELDhDQXFDQztBQUVELGtCQUFlLElBQUksaUJBQWlCLENBQUMseUJBQVcsQ0FBQyxNQUFNLEVBQUUsK0JBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDIn0=