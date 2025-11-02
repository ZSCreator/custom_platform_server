"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPlateRoomManager = void 0;
const room_1 = require("./room");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class ColorPlateRoomManager extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.colorPlate,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/colorPlate').datas.find(scene => scene.id === sceneId);
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
exports.ColorPlateRoomManager = ColorPlateRoomManager;
exports.default = new ColorPlateRoomManager(GameNidEnum_1.GameNidEnum.colorPlate, GameTypeEnum_1.InteriorGameType.Br, '色碟');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jb2xvclBsYXRlL2xpYi9yb29tTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBNEI7QUFDNUIsNkRBQXdFO0FBQ3hFLDJFQUFzRTtBQUN0RSxpQ0FBOEI7QUFDOUIsMEZBQXFGO0FBQ3JGLDZFQUE0RTtBQUs1RSxNQUFhLHFCQUFzQixTQUFRLHFDQUF1QjtJQUM5RCxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFNRCxXQUFXLENBQUMsSUFBVTtRQUNsQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQU9ELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFVBQVU7WUFDM0IsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUNsRyxNQUFNLEVBQUMsV0FBVyxFQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBVyxDQUFDLENBQUM7UUFDMUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRVosT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBckNELHNEQXFDQztBQUVELGtCQUFlLElBQUkscUJBQXFCLENBQUMseUJBQVcsQ0FBQyxVQUFVLEVBQUUsK0JBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDIn0=