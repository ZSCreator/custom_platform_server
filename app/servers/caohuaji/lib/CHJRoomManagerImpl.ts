import { pinus } from "pinus";
import Room from './Room';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";


export class CHJRoomManagerImpl extends TenantRoomManager<Room>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
     stopTheRoom(room: Room) {
        room.close();
    }

    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.caohuaji,
            serverId: pinus.app.getServerId(),
        }
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        const _room = new Room(room);
        _room.run();
        return _room;
    }
}



export default new CHJRoomManagerImpl(GameNidEnum.caohuaji, InteriorGameType.Br, 'caohuaji');