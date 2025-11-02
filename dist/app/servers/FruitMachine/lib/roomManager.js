"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FruitMachineRoomManager = void 0;
const roomManager_1 = require("../../../common/classes/roomManager");
const RoomStandAlone_1 = require("./RoomStandAlone");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class FruitMachineRoomManager extends roomManager_1.default {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    async init() {
        const sceneList = (0, JsonMgr_1.get)('scenes/FruitMachine').datas;
        if (!sceneList.length) {
            console.warn(`游戏: 水果机 未初始化成功`);
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
        const scene = (0, JsonMgr_1.get)('scenes/FruitMachine').datas.find(scene => scene.id === sceneId);
        room['betLimit'] = scene.betLimit;
        room['roomCapacity'] = scene.roomCapacity;
        const _room = new RoomStandAlone_1.default(room);
        _room.init();
        return _room;
    }
}
exports.FruitMachineRoomManager = FruitMachineRoomManager;
exports.default = new FruitMachineRoomManager(GameNidEnum_1.GameNidEnum.FruitMachine, GameTypeEnum_1.InteriorGameType.Slots, '水果机');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9GcnVpdE1hY2hpbmUvbGliL3Jvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE4RDtBQUM5RCxxREFBb0M7QUFDcEMsNkRBQXdFO0FBQ3hFLDJFQUFzRTtBQUN0RSxpQ0FBOEI7QUFDOUIsNkVBQTRFO0FBSzVFLE1BQWEsdUJBQXdCLFNBQVEscUJBQWlCO0lBQzFELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUtELEtBQUssQ0FBQyxJQUFJO1FBQ04sTUFBTSxTQUFTLEdBQUcsSUFBQSxhQUFnQixFQUFDLHFCQUFxQixDQUFDLENBQUMsS0FBSyxDQUFDO1FBRWhFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMvQixPQUFPO1NBQ1Y7UUFFRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFFO1lBQzNDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFPRCxVQUFVLENBQUMsT0FBd0IsRUFBRSxNQUFjO1FBQy9DLE1BQU0sSUFBSSxHQUFHO1lBQ1QsTUFBTTtZQUNOLE9BQU87WUFDUCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZCxRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUEsYUFBZ0IsRUFBQyxxQkFBcUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRSxLQUFLLENBQUMsWUFBWSxDQUFDO1FBRXpDLE1BQU0sS0FBSyxHQUFHLElBQUksd0JBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFYixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0o7QUEzQ0QsMERBMkNDO0FBRUQsa0JBQWUsSUFBSSx1QkFBdUIsQ0FBQyx5QkFBVyxDQUFDLFlBQVksRUFBRSwrQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMifQ==