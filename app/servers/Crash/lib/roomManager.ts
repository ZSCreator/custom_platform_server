import {Room} from "./room";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import {TenantRoomManager} from "../../../common/classes/subclass/tenantRoomManager";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

/**
 * Crash房间管理
 */
export class CrashRoomManager extends TenantRoomManager<Room>{
    needAdd = true;

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

    /**
     * 创建一个房间
     * @param sceneId
     * @param roomId
     */
    createRoom(sceneId: number | string, roomId: string): Room {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.Crash,
            serverId: pinus.app.getServerId(),
        }

        const sceneInfo = getConfiguration('scenes/Crash').datas.find(scene => scene.id === sceneId);
        const {baseChannel} = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['ChipList'] = sceneInfo.ChipList;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;
        const _room = new Room(room, this as any);
        _room.init();
        _room.run();

        return _room;
    }
}

export default new CrashRoomManager(GameNidEnum.Crash, InteriorGameType.Br, 'Crash');