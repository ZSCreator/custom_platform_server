'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedBlackRoomManger = void 0;
const pinus_1 = require("pinus");
const RedBlackRoom_1 = require("./RedBlackRoom");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const LoggerErr = (0, pinus_logger_1.getLogger)('server_out', __filename);
class RedBlackRoomManger extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.RedBlack,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/RedBlack').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['capBet'] = sceneInfo.capBet;
        room['lowBet'] = sceneInfo.lowBet;
        room['ChipList'] = sceneInfo.ChipList;
        room.sceneId = sceneInfo.id;
        const roomInfo = new RedBlackRoom_1.default(room);
        roomInfo.run();
        return roomInfo;
    }
}
exports.RedBlackRoomManger = RedBlackRoomManger;
exports.default = new RedBlackRoomManger(GameNidEnum_1.GameNidEnum.RedBlack, GameTypeEnum_1.InteriorGameType.Br, 'RedBlack');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkQmxhY2tNZ3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9SZWRCbGFjay9saWIvUmVkQmxhY2tNZ3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7QUFDWixpQ0FBMkM7QUFDM0MsaURBQTBDO0FBQzFDLCtDQUF5QztBQUV6QywyRUFBd0U7QUFLeEUsMEZBQXVGO0FBQ3ZGLDZEQUEwRTtBQUMxRSw2RUFBNEU7QUFFNUUsTUFBTSxTQUFTLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQWF0RCxNQUFhLGtCQUFtQixTQUFRLHFDQUErQjtJQUduRSxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFLRCxXQUFXLENBQUMsSUFBa0I7UUFDMUIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFJRCxVQUFVLENBQUMsT0FBd0IsRUFBRSxNQUFjO1FBQy9DLE1BQU0sSUFBSSxHQUFHO1lBQ1QsTUFBTTtZQUNOLE9BQU87WUFDUCxHQUFHLEVBQUUseUJBQVcsQ0FBQyxRQUFRO1lBQ3pCLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFBO1FBQ0QsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDM0csTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7UUFFOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQzVCLE1BQU0sUUFBUSxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDZixPQUFPLFFBQVEsQ0FBQztJQUVwQixDQUFDO0NBQ0o7QUFwQ0QsZ0RBb0NDO0FBRUQsa0JBQWUsSUFBSSxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLFFBQVEsRUFBRSwrQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUMifQ==