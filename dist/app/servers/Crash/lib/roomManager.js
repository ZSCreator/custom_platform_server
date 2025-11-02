"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrashRoomManager = void 0;
const room_1 = require("./room");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class CrashRoomManager extends tenantRoomManager_1.TenantRoomManager {
    constructor(nid, type, name) {
        super(nid, type, name);
        this.needAdd = true;
    }
    stopTheRoom(room) {
        room.close();
    }
    createRoom(sceneId, roomId) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum_1.GameNidEnum.Crash,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/Crash').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['ChipList'] = sceneInfo.ChipList;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;
        const _room = new room_1.Room(room, this);
        _room.init();
        _room.run();
        return _room;
    }
}
exports.CrashRoomManager = CrashRoomManager;
exports.default = new CrashRoomManager(GameNidEnum_1.GameNidEnum.Crash, GameTypeEnum_1.InteriorGameType.Br, 'Crash');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DcmFzaC9saWIvcm9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQTRCO0FBQzVCLDZEQUF3RTtBQUN4RSwyRUFBc0U7QUFDdEUsaUNBQThCO0FBQzlCLDBGQUFxRjtBQUNyRiw2RUFBNEU7QUFLNUUsTUFBYSxnQkFBaUIsU0FBUSxxQ0FBdUI7SUFHekQsWUFBWSxHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQUM5RCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUgzQixZQUFPLEdBQUcsSUFBSSxDQUFDO0lBSWYsQ0FBQztJQU1ELFdBQVcsQ0FBQyxJQUFVO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBT0QsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLHlCQUFXLENBQUMsS0FBSztZQUN0QixRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUVELE1BQU0sU0FBUyxHQUFHLElBQUEsYUFBZ0IsRUFBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUM3RixNQUFNLEVBQUMsV0FBVyxFQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxNQUFNLEtBQUssR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBVyxDQUFDLENBQUM7UUFDMUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRVosT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBekNELDRDQXlDQztBQUVELGtCQUFlLElBQUksZ0JBQWdCLENBQUMseUJBQVcsQ0FBQyxLQUFLLEVBQUUsK0JBQWdCLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDIn0=