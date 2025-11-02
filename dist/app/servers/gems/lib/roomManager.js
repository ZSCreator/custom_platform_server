"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gemsRoomManager = void 0;
const roomManager_1 = require("../../../common/classes/roomManager");
const Room_1 = require("./Room");
const pinus_1 = require("pinus");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class gemsRoomManager extends roomManager_1.default {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    async init() {
        const sceneList = (0, JsonMgr_1.get)('scenes/gems').datas;
        if (!sceneList.length) {
            console.warn(`游戏: gems 未初始化成功`);
            return;
        }
        await Promise.all(sceneList.map(async ({ id }) => {
            this.getRoom(id, '001');
        }));
    }
    createRoom(sceneId, roomId) {
        const room = {
            roomId,
            sceneId,
            nid: this._nid,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['experience'] = false;
        const _room = new Room_1.default(room);
        _room.init();
        return _room;
    }
    async saveAllRoomsPool() {
        await Promise.all([...this.roomMap.values()].map(room => room.saveRoomPool()));
    }
}
exports.gemsRoomManager = gemsRoomManager;
exports.default = new gemsRoomManager(GameNidEnum_1.GameNidEnum.gems, GameTypeEnum_1.InteriorGameType.Slots, 'gems');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nZW1zL2xpYi9yb29tTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBOEQ7QUFDOUQsaUNBQTBCO0FBQzFCLGlDQUE4QjtBQUM5Qiw2REFBMEU7QUFDMUUsMkVBQXdFO0FBQ3hFLDZFQUE4RTtBQU05RSxNQUFhLGVBQWdCLFNBQVEscUJBQWlCO0lBQ2xELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUtELEtBQUssQ0FBQyxJQUFJO1FBQ04sTUFBTSxTQUFTLEdBQUcsSUFBQSxhQUFnQixFQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUV4RCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEMsT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU9ELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNkLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFBO1FBRUQsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7UUFJOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUUzQixNQUFNLEtBQUssR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFYixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBS0QsS0FBSyxDQUFDLGdCQUFnQjtRQUNsQixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7Q0FDSjtBQXJERCwwQ0FxREM7QUFFRCxrQkFBZSxJQUFJLGVBQWUsQ0FBQyx5QkFBVyxDQUFDLElBQUksRUFBRSwrQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMifQ==