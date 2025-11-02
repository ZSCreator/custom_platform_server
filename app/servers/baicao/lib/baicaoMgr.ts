'use strict';
import { pinus } from "pinus";
import baicaoRoom from './baicaoRoom';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";

interface IsceneMgr {
    nid: string,
    id: number,
    name: string,
    lowBet: number,
    capBet: number,
    allinMaxNum: number,
    room_count: number,
    entryCond: number
    roomList?: baicaoRoom[];
}

export class GameManger extends TenantRoomManager<baicaoRoom> {
    realPlayerFirst = false;
    needAdd: boolean = true;

    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    stopTheRoom(room: baicaoRoom) {
        room.close();
    }

    // 创建房间
    createRoom(sceneId: number | string, roomId: string) {
        const system_room = {
            roomId,
            sceneId,
            nid: GameNidEnum.baicao,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/baicao').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        system_room['channel'] = baseChannel;
        system_room.sceneId = sceneInfo.id;
        system_room['lowBet'] = sceneInfo.lowBet;
        system_room['entryCond'] = sceneInfo.entryCond;
        return new baicaoRoom(system_room);
    }

    /**
     * 对战游戏只进入 没有开局的房间
     * @param room
     * @param player
     */
    check(room: baicaoRoom, player): boolean {
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

export default new GameManger(GameNidEnum.baicao, InteriorGameType.Battle, 'baicao');