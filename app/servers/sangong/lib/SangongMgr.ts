import { pinus } from "pinus";
import sgRoom from './sgRoom';
import { base } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";


interface IsceneMgr extends base {
    nid: string,
    id: number,
    name: string,
    lowBet: number,
    capBet: number,
    allinMaxNum: number,
    room_count: number,
    entryCond: number
    roomList?: sgRoom[];
}

export class sgRoomManger extends TenantRoomManager<sgRoom> {
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: sgRoom) {
        room.close();
    }

    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.sangong,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/sangong').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room["sceneId"] = sceneInfo.id;
        room['lowBet'] = sceneInfo.lowBet;
        room['entryCond'] = sceneInfo.entryCond;
        return new sgRoom(room);
    }

    /**
     * 对战游戏只进入 没有开局的房间
     * @param room
     * @param player
     */
    check(room: sgRoom, player): boolean {
        const result = super.check(room, player);

        // 如果前面检查都通过
        if (result && (room["status"] !== "INWAIT")) {
            return false;
        }
        let num = room.players.filter(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER);
        if (result && num.length >= 3 && player.isRobot == 0) {
            return false;
        }
        return result;
    }
}
export default new sgRoomManger(GameNidEnum.sangong, InteriorGameType.Battle, 'sangong');