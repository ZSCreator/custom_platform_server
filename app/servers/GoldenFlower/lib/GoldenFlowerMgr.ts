import { pinus } from 'pinus';
import jhRoom from './jhRoom';
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { InteriorGameType } from '../../../common/constant/game/GameTypeEnum';
import { RoleEnum } from '../../../common/constant/player/RoleEnum';


interface IsceneMgr {
    nid: string;
    id: number;
    name: string;
    entryCond?: number;
    lowBet?: number;
    capBet?: number;
    room_count?: number;
    roomList?: jhRoom[];
}

export class GRoomManger extends TenantRoomManager<jhRoom> {
    needAdd: boolean = true;
    realPlayerFirst: boolean = false;

    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: jhRoom) {
        room.close();
    }
    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.GoldenFlower,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/GoldenFlower').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;
        room['sceneId'] = sceneInfo.id;//场id
        return new jhRoom(room);
    }

    /**
     * 对战游戏只进入 没有开局的房间
     * @param room
     * @param player
     */
    check(room: jhRoom, player): boolean {
        const result = super.check(room, player);

        // 如果前面检查都通过
        if (result && (room["status"] !== "INWAIT")) {
            return false;
        }
        // let num = room.players.filter(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER);
        // if (result && num.length >= 3 && player.isRobot == 0) {
        //     return false;
        // }
        return result;
    }
}
export default new GRoomManger(GameNidEnum.GoldenFlower, InteriorGameType.Battle, 'GoldenFlower');