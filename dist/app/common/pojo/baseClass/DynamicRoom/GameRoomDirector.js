"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoomDirector = void 0;
class GameRoomDirector {
    constructor(builder) {
        this.builder = builder;
    }
    getRoomInstance({ gameName, sceneId, roomUserLimit }, sceneInfo) {
        return this.builder
            .setBaseInfo(gameName)
            .setServerId()
            .setSceneId(sceneId)
            .setJackpot()
            .getInstance(sceneInfo, roomUserLimit);
    }
}
exports.GameRoomDirector = GameRoomDirector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJvb21EaXJlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vcG9qby9iYXNlQ2xhc3MvRHluYW1pY1Jvb20vR2FtZVJvb21EaXJlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRQSxNQUFhLGdCQUFnQjtJQUN6QixZQUFvQixPQUF3QjtRQUF4QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtJQUFJLENBQUM7SUFFMUMsZUFBZSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQVksRUFBRSxTQUFTO1FBQzVFLE9BQU8sSUFBSSxDQUFDLE9BQU87YUFDZCxXQUFXLENBQUMsUUFBUSxDQUFDO2FBQ3JCLFdBQVcsRUFBRTthQUNiLFVBQVUsQ0FBQyxPQUFPLENBQUM7YUFDbkIsVUFBVSxFQUFFO2FBQ1osV0FBVyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0o7QUFYRCw0Q0FXQyJ9