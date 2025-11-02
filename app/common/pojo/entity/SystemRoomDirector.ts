import { SystemRoomBuilder } from "./SystemRoomBuilder";

export class SystemRoomDirector {

    constructor(private builder: SystemRoomBuilder) { }

    public getRoom(serverId: string, sceneId = null) {
        let res = this.builder.buildBaseInfo()
            .buildServerId(serverId)
            .buildSceneId(sceneId)
            .buildJackpot()
            .getInstance();
        return res;
    }

    public _getRoom(serverId: string, sceneId = null) {
        let res = this.builder.buildBaseInfo()
            .buildServerId(serverId)
            .buildSceneId(sceneId)
            .buildJackpot()
            .getMysqlInstance();
        return res;
    }
}