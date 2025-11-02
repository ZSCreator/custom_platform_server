"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRoomManger = void 0;
const pinus_1 = require("pinus");
const jhRoom_1 = require("./jhRoom");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class GRoomManger extends tenantRoomManager_1.TenantRoomManager {
    constructor(nid, type, name) {
        super(nid, type, name);
        this.needAdd = true;
        this.realPlayerFirst = false;
    }
    stopTheRoom(room) {
        room.close();
    }
    createRoom(sceneId, roomId) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum_1.GameNidEnum.GoldenFlower,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/GoldenFlower').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;
        room['sceneId'] = sceneInfo.id;
        return new jhRoom_1.default(room);
    }
    check(room, player) {
        const result = super.check(room, player);
        if (result && (room["status"] !== "INWAIT")) {
            return false;
        }
        return result;
    }
}
exports.GRoomManger = GRoomManger;
exports.default = new GRoomManger(GameNidEnum_1.GameNidEnum.GoldenFlower, GameTypeEnum_1.InteriorGameType.Battle, 'GoldenFlower');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29sZGVuRmxvd2VyTWdyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvR29sZGVuRmxvd2VyL2xpYi9Hb2xkZW5GbG93ZXJNZ3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQThCO0FBQzlCLHFDQUE4QjtBQUM5QiwyRUFBd0U7QUFDeEUsNkRBQTBFO0FBQzFFLDBGQUF1RjtBQUN2Riw2RUFBOEU7QUFlOUUsTUFBYSxXQUFZLFNBQVEscUNBQXlCO0lBSXRELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFKM0IsWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixvQkFBZSxHQUFZLEtBQUssQ0FBQztJQUlqQyxDQUFDO0lBS0QsV0FBVyxDQUFDLElBQVk7UUFDcEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBd0IsRUFBRSxNQUFjO1FBQy9DLE1BQU0sSUFBSSxHQUFHO1lBQ1QsTUFBTTtZQUNOLE9BQU87WUFDUCxHQUFHLEVBQUUseUJBQVcsQ0FBQyxZQUFZO1lBQzdCLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFBO1FBQ0QsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLHFCQUFxQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDL0csTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7UUFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDL0IsT0FBTyxJQUFJLGdCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQU9ELEtBQUssQ0FBQyxJQUFZLEVBQUUsTUFBTTtRQUN0QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUd6QyxJQUFJLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLENBQUMsRUFBRTtZQUN6QyxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUtELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQWxERCxrQ0FrREM7QUFDRCxrQkFBZSxJQUFJLFdBQVcsQ0FBQyx5QkFBVyxDQUFDLFlBQVksRUFBRSwrQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUMifQ==