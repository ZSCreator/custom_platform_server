import RoomManager from "../../../common/classes/roomManager";
import Room from "./scratchRoom";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

/**
 * 刮刮乐房间管理
 */
export class ScratchRoomManager extends RoomManager<Room>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    /**
     * 初始化
     */
    async init() {
        const sceneList = getConfiguration('scenes/Scratch').datas;

        if (!sceneList.length) {
            console.warn(`游戏: 刮刮乐 未初始化成功`);
            return;
        }

        await Promise.all(sceneList.map(async ({id}) => {
            await this.getRoom(id, '001');
        }));
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
            nid: this._nid,
            serverId: pinus.app.getServerId(),
        }

        const _room = new Room(room);
        _room.init();

        return _room;
    }

    /**
     * 保存所有房间内部奖池
     */
    async saveAllRoomsPool() {
        await Promise.all([...this.roomMap.values()].map(room => room.saveRoomPool()));
    }
}

export default new ScratchRoomManager(GameNidEnum.Scratch, InteriorGameType.Slots, '刮刮乐');