"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRoomManager = void 0;
const roomManager_1 = require("../../../common/classes/roomManager");
const Room_1 = require("./Room");
const pinus_1 = require("pinus");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class SlotRoomManager extends roomManager_1.default {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    async init() {
        const sceneList = (0, JsonMgr_1.get)('scenes/halloween').datas;
        if (!sceneList.length) {
            console.warn(`游戏: 万圣夜 未初始化成功`);
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
        const _room = new Room_1.default(room);
        _room.init();
        return _room;
    }
    async saveAllRoomsPool() {
        await Promise.all([...this.roomMap.values()].map(room => room.saveRoomPool()));
    }
}
exports.SlotRoomManager = SlotRoomManager;
exports.default = new SlotRoomManager(GameNidEnum_1.GameNidEnum.Halloween, GameTypeEnum_1.InteriorGameType.Slots, '万圣夜');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsb3dlZW4vbGliL3Jvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE4RDtBQUM5RCxpQ0FBMEI7QUFDMUIsaUNBQTRCO0FBQzVCLDZEQUF3RTtBQUN4RSwyRUFBc0U7QUFDdEUsNkVBQTRFO0FBTTVFLE1BQWEsZUFBZ0IsU0FBUSxxQkFBaUI7SUFDbEQsWUFBWSxHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQUM5RCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFN0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9CLE9BQU87U0FDVjtRQUVELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU9ELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNkLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFBO1FBRUQsTUFBTSxFQUFDLFdBQVcsRUFBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7UUFFOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUtELEtBQUssQ0FBQyxnQkFBZ0I7UUFDbEIsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuRixDQUFDO0NBQ0o7QUFqREQsMENBaURDO0FBRUQsa0JBQWUsSUFBSSxlQUFlLENBQUMseUJBQVcsQ0FBQyxTQUFTLEVBQUUsK0JBQWdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDIn0=