"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuYuRoomManagerImpl = void 0;
const pinus_1 = require("pinus");
const Room_1 = require("./Room");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class BuYuRoomManagerImpl extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.buyu,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/buyu').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['roomId'] = roomId;
        room['name'] = sceneInfo.name;
        room['entryCond'] = sceneInfo.entryCond;
        room['bullet_value'] = sceneInfo.bullet_value;
        room['base_rate'] = sceneInfo.base_rate;
        let roomInfo = new Room_1.default(room);
        roomInfo.StartGame();
        return roomInfo;
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }
        return result;
    }
}
exports.BuYuRoomManagerImpl = BuYuRoomManagerImpl;
exports.default = new BuYuRoomManagerImpl(GameNidEnum_1.GameNidEnum.buyu, GameTypeEnum_1.InteriorGameType.Battle, 'buyu');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVZdVJvb21NYW5hZ2VySW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2J1eXUvbGliL0J1WXVSb29tTWFuYWdlckltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQThCO0FBQzlCLGlDQUEwQjtBQUMxQiwyRUFBd0U7QUFDeEUsNkRBQTBFO0FBQzFFLDBGQUF1RjtBQUN2Riw2RUFBOEU7QUFnQjlFLE1BQWEsbUJBQW9CLFNBQVEscUNBQXVCO0lBQzVELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUtELFdBQVcsQ0FBQyxJQUFVO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBR0QsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLHlCQUFXLENBQUMsSUFBSTtZQUNyQixRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUNELE1BQU0sU0FBUyxHQUFjLElBQUEsYUFBZ0IsRUFBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUN2RyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUc5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO1FBQzlDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1FBQ3hDLElBQUksUUFBUSxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNyQixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBT0QsS0FBSyxDQUFDLElBQVUsRUFBRSxNQUFNO1FBQ3BCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBR3pDLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxDQUFDLEVBQUU7WUFDdEUsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUFuREQsa0RBbURDO0FBQ0Qsa0JBQWUsSUFBSSxtQkFBbUIsQ0FBQyx5QkFBVyxDQUFDLElBQUksRUFBRSwrQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMifQ==