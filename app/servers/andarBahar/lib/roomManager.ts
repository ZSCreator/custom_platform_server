import { Room } from "./room";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import {TenantRoomManager} from "../../../common/classes/subclass/tenantRoomManager";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

/**
 * 猜AB房间管理
 * @property realPlayerFirst 是否游戏匹配真人玩家的房间
 */
export class AndarBaharRoomManager extends TenantRoomManager<Room>{
    realPlayerFirst = false;
    needAdd: boolean = true;

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
            nid: GameNidEnum.andarBahar,
            serverId: pinus.app.getServerId(),
        }

        const sceneInfo = getConfiguration('scenes/andarBahar').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;

        const _room = new Room(room, this);
        _room.init();
        _room.run();

        return _room;
    }
}

export default new AndarBaharRoomManager(GameNidEnum.andarBahar, InteriorGameType.Br, '猜AB');