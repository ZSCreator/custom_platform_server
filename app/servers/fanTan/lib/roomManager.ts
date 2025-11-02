import {Room} from "./room";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {pinus} from "pinus";
import {TenantRoomManager} from "../../../common/classes/subclass/tenantRoomManager";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

/**
 * 番摊房间管理
 */
export class FanTanRoomManager extends TenantRoomManager<Room>{
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
            nid: GameNidEnum.fanTan,
            serverId: pinus.app.getServerId(),
        }

        const sceneInfo = getConfiguration('scenes/fanTan').datas.find(scene => scene.id === sceneId);
        const {baseChannel} = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['ChipList'] = sceneInfo.ChipList;
        const _room = new Room(room, this);
        _room.init();
        _room.run();

        return _room;
    }
}

export default new FanTanRoomManager(GameNidEnum.fanTan, InteriorGameType.Br, '番摊');