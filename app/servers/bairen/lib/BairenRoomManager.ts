import { pinus } from "pinus";
import { BaiRenRoomImpl as Room } from './BaiRenRoomImpl';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";

export interface IsceneMgr {
    nid: string,
    id: number,
    name: string,
    entryCond: number,
    ShangzhuangMinNum: number
    /**最低下注要求 */
    lowBet: number,
    tallBet: number,
    room_count: number,
    compensate: number,
    roomList?: Room[];
    ChipList: number[];
}

export class BairenRoomManager extends TenantRoomManager<Room>{
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
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.bairen,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/bairen').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['sceneId'] = sceneInfo.id;
        room['entryCond'] = sceneInfo.entryCond;
        room['ShangzhuangMinNum'] = sceneInfo.ShangzhuangMinNum;
        room['lowBet'] = sceneInfo.lowBet;
        room['tallBet'] = sceneInfo.tallBet;
        room['compensate'] = sceneInfo.compensate;
        room['ChipList'] = sceneInfo.ChipList;
        let roomInfo = new Room(room);
        roomInfo.run();//运行房间
        return roomInfo;
    }
}


export default new BairenRoomManager(GameNidEnum.bairen, InteriorGameType.Br, '百人牛牛');