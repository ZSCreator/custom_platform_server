'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtzRoomManager = void 0;
const pinus_1 = require("pinus");
const ttzRoom_1 = require("./ttzRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class TtzRoomManager extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.bairenTTZ,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/bairenTTZ').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['ChipList'] = sceneInfo.ChipList;
        room['allinMaxNum'] = sceneInfo.allinMaxNum;
        room['upZhuangCond'] = sceneInfo.upZhuangCond;
        room['sceneId'] = sceneInfo.id;
        room.sceneId = sceneId;
        room.roomId = roomId;
        let roomInfo = new ttzRoom_1.default(room);
        roomInfo.runRoom();
        return roomInfo;
    }
}
exports.TtzRoomManager = TtzRoomManager;
exports.default = new TtzRoomManager(GameNidEnum_1.GameNidEnum.bairenTTZ, GameTypeEnum_1.InteriorGameType.Br, 'bairenttz');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHR6Um9vbU1nci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2JhaXJlblRUWi9saWIvdHR6Um9vbU1nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7OztBQUNaLGlDQUEyQztBQUMzQyx1Q0FBZ0M7QUFFaEMsMkVBQXdFO0FBR3hFLDBGQUF1RjtBQUN2Riw2REFBMEU7QUFDMUUsNkVBQThFO0FBbUI5RSxNQUFhLGNBQWUsU0FBUSxxQ0FBMEI7SUFDMUQsWUFBWSxHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQUM5RCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBS0QsV0FBVyxDQUFDLElBQWE7UUFDckIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBd0IsRUFBRSxNQUFjO1FBQy9DLE1BQU0sSUFBSSxHQUFHO1lBQ1QsTUFBTTtZQUNOLE9BQU87WUFDUCxHQUFHLEVBQUUseUJBQVcsQ0FBQyxTQUFTO1lBQzFCLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFBO1FBQ0QsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLGtCQUFrQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDNUcsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7UUFHOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7UUFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7UUFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixPQUFPLFFBQVEsQ0FBQztJQUVwQixDQUFDO0NBRUo7QUF0Q0Qsd0NBc0NDO0FBQ0Qsa0JBQWUsSUFBSSxjQUFjLENBQUMseUJBQVcsQ0FBQyxTQUFTLEVBQUUsK0JBQWdCLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDIn0=