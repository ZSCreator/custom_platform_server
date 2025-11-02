"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRoomDirector = void 0;
class SystemRoomDirector {
    constructor(builder) {
        this.builder = builder;
    }
    getRoom(serverId, sceneId = null) {
        let res = this.builder.buildBaseInfo()
            .buildServerId(serverId)
            .buildSceneId(sceneId)
            .buildJackpot()
            .getInstance();
        return res;
    }
    _getRoom(serverId, sceneId = null) {
        let res = this.builder.buildBaseInfo()
            .buildServerId(serverId)
            .buildSceneId(sceneId)
            .buildJackpot()
            .getMysqlInstance();
        return res;
    }
}
exports.SystemRoomDirector = SystemRoomDirector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtUm9vbURpcmVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9wb2pvL2VudGl0eS9TeXN0ZW1Sb29tRGlyZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxrQkFBa0I7SUFFM0IsWUFBb0IsT0FBMEI7UUFBMUIsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7SUFBSSxDQUFDO0lBRTVDLE9BQU8sQ0FBQyxRQUFnQixFQUFFLE9BQU8sR0FBRyxJQUFJO1FBQzNDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO2FBQ2pDLGFBQWEsQ0FBQyxRQUFRLENBQUM7YUFDdkIsWUFBWSxDQUFDLE9BQU8sQ0FBQzthQUNyQixZQUFZLEVBQUU7YUFDZCxXQUFXLEVBQUUsQ0FBQztRQUNuQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTSxRQUFRLENBQUMsUUFBZ0IsRUFBRSxPQUFPLEdBQUcsSUFBSTtRQUM1QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTthQUNqQyxhQUFhLENBQUMsUUFBUSxDQUFDO2FBQ3ZCLFlBQVksQ0FBQyxPQUFPLENBQUM7YUFDckIsWUFBWSxFQUFFO2FBQ2QsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQXJCRCxnREFxQkMifQ==