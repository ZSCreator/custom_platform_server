"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AndarBaharRoomManager = void 0;
const room_1 = require("./room");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_1 = require("pinus");
const tenantRoomManager_1 = require("../../../common/classes/subclass/tenantRoomManager");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class AndarBaharRoomManager extends tenantRoomManager_1.TenantRoomManager {
    constructor(nid, type, name) {
        super(nid, type, name);
        this.realPlayerFirst = false;
        this.needAdd = true;
    }
    stopTheRoom(room) {
        room.close();
    }
    createRoom(sceneId, roomId) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum_1.GameNidEnum.andarBahar,
            serverId: pinus_1.pinus.app.getServerId(),
        };
        const sceneInfo = (0, JsonMgr_1.get)('scenes/andarBahar').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;
        const _room = new room_1.Room(room, this);
        _room.init();
        _room.run();
        return _room;
    }
}
exports.AndarBaharRoomManager = AndarBaharRoomManager;
exports.default = new AndarBaharRoomManager(GameNidEnum_1.GameNidEnum.andarBahar, GameTypeEnum_1.InteriorGameType.Br, '猜AB');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hbmRhckJhaGFyL2xpYi9yb29tTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBOEI7QUFDOUIsNkRBQTBFO0FBQzFFLDJFQUF3RTtBQUN4RSxpQ0FBOEI7QUFDOUIsMEZBQXFGO0FBQ3JGLDZFQUE0RTtBQU01RSxNQUFhLHFCQUFzQixTQUFRLHFDQUF1QjtJQUk5RCxZQUFZLEdBQWdCLEVBQUUsSUFBc0IsRUFBRSxJQUFZO1FBQzlELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBSjNCLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLFlBQU8sR0FBWSxJQUFJLENBQUM7SUFJeEIsQ0FBQztJQU1ELFdBQVcsQ0FBQyxJQUFVO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBT0QsVUFBVSxDQUFDLE9BQXdCLEVBQUUsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNULE1BQU07WUFDTixPQUFPO1lBQ1AsR0FBRyxFQUFFLHlCQUFXLENBQUMsVUFBVTtZQUMzQixRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQTtRQUVELE1BQU0sU0FBUyxHQUFHLElBQUEsYUFBZ0IsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ2xHLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBRWxDLE1BQU0sS0FBSyxHQUFHLElBQUksV0FBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFWixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0o7QUExQ0Qsc0RBMENDO0FBRUQsa0JBQWUsSUFBSSxxQkFBcUIsQ0FBQyx5QkFBVyxDQUFDLFVBQVUsRUFBRSwrQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMifQ==