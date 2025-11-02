import {Room} from "./room";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import {TenantRoomManager} from "../../../common/classes/subclass/tenantRoomManager";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

/**
 * 色碟房间管理
 */
export class ColorPlateRoomManager extends TenantRoomManager<Room>{
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
            nid: GameNidEnum.colorPlate,
            serverId: pinus.app.getServerId(),
        }

        const sceneInfo = getConfiguration('scenes/colorPlate').datas.find(scene => scene.id === sceneId);
        const {baseChannel} = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['ChipList'] = sceneInfo.ChipList;
        const _room = new Room(room, this as any);
        _room.init();
        _room.run();

        return _room;
    }
}

export default new ColorPlateRoomManager(GameNidEnum.colorPlate, InteriorGameType.Br, '色碟');