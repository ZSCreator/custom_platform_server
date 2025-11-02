"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotpotRoomManager = void 0;
const pinus_1 = require("pinus");
const Room_1 = require("../../../servers/SpicyhotPot/lib/Room");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const roomManager_1 = require("../../../common/classes/roomManager");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
class HotpotRoomManager extends roomManager_1.default {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    async init() {
        const sceneList = (0, JsonMgr_1.get)('scenes/SpicyhotPot').datas;
        if (!sceneList.length) {
            console.warn(`游戏: 麻辣火锅 未初始化成功`);
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
}
exports.HotpotRoomManager = HotpotRoomManager;
exports.default = new HotpotRoomManager(GameNidEnum_1.GameNidEnum.SpicyhotPot, GameTypeEnum_1.InteriorGameType.Slots, '麻辣火锅');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbU1nci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NwaWN5aG90UG90L2xpYi9Sb29tTWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE0QjtBQUM1QixnRUFBeUQ7QUFDekQsMkVBQXNFO0FBQ3RFLDZFQUE0RTtBQUM1RSxxRUFBOEQ7QUFDOUQsNkRBQXdFO0FBRXhFLE1BQWEsaUJBQWtCLFNBQVEscUJBQWlCO0lBQ3BELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQU1ELEtBQUssQ0FBQyxJQUFJO1FBQ04sTUFBTSxTQUFTLEdBQUcsSUFBQSxhQUFnQixFQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxDQUFDO1FBRS9ELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoQyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFFO1lBQzNDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFPRCxVQUFVLENBQUMsT0FBd0IsRUFBRSxNQUFjO1FBQy9DLE1BQU0sSUFBSSxHQUFHO1lBQ1QsTUFBTTtZQUNOLE9BQU87WUFDUCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZCxRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUVELE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO1FBRTlCLE1BQU0sS0FBSyxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUViLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQTNDRCw4Q0EyQ0M7QUFFRCxrQkFBZSxJQUFJLGlCQUFpQixDQUFDLHlCQUFXLENBQUMsV0FBVyxFQUFFLCtCQUFnQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyJ9