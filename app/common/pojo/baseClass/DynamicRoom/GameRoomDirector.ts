import { GameRoomBuilder } from "./GameRoomBuilder";

interface GameInfo {
    gameName: string;
    sceneId: number;
    roomUserLimit: number;
}

export class GameRoomDirector {
    constructor(private builder: GameRoomBuilder) { }

    public getRoomInstance({ gameName, sceneId, roomUserLimit }: GameInfo, sceneInfo) {
        return this.builder
            .setBaseInfo(gameName)
            .setServerId()
            .setSceneId(sceneId)
            .setJackpot()
            .getInstance(sceneInfo, roomUserLimit);
    }
}