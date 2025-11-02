"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHJRoomManagerImpl = void 0;
const pinus_1 = require("pinus");
const Room_1 = require("./Room");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class CHJRoomManagerImpl extends tenantRoomManager_1.TenantRoomManager {
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
            nid: GameNidEnum_1.GameNidEnum.caohuaji,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        const _room = new Room_1.default(room);
        _room.run();
        return _room;
    }
}
exports.CHJRoomManagerImpl = CHJRoomManagerImpl;
exports.default = new CHJRoomManagerImpl(GameNidEnum_1.GameNidEnum.caohuaji, GameTypeEnum_1.InteriorGameType.Br, 'caohuaji');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ0hKUm9vbU1hbmFnZXJJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY2FvaHVhamkvbGliL0NISlJvb21NYW5hZ2VySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBOEI7QUFDOUIsaUNBQTBCO0FBQzFCLDJFQUF3RTtBQUN4RSwwRkFBdUY7QUFDdkYsNkVBQTRFO0FBRzVFLE1BQWEsa0JBQW1CLFNBQVEscUNBQXVCO0lBQzNELFlBQVksR0FBZ0IsRUFBRSxJQUFzQixFQUFFLElBQVk7UUFDOUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUtBLFdBQVcsQ0FBQyxJQUFVO1FBQ25CLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBR0QsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLHlCQUFXLENBQUMsUUFBUTtZQUN6QixRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUNELE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO1FBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNaLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQTFCRCxnREEwQkM7QUFJRCxrQkFBZSxJQUFJLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsUUFBUSxFQUFFLCtCQUFnQixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyJ9