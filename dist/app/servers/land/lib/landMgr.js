"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanRoomManger = void 0;
const pinus_1 = require("pinus");
const landRoom_1 = require("./landRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class LanRoomManger extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.land,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/land').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;
        room['allinMaxNum'] = sceneInfo.allinMaxNum;
        room['sceneId'] = sceneInfo.id;
        return new landRoom_1.default(room);
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }
        return result;
    }
}
exports.LanRoomManger = LanRoomManger;
exports.default = new LanRoomManger(GameNidEnum_1.GameNidEnum.land, GameTypeEnum_1.InteriorGameType.Battle, 'land');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZE1nci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2xhbmQvbGliL2xhbmRNZ3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsaUNBQThCO0FBQzlCLHlDQUFrQztBQUNsQywyRUFBd0U7QUFDeEUsNkRBQTBFO0FBQzFFLDBGQUF1RjtBQUN2Riw2RUFBOEU7QUFZOUUsTUFBYSxhQUFjLFNBQVEscUNBQTJCO0lBQzFELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUtELFdBQVcsQ0FBQyxJQUFjO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLHlCQUFXLENBQUMsSUFBSTtZQUNyQixRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUNELE1BQU0sU0FBUyxHQUFjLElBQUEsYUFBZ0IsRUFBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUN2RyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztRQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixPQUFPLElBQUksa0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBT0QsS0FBSyxDQUFDLElBQWMsRUFBRSxNQUFNO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBR3pDLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxDQUFDLEVBQUU7WUFDdEUsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUE3Q0Qsc0NBNkNDO0FBQ0Qsa0JBQWUsSUFBSSxhQUFhLENBQUMseUJBQVcsQ0FBQyxJQUFJLEVBQUUsK0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDIn0=