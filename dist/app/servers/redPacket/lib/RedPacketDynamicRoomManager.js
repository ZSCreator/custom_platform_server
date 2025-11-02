"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedPacketDynamicRoomManager = void 0;
const IDynamicRoomManager_1 = require("../../../common/pojo/baseClass/DynamicRoom/IDynamicRoomManager");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
class RedPacketDynamicRoomManager extends IDynamicRoomManager_1.IDynamicRoomManager {
    constructor(opt) {
        super(opt);
        this.nid = GameNidEnum_1.GameNidEnum.redPacket;
    }
    static getInstance() {
        if (!this.instance)
            this.instance = new RedPacketDynamicRoomManager({
                nid: GameNidEnum_1.GameNidEnum.redPacket,
                type: IDynamicRoomManager_1.RoomType.Br
            });
        return this.instance;
    }
}
exports.RedPacketDynamicRoomManager = RedPacketDynamicRoomManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkUGFja2V0RHluYW1pY1Jvb21NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpYi9SZWRQYWNrZXREeW5hbWljUm9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0dBQStHO0FBSS9HLDJFQUF3RTtBQUl4RSxNQUFhLDJCQUE0QixTQUFRLHlDQUF1RTtJQWFwSCxZQUFZLEdBQXlDO1FBQ2pELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQWJmLFFBQUcsR0FBRyx5QkFBVyxDQUFDLFNBQVMsQ0FBQztJQWM1QixDQUFDO0lBVkQsTUFBTSxDQUFDLFdBQVc7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksMkJBQTJCLENBQUM7Z0JBQ2hFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFNBQVM7Z0JBQzFCLElBQUksRUFBRSw4QkFBUSxDQUFDLEVBQUU7YUFDcEIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7Q0FLSjtBQWhCRCxrRUFnQkMifQ==