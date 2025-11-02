"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DzRoomManger = void 0;
const pinus_1 = require("pinus");
const dzRoom_1 = require("./dzRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class DzRoomManger extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.dzpipei,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/DZpipei').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['canCarryGold'] = sceneInfo.canCarryGold;
        room['blindBet'] = sceneInfo.blindBet;
        room['sceneId'] = sceneInfo.id;
        room["ante"] = sceneInfo.ante;
        return new dzRoom_1.default(room);
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }
        return result;
    }
}
exports.DzRoomManger = DzRoomManger;
exports.default = new DzRoomManger(GameNidEnum_1.GameNidEnum.dzpipei, GameTypeEnum_1.InteriorGameType.Battle, 'dzpipei');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHpSb29tTWdyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRFpwaXBlaS9saWIvZHpSb29tTWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE4QjtBQUM5QixxQ0FBOEI7QUFDOUIsMkVBQXdFO0FBQ3hFLDZEQUEwRTtBQUMxRSwwRkFBdUY7QUFDdkYsNkVBQThFO0FBYzlFLE1BQWEsWUFBYSxTQUFRLHFDQUF5QjtJQUN2RCxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFLRCxXQUFXLENBQUMsSUFBWTtRQUNwQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUdELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE9BQU87WUFDeEIsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFDRCxNQUFNLFNBQVMsR0FBYyxJQUFBLGFBQWdCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUMxRyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztRQUM5QyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztRQUM5QixPQUFPLElBQUksZ0JBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBT0QsS0FBSyxDQUFDLElBQVksRUFBRSxNQUFNO1FBQ3RCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBR3pDLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxDQUFDLEVBQUU7WUFDdEUsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFLRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUFoREQsb0NBZ0RDO0FBQ0Qsa0JBQWUsSUFBSSxZQUFZLENBQUMseUJBQVcsQ0FBQyxPQUFPLEVBQUUsK0JBQWdCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDIn0=