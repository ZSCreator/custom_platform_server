import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { RummyRoomImpl } from "./RummyRoomImpl";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
/**
 * 拉米房间管理
 */
export class RummyRoomManager extends TenantRoomManager<RummyRoomImpl>{
    needAdd: boolean = true;
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: RummyRoomImpl) {
        room.close();
    }

    /**
     * 创建一个房间
     * @param sceneId
     * @param roomId
     */
    createRoom(sceneId: number | string, roomId: string): RummyRoomImpl {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.Rummy,
            serverId: pinus.app.getServerId(),
        }

        const sceneInfo = getConfiguration('scenes/Rummy').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['sceneId'] = sceneInfo.id;
        const _room = new RummyRoomImpl(room, this as any);
        return _room;
    }
    /**
    * 对战游戏只进入 没有开局的房间
    * @param room
    * @param player
    */
    check(room: RummyRoomImpl, player): boolean {
        const result = super.check(room, player);

        // 如果前面检查都通过
        if (result && (room["status"] !== "INWAIT")) {
            return false;
        }
        let num = room.players.filter(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER);
        if (result && num.length >= 1 && player.isRobot == 0) {
            return false;
        }
        return result;
    }
}

export default new RummyRoomManager(GameNidEnum.Rummy, InteriorGameType.Battle, '拉米');