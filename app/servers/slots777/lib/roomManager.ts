import RoomManager from "../../../common/classes/roomManager";
import Room from "./Room";
import {pinus} from "pinus";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";


/**
 * 幸运777房间管理
 */
export class SlotRoomManager extends RoomManager<Room>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    /**
     * 初始化
     */
    async init() {
        const sceneList = getConfiguration('scenes/slots777').datas;

        if (!sceneList.length) {
            console.warn(`游戏: 幸运777 未初始化成功`);
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

        const {baseChannel} = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        // 如果场为一则为体验场
        // room['experience'] = sceneId === 0;
        room['experience'] = false;

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

export default new SlotRoomManager(GameNidEnum.slots777, InteriorGameType.Slots, '幸运777');