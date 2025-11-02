/**
 * 比牌场 管理中心
 */
import { pinus } from "pinus";
import DiceRoom from './DiceRoom';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";

interface IsceneMgr {
    nid: string,
    id: number,
    name: string,
    entryCond: number,
    lowBet: number,
    room_count: number,
}
export class ErRoomManger extends TenantRoomManager<DiceRoom>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: DiceRoom) {
        room.close();
    }
    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.DicePoker,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/DicePoker').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['sceneId'] = sceneInfo.id;//场id
        return new DiceRoom(room);
    }

    /**
     * 对战游戏只进入 没有开局的房间
     * @param room
     * @param player
     */
    check(room: DiceRoom, player): boolean {
        const result = super.check(room, player);

        // 如果前面检查都通过
        if (result && (room["status"] !== "INWAIT" && room["status"] !== "NONE")) {
            return false;
        }

        return result;
    }
}
export default new ErRoomManger(GameNidEnum.DicePoker, InteriorGameType.Battle, 'Dice');
