import {get as getConfiguration} from "../../../../config/data/JsonMgr";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import {TenantRoomManager} from "../../../common/classes/subclass/tenantRoomManager";
import {FishPrawnCrabRoomImpl} from "./FishPrawnCrabRoomImpl";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";
/**
 * 鱼虾蟹房间管理
 */
export class FishPrawnCrabRoomManager  extends TenantRoomManager<FishPrawnCrabRoomImpl>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: FishPrawnCrabRoomImpl) {
        room.close();
    }

    /**
     * 创建一个房间
     * @param sceneId
     * @param roomId
     */
    createRoom(sceneId: number | string, roomId: string): FishPrawnCrabRoomImpl {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.fishPrawnCrab,
            serverId: pinus.app.getServerId(),
        }

        const sceneInfo = getConfiguration('scenes/fishPrawnCrab').datas.find(scene => scene.id === sceneId);
        const {baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['sceneId'] = sceneInfo.id;
        room['sceneId'] = sceneInfo.id;
        room['maxCount'] = 100;
        room['ChipList'] = sceneInfo.ChipList;
        const _room = new FishPrawnCrabRoomImpl(room, this as any);
        _room.run();
        return _room;
    }
}

export default new FishPrawnCrabRoomManager(GameNidEnum.fishPrawnCrab, InteriorGameType.Br, '鱼虾蟹');