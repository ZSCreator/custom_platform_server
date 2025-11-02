"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mjRoomManger = void 0;
const pinus_1 = require("pinus");
const mjRoom_1 = require("./mjRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class mjRoomManger extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.mj,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/MJ').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['sceneId'] = sceneInfo.id;
        return new mjRoom_1.default(room);
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }
        return result;
    }
}
exports.mjRoomManger = mjRoomManger;
exports.default = new mjRoomManger(GameNidEnum_1.GameNidEnum.mj, GameTypeEnum_1.InteriorGameType.Battle, 'mj');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWpHYW1lTWFuZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTUovbGliL21qR2FtZU1hbmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBOEI7QUFDOUIscUNBQThCO0FBQzlCLDJFQUF3RTtBQUN4RSw2REFBMEU7QUFDMUUsMEZBQXVGO0FBQ3ZGLDZFQUE4RTtBQVk5RSxNQUFhLFlBQWEsU0FBUSxxQ0FBeUI7SUFDdkQsWUFBWSxHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQUM5RCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBS0QsV0FBVyxDQUFDLElBQVk7UUFDcEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBd0IsRUFBRSxNQUFjO1FBQy9DLE1BQU0sSUFBSSxHQUFHO1lBQ1QsTUFBTTtZQUNOLE9BQU87WUFDUCxHQUFHLEVBQUUseUJBQVcsQ0FBQyxFQUFFO1lBQ25CLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFBO1FBQ0QsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ3JHLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO1FBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQy9CLE9BQU8sSUFBSSxnQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFPRCxLQUFLLENBQUMsSUFBWSxFQUFFLE1BQU07UUFDdEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFHekMsSUFBSSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLENBQUMsRUFBRTtZQUN0RSxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQTNDRCxvQ0EyQ0M7QUFDRCxrQkFBZSxJQUFJLFlBQVksQ0FBQyx5QkFBVyxDQUFDLEVBQUUsRUFBRSwrQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==