"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LWRoomManager = void 0;
const roomManager_1 = require("../../../common/classes/roomManager");
const Room_1 = require("./Room");
const pinus_1 = require("pinus");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameTypeEnum_1 = require("../../../common/constant/game/GameTypeEnum");
class LWRoomManager extends roomManager_1.default {
    constructor(nid, type, name) {
        super(nid, type, name);
    }
    async init() {
        const sceneList = (0, JsonMgr_1.get)('scenes/xiyouji').datas;
        if (!sceneList.length) {
            console.warn(`游戏: 幸运转盘 未初始化成功`);
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
exports.LWRoomManager = LWRoomManager;
exports.default = new LWRoomManager(GameNidEnum_1.GameNidEnum.luckyWheel, GameTypeEnum_1.InteriorGameType.Slots, '幸运转盘');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9sdWNreVdoZWVsL2xpYi9yb29tTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBOEQ7QUFDOUQsaUNBQTBCO0FBQzFCLGlDQUE0QjtBQUM1Qiw2REFBd0U7QUFDeEUsMkVBQXNFO0FBQ3RFLDZFQUE0RTtBQUs1RSxNQUFhLGFBQWMsU0FBUSxxQkFBaUI7SUFFaEQsWUFBWSxHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQUM5RCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFM0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2hDLE9BQU87U0FDVjtRQUVELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU9ELFVBQVUsQ0FBQyxPQUF3QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUc7WUFDVCxNQUFNO1lBQ04sT0FBTztZQUNQLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNkLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFBO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUtELEtBQUssQ0FBQyxnQkFBZ0I7UUFDbEIsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuRixDQUFDO0NBQ0o7QUEvQ0Qsc0NBK0NDO0FBRUQsa0JBQWUsSUFBSSxhQUFhLENBQUMseUJBQVcsQ0FBQyxVQUFVLEVBQUUsK0JBQWdCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDIn0=