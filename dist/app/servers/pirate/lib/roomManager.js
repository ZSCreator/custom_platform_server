"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PirateRoomManager = void 0;
const roomManager_1 = require("../../../common/classes/roomManager");
const Room_1 = require("./Room");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class PirateRoomManager extends roomManager_1.default {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    async init() {
        const sceneList = (0, JsonMgr_1.get)('scenes/pirate').datas;
        if (!sceneList.length) {
            console.warn(`游戏: 寻宝启航 未初始化成功`);
            return;
        }
        await Promise.all(sceneList.map(async ({ id }) => {
            await this.getRoom(id, '001');
        }));
    }
    createRoom(sceneId, roomId) {
        const room = {
            roomId,
            sceneId,
            nid: this._nid,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const _room = new Room_1.default(room);
        _room.init();
        return _room;
    }
    async saveAllRoomsPool() {
        await Promise.all([...this.roomMap.values()].map(room => room.saveRoomPool()));
    }
}
exports.PirateRoomManager = PirateRoomManager;
exports.default = new PirateRoomManager(GameNidEnum_1.GameNidEnum.pirate, GameTypeEnum_1.InteriorGameType.Slots, '寻宝奇航');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9waXJhdGUvbGliL3Jvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE4RDtBQUM5RCxpQ0FBMEI7QUFDMUIsNkRBQXdFO0FBQ3hFLDJFQUFzRTtBQUN0RSxpQ0FBNEI7QUFDNUIsNkVBQTRFO0FBSzVFLE1BQWEsaUJBQWtCLFNBQVEscUJBQWlCO0lBQ3BELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUtELEtBQUssQ0FBQyxJQUFJO1FBQ04sTUFBTSxTQUFTLEdBQUcsSUFBQSxhQUFnQixFQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUUxRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEMsT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBRTtZQUMzQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBT0QsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2QsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFYixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBS0QsS0FBSyxDQUFDLGdCQUFnQjtRQUNsQixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7Q0FDSjtBQTlDRCw4Q0E4Q0M7QUFFRCxrQkFBZSxJQUFJLGlCQUFpQixDQUFDLHlCQUFXLENBQUMsTUFBTSxFQUFFLCtCQUFnQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyJ9