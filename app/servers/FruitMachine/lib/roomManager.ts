import RoomManager from "../../../common/classes/roomManager";
import Room from "./RoomStandAlone";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

/**
 * 水果机房间管理
 */
export class FruitMachineRoomManager extends RoomManager<Room>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    /**
     * 初始化
     */
    async init() {
        const sceneList = getConfiguration('scenes/FruitMachine').datas;

        if (!sceneList.length) {
            console.warn(`游戏: 水果机 未初始化成功`);
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

        const scene = getConfiguration('scenes/FruitMachine').datas.find(scene => scene.id === sceneId);
        room['betLimit'] = scene.betLimit;
        room['roomCapacity']= scene.roomCapacity;

        const _room = new Room(room);
        _room.init();

        return _room;
    }
}

export default new FruitMachineRoomManager(GameNidEnum.FruitMachine, InteriorGameType.Slots, '水果机');