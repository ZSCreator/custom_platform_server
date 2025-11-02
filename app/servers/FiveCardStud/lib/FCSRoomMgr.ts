import { pinus } from "pinus";
import FCSRoom from './FCSRoom';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";


export interface IsceneMgr {
    nid: string;
    id: number;
    name: string
    canCarryGold?: number[],
    room_count?: number
    lowBet?: number,
}

export class FRoomManger extends TenantRoomManager<FCSRoom>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: FCSRoom) {
        room.close();
    }
    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.FiveCardStud,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/FiveCardStud').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['canCarryGold'] = sceneInfo.canCarryGold;
        room['lowBet'] = sceneInfo.lowBet;
        room['sceneId'] = sceneInfo.id;
        return new FCSRoom(room);
    }

    /**
     * 对战游戏只进入 没有开局的房间
     * @param room
     * @param player
     */
    check(room: FCSRoom, player): boolean {
        const result = super.check(room, player);

        // 如果前面检查都通过
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }
        let num = room.players.filter(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER);
        if (result && num.length >= 3 && player.isRobot == 0) {
            return false;
        }
        return result;
    }
}

export default new FRoomManger(GameNidEnum.FiveCardStud, InteriorGameType.Battle, 'FiveCardStud');