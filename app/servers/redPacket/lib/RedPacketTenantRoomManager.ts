import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";
import RedPacketRoomImpl from "./RedPacketRoomImpl";

export class RedPacketTenantRoomManager extends TenantRoomManager<RedPacketRoomImpl>{

    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    createRoom(sceneId: string | number, roomId?: string): RedPacketRoomImpl {


        const sceneInfo = getConfiguration('scenes/redPacket')
            .datas
            .find(scene => scene.id === sceneId);

        const {
            id,
            entryCond,
            lowBet,
            roomUserLimit,
            tallBet,
            redParketNum
        } = sceneInfo;

        const room = {
            roomId,
            sceneId: id,
            nid: GameNidEnum.redPacket,
            redParketNum,
            entryCond
        };

        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;
        room['lowBet'] = lowBet;
        room['roomUserLimit'] = roomUserLimit;
        room['areaMaxBet'] = tallBet;

        const roomInstance = new RedPacketRoomImpl(room, this);

        roomInstance.init();
        roomInstance.run();

        return roomInstance;
    }
    stopTheRoom(room: RedPacketRoomImpl) {
        room.close();
    }

}

export default new RedPacketTenantRoomManager(GameNidEnum.redPacket, InteriorGameType.Br, "红包扫雷");