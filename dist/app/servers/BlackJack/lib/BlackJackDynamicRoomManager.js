"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackDynamicRoomManager = void 0;
const IDynamicRoomManager_1 = require("../../../common/pojo/baseClass/DynamicRoom/IDynamicRoomManager");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
class BlackJackDynamicRoomManager extends IDynamicRoomManager_1.IDynamicRoomManager {
    constructor(opt) {
        super(opt);
        this.nid = GameNidEnum_1.GameNidEnum.BlackJack;
    }
    static getInstance() {
        if (!this.instance)
            this.instance = new BlackJackDynamicRoomManager({
                nid: GameNidEnum_1.GameNidEnum.BlackJack,
                type: IDynamicRoomManager_1.RoomType.Br
            });
        return this.instance;
    }
}
exports.BlackJackDynamicRoomManager = BlackJackDynamicRoomManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrRHluYW1pY1Jvb21NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQmxhY2tKYWNrL2xpYi9CbGFja0phY2tEeW5hbWljUm9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0dBQStHO0FBSS9HLDJFQUF3RTtBQUd4RSxNQUFhLDJCQUE0QixTQUFRLHlDQUE2RTtJQWExSCxZQUFZLEdBQXlDO1FBQ2pELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQWJmLFFBQUcsR0FBRyx5QkFBVyxDQUFDLFNBQVMsQ0FBQztJQWM1QixDQUFDO0lBVkQsTUFBTSxDQUFDLFdBQVc7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksMkJBQTJCLENBQUM7Z0JBQ2hFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFNBQVM7Z0JBQzFCLElBQUksRUFBRSw4QkFBUSxDQUFDLEVBQUU7YUFDcEIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7Q0FLSjtBQWhCRCxrRUFnQkMifQ==