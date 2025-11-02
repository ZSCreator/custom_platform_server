"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackTenantRoomManager = void 0;
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
const BlackJackRoomImpl_1 = require("./BlackJackRoomImpl");
class BlackJackTenantRoomManager extends tenantRoomManager_1.TenantRoomManager {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    createRoom(sceneId, roomId) {
        const room = {
            sceneId,
            roomId,
            nid: GameNidEnum_1.GameNidEnum.BlackJack,
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/BlackJack')
            .datas
            .find(scene => scene.id === sceneId);
        const { id, entryCond, lowBet, roomUserLimit, tallBet, ChipList } = sceneInfo;
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = id;
        room['entryCond'] = entryCond;
        room['lowBet'] = lowBet;
        room['roomUserLimit'] = roomUserLimit;
        room['areaMaxBet'] = tallBet;
        room['ChipList'] = ChipList;
        const roomInstance = new BlackJackRoomImpl_1.BlackJackRoomImpl(room, this);
        roomInstance.init();
        return roomInstance;
    }
    stopTheRoom(room) {
        room.close();
    }
}
exports.BlackJackTenantRoomManager = BlackJackTenantRoomManager;
exports.default = new BlackJackTenantRoomManager(GameNidEnum_1.GameNidEnum.BlackJack, GameTypeEnum_1.InteriorGameType.Br, "百人21点");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrVGVuYW50Um9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0phY2svbGliL0JsYWNrSmFja1RlbmFudFJvb21NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDBGQUF1RjtBQUN2Riw2REFBMEU7QUFDMUUsMkVBQXdFO0FBQ3hFLDZFQUE4RTtBQUM5RSwyREFBd0Q7QUFFeEQsTUFBYSwwQkFBMkIsU0FBUSxxQ0FBb0M7SUFDaEYsWUFBWSxHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQUM5RCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBZTtRQUVoRCxNQUFNLElBQUksR0FBRztZQUNULE9BQU87WUFDUCxNQUFNO1lBQ04sR0FBRyxFQUFFLHlCQUFXLENBQUMsU0FBUztTQUM3QixDQUFDO1FBRUYsTUFBTSxTQUFTLEdBQUcsSUFBQSxhQUFnQixFQUFDLGtCQUFrQixDQUFDO2FBQ2pELEtBQUs7YUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLE1BQU0sRUFDRixFQUFFLEVBQ0YsU0FBUyxFQUNULE1BQU0sRUFDTixhQUFhLEVBQ2IsT0FBTyxFQUNQLFFBQVEsRUFDWCxHQUFHLFNBQVMsQ0FBQztRQUVkLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxhQUFhLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQzVCLE1BQU0sWUFBWSxHQUFHLElBQUkscUNBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZELFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVwQixPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBQ0QsV0FBVyxDQUFDLElBQXVCO1FBQy9CLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0NBRUo7QUE3Q0QsZ0VBNkNDO0FBRUQsa0JBQWUsSUFBSSwwQkFBMEIsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsRUFBRSwrQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUEifQ==