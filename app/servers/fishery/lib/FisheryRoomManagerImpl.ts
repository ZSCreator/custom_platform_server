import {pinus} from "pinus";
import fRoom from './fRoom';
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {TenantRoomManager} from "../../../common/classes/subclass/tenantRoomManager";
import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";


export class FisheryRoomManager extends TenantRoomManager<fRoom>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: fRoom) {
        room.close();
    }

    /**
     * 创建一个房间
     * @param sceneId
     * @param roomId
     */
    createRoom(sceneId: number | string, roomId: string): fRoom {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.fishery,
            serverId: pinus.app.getServerId(),
        }

        const sceneInfo = getConfiguration('scenes/fishery').datas.find(scene => scene.id === sceneId);
        const {baseChannel} = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['entryCond'] = sceneInfo.entryCond;
        room['sceneId'] = sceneInfo.id;
        room['lowBet'] = sceneInfo.lowBet;
        room['ChipList'] = sceneInfo.ChipList;
        const _room = new fRoom(room, this);
        _room.init();
        _room.run();

        return _room;
    }
}

export default new FisheryRoomManager(GameNidEnum.fishery, InteriorGameType.Br, '渔场大亨')