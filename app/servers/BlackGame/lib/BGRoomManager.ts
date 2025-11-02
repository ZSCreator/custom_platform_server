import { pinus } from "pinus";
import BGRoom from './BGRoom';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";


interface IsceneMgr {
    nid: string;
    id: number;
    name: string;
    entryCond?: number;
    room_count?: number;
    lowBet?: number;
}

export class BGRoomManagerImpl extends TenantRoomManager<BGRoom>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: BGRoom) {
        room.close();
    }
    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.BlackGame,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/BlackGame').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        // room['nid'] = sceneInfo.nid;
        room['sceneId'] = sceneInfo.id;
        room['roomId'] = roomId;
        room['name'] = sceneInfo.name;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        return new BGRoom(room);
    }

    /**
     * 对战游戏只进入 没有开局的房间
     * @param room
     * @param player
     */
    check(room: BGRoom, player): boolean {
        const result = super.check(room, player);

        // 如果前面检查都通过
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }

        return result;
    }
}
export default new BGRoomManagerImpl(GameNidEnum.BlackGame, InteriorGameType.Battle, 'BlackGame');