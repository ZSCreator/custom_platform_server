"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRoomManager = void 0;
const roomManager_1 = require("../../../common/classes/roomManager");
const room_1 = require("./room");
const pinus_1 = require("pinus");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class SlotRoomManager extends roomManager_1.default {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    async init() {
        const sceneList = (0, JsonMgr_1.get)('scenes/RotateParty').datas;
        if (!sceneList.length) {
            console.warn(`游戏: 旋转派对 未初始化成功`);
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
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['experience'] = false;
        const _room = new room_1.default(room);
        _room.init();
        return _room;
    }
    async saveAllRoomsPool() {
        await Promise.all([...this.roomMap.values()].map(room => room.saveRoomPool()));
    }
}
exports.SlotRoomManager = SlotRoomManager;
exports.default = new SlotRoomManager(GameNidEnum_1.GameNidEnum.RotateParty, GameTypeEnum_1.InteriorGameType.Slots, '旋转派对');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Sb3RhdGVQYXJ0eS9saWIvcm9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQThEO0FBQzlELGlDQUEwQjtBQUMxQixpQ0FBNEI7QUFDNUIsNkRBQXdFO0FBQ3hFLDJFQUFzRTtBQUN0RSw2RUFBNEU7QUFNNUUsTUFBYSxlQUFnQixTQUFRLHFCQUFpQjtJQUNsRCxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFLRCxLQUFLLENBQUMsSUFBSTtRQUNOLE1BQU0sU0FBUyxHQUFHLElBQUEsYUFBZ0IsRUFBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUUvRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEMsT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBRTtZQUMzQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBT0QsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2QsUUFBUSxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUE7UUFFRCxNQUFNLEVBQUMsV0FBVyxFQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUk5QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRTNCLE1BQU0sS0FBSyxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUViLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFLRCxLQUFLLENBQUMsZ0JBQWdCO1FBQ2xCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQztDQUNKO0FBckRELDBDQXFEQztBQUVELGtCQUFlLElBQUksZUFBZSxDQUFDLHlCQUFXLENBQUMsV0FBVyxFQUFFLCtCQUFnQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyJ9