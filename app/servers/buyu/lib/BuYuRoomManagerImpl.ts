import { pinus } from "pinus";
import Room from './Room';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";


interface IsceneMgr {
    nid: string;
    id: number;
    name: string;
    entryCond?: number;
    /**子弹价值 */
    bullet_value?: number,
    /**概率 感觉没啥用 */
    base_rate?: number,
    room_count?: number;
    roomList?: Room[];
}

export class BuYuRoomManagerImpl extends TenantRoomManager<Room>{
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
            nid: GameNidEnum.buyu,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/buyu').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        // room['nid'] = sceneInfo.nid;
        room['sceneId'] = sceneInfo.id;
        room['roomId'] = roomId;
        room['name'] = sceneInfo.name;
        room['entryCond'] = sceneInfo.entryCond;
        room['bullet_value'] = sceneInfo.bullet_value;
        room['base_rate'] = sceneInfo.base_rate;
        let roomInfo = new Room(room);
        roomInfo.StartGame();
        return roomInfo;
    }

    /**
     * 对战游戏只进入 没有开局的房间
     * @param room
     * @param player
     */
    check(room: Room, player): boolean {
        const result = super.check(room, player);

        // 如果前面检查都通过
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }

        return result;
    }
}
export default new BuYuRoomManagerImpl(GameNidEnum.buyu, InteriorGameType.Battle, 'buyu');