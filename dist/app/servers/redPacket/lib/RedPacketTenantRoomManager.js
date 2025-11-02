"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedPacketTenantRoomManager = void 0;
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const RedPacketRoomImpl_1 = require("./RedPacketRoomImpl");
class RedPacketTenantRoomManager extends tenantRoomManager_1.TenantRoomManager {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    createRoom(sceneId, roomId) {
        const sceneInfo = (0, JsonMgr_1.get)('scenes/redPacket')
            .datas
            .find(scene => scene.id === sceneId);
        const { id, entryCond, lowBet, roomUserLimit, tallBet, redParketNum } = sceneInfo;
        const room = {
            roomId,
            sceneId: id,
            nid: GameNidEnum_1.GameNidEnum.redPacket,
            redParketNum,
            entryCond
        };
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['lowBet'] = lowBet;
        room['roomUserLimit'] = roomUserLimit;
        room['areaMaxBet'] = tallBet;
        const roomInstance = new RedPacketRoomImpl_1.default(room, this);
        roomInstance.init();
        roomInstance.run();
        return roomInstance;
    }
    stopTheRoom(room) {
        room.close();
    }
}
exports.RedPacketTenantRoomManager = RedPacketTenantRoomManager;
exports.default = new RedPacketTenantRoomManager(GameNidEnum_1.GameNidEnum.redPacket, GameTypeEnum_1.InteriorGameType.Br, "红包扫雷");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkUGFja2V0VGVuYW50Um9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yZWRQYWNrZXQvbGliL1JlZFBhY2tldFRlbmFudFJvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBGQUF1RjtBQUN2Riw2REFBMEU7QUFDMUUsMkVBQXdFO0FBQ3hFLDZFQUE4RTtBQUM5RSwyREFBb0Q7QUFFcEQsTUFBYSwwQkFBMkIsU0FBUSxxQ0FBb0M7SUFFaEYsWUFBWSxHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQUM5RCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBZTtRQUdoRCxNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsa0JBQWtCLENBQUM7YUFDakQsS0FBSzthQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFFekMsTUFBTSxFQUNGLEVBQUUsRUFDRixTQUFTLEVBQ1QsTUFBTSxFQUNOLGFBQWEsRUFDYixPQUFPLEVBQ1AsWUFBWSxFQUNmLEdBQUcsU0FBUyxDQUFDO1FBRWQsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTyxFQUFFLEVBQUU7WUFDWCxHQUFHLEVBQUUseUJBQVcsQ0FBQyxTQUFTO1lBQzFCLFlBQVk7WUFDWixTQUFTO1NBQ1osQ0FBQztRQUVGLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDeEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLGFBQWEsQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBRTdCLE1BQU0sWUFBWSxHQUFHLElBQUksMkJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZELFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQixZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFbkIsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUNELFdBQVcsQ0FBQyxJQUF1QjtRQUMvQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztDQUVKO0FBL0NELGdFQStDQztBQUVELGtCQUFlLElBQUksMEJBQTBCLENBQUMseUJBQVcsQ0FBQyxTQUFTLEVBQUUsK0JBQWdCLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDIn0=