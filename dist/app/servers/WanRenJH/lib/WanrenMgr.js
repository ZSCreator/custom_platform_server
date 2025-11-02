'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.WJRoomManger = void 0;
const pinus_1 = require("pinus");
const wrjhRoom_1 = require("./wrjhRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class WJRoomManger extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.WanRenJH,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/WanRenJH').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['entryCond'] = sceneInfo.entryCond;
        room['ShangzhuangMinNum'] = sceneInfo.ShangzhuangMinNum;
        room['lowBet'] = sceneInfo.lowBet;
        room['tallBet'] = sceneInfo.tallBet;
        room['compensate'] = sceneInfo.compensate;
        room['ChipList'] = sceneInfo.ChipList;
        let roomInfo = new wrjhRoom_1.default(room);
        roomInfo.runRoom();
        return roomInfo;
    }
}
exports.WJRoomManger = WJRoomManger;
exports.default = new WJRoomManger(GameNidEnum_1.GameNidEnum.WanRenJH, GameTypeEnum_1.InteriorGameType.Br, 'WanRenJH');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FucmVuTWdyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvV2FuUmVuSkgvbGliL1dhbnJlbk1nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLGlDQUEyQztBQUMzQyx5Q0FBa0M7QUFFbEMsMkVBQXdFO0FBR3hFLDZEQUEwRTtBQUMxRSwwRkFBdUY7QUFDdkYsNkVBQTRFO0FBZTVFLE1BQWEsWUFBYSxTQUFRLHFDQUEyQjtJQUV6RCxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFLRCxXQUFXLENBQUMsSUFBYztRQUN0QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUdELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFFBQVE7WUFDekIsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFDRCxNQUFNLFNBQVMsR0FBYyxJQUFBLGFBQWdCLEVBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUMzRyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUU5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN4QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxTQUFTLENBQUMsaUJBQWlCLENBQUM7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7UUFDMUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDdEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0o7QUFwQ0Qsb0NBb0NDO0FBRUQsa0JBQWUsSUFBSSxZQUFZLENBQUMseUJBQVcsQ0FBQyxRQUFRLEVBQUUsK0JBQWdCLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDIn0=