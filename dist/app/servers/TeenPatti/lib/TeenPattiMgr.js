"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TpRoomManger = void 0;
const pinus_1 = require("pinus");
const tpRoom_1 = require("./tpRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class TpRoomManger extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.TeenPatti,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/TeenPatti').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['multipleLimit'] = sceneInfo.multipleLimit;
        room['sceneId'] = sceneInfo.id;
        return new tpRoom_1.default(room);
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }
        let num = room.players.filter(pl => pl && pl.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER);
        if (result && num.length >= 3 && player.isRobot == 0) {
            return false;
        }
        return result;
    }
}
exports.TpRoomManger = TpRoomManger;
exports.default = new TpRoomManger(GameNidEnum_1.GameNidEnum.TeenPatti, GameTypeEnum_1.InteriorGameType.Battle, 'TeenPatti');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVlblBhdHRpTWdyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvVGVlblBhdHRpL2xpYi9UZWVuUGF0dGlNZ3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQThCO0FBQzlCLHFDQUE4QjtBQUM5QiwyRUFBd0U7QUFDeEUsNkRBQTBFO0FBQzFFLDBGQUF1RjtBQUN2Riw2RUFBOEU7QUFDOUUsdUVBQW9FO0FBYXBFLE1BQWEsWUFBYSxTQUFRLHFDQUF5QjtJQUN2RCxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFLRCxXQUFXLENBQUMsSUFBWTtRQUNwQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUdELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFNBQVM7WUFDMUIsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFDRCxNQUFNLFNBQVMsR0FBYyxJQUFBLGFBQWdCLEVBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUM1RyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUU5QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQztRQUNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixPQUFPLElBQUksZ0JBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBT0QsS0FBSyxDQUFDLElBQVksRUFBRSxNQUFNO1FBQ3RCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBR3pDLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxDQUFDLEVBQUU7WUFDdEUsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxJQUFJLG1CQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUUsSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUU7WUFDbEQsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUFqREQsb0NBaURDO0FBQ0Qsa0JBQWUsSUFBSSxZQUFZLENBQUMseUJBQVcsQ0FBQyxTQUFTLEVBQUUsK0JBQWdCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDIn0=