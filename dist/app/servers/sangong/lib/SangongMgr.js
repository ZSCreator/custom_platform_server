"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sgRoomManger = void 0;
const pinus_1 = require("pinus");
const sgRoom_1 = require("./sgRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class sgRoomManger extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.sangong,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/sangong').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room["sceneId"] = sceneInfo.id;
        room['lowBet'] = sceneInfo.lowBet;
        room['entryCond'] = sceneInfo.entryCond;
        return new sgRoom_1.default(room);
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT")) {
            return false;
        }
        let num = room.players.filter(pl => pl && pl.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER);
        if (result && num.length >= 3 && player.isRobot == 0) {
            return false;
        }
        return result;
    }
}
exports.sgRoomManger = sgRoomManger;
exports.default = new sgRoomManger(GameNidEnum_1.GameNidEnum.sangong, GameTypeEnum_1.InteriorGameType.Battle, 'sangong');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FuZ29uZ01nci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3NhbmdvbmcvbGliL1NhbmdvbmdNZ3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQThCO0FBQzlCLHFDQUE4QjtBQUU5QiwyRUFBd0U7QUFDeEUsMEZBQXVGO0FBQ3ZGLDZEQUEwRTtBQUMxRSw2RUFBOEU7QUFDOUUsdUVBQW9FO0FBZXBFLE1BQWEsWUFBYSxTQUFRLHFDQUF5QjtJQUN2RCxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFLRCxXQUFXLENBQUMsSUFBWTtRQUNwQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUdELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE9BQU87WUFDeEIsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFDRCxNQUFNLFNBQVMsR0FBYyxJQUFBLGFBQWdCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUMxRyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN4QyxPQUFPLElBQUksZ0JBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBT0QsS0FBSyxDQUFDLElBQVksRUFBRSxNQUFNO1FBQ3RCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBR3pDLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sSUFBSSxtQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlFLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFO1lBQ2xELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKO0FBL0NELG9DQStDQztBQUNELGtCQUFlLElBQUksWUFBWSxDQUFDLHlCQUFXLENBQUMsT0FBTyxFQUFFLCtCQUFnQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyJ9