"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RummyRoomManager = void 0;
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const RummyRoomImpl_1 = require("./RummyRoomImpl");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class RummyRoomManager extends tenantRoomManager_1.TenantRoomManager {
    constructor(nid, type, name) {
        super(nid, type, name);
        this.needAdd = true;
    }
    stopTheRoom(room) {
        room.close();
    }
    createRoom(sceneId, roomId) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum_1.GameNidEnum.Rummy,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/Rummy').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['sceneId'] = sceneInfo.id;
        const _room = new RummyRoomImpl_1.RummyRoomImpl(room, this);
        return _room;
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT")) {
            return false;
        }
        let num = room.players.filter(pl => pl && pl.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER);
        if (result && num.length >= 1 && player.isRobot == 0) {
            return false;
        }
        return result;
    }
}
exports.RummyRoomManager = RummyRoomManager;
exports.default = new RummyRoomManager(GameNidEnum_1.GameNidEnum.Rummy, GameTypeEnum_1.InteriorGameType.Battle, '拉米');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVtbXlSb29tTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1J1bW15L2xpYi9SdW1teVJvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUEwRTtBQUMxRSwyRUFBd0U7QUFDeEUsaUNBQThCO0FBQzlCLDBGQUF1RjtBQUN2RixtREFBZ0Q7QUFDaEQsNkVBQThFO0FBQzlFLHVFQUFvRTtBQUlwRSxNQUFhLGdCQUFpQixTQUFRLHFDQUFnQztJQUVsRSxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRjNCLFlBQU8sR0FBWSxJQUFJLENBQUM7SUFHeEIsQ0FBQztJQU1ELFdBQVcsQ0FBQyxJQUFtQjtRQUMzQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQU9ELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLEtBQUs7WUFDdEIsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDN0YsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7UUFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDL0IsTUFBTSxLQUFLLEdBQUcsSUFBSSw2QkFBYSxDQUFDLElBQUksRUFBRSxJQUFXLENBQUMsQ0FBQztRQUNuRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBTUQsS0FBSyxDQUFDLElBQW1CLEVBQUUsTUFBTTtRQUM3QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUd6QyxJQUFJLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLENBQUMsRUFBRTtZQUN6QyxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLElBQUksbUJBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5RSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRTtZQUNsRCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQXRERCw0Q0FzREM7QUFFRCxrQkFBZSxJQUFJLGdCQUFnQixDQUFDLHlCQUFXLENBQUMsS0FBSyxFQUFFLCtCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyJ9