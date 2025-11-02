import {pinus} from "pinus";
import Room from '../../../servers/SpicyhotPot/lib/Room';
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";
import RoomManager from "../../../common/classes/roomManager";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";

export class HotpotRoomManager extends RoomManager<Room>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }


    /**
     * 初始化
     */
    async init() {
        const sceneList = getConfiguration('scenes/SpicyhotPot').datas;

        if (!sceneList.length) {
            console.warn(`游戏: 麻辣火锅 未初始化成功`);
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

        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        const _room = new Room(room);
        _room.init();

        return _room;
    }
}

export default new HotpotRoomManager(GameNidEnum.SpicyhotPot, InteriorGameType.Slots, '麻辣火锅');
