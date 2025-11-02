import { pinus } from "pinus";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";
import { BlackJackRoomImpl } from "./BlackJackRoomImpl";

export class BlackJackTenantRoomManager extends TenantRoomManager<BlackJackRoomImpl> {
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    createRoom(sceneId: string | number, roomId?: string): BlackJackRoomImpl {

        const room = {
            sceneId,
            roomId,
            nid: GameNidEnum.BlackJack,
        };

        const sceneInfo = getConfiguration('scenes/BlackJack')
            .datas
            .find(scene => scene.id === sceneId);

        const {
            id,
            entryCond,
            lowBet,
            roomUserLimit,
            tallBet,
            ChipList
        } = sceneInfo;

        const { baseChannel } = this.genChannel(sceneId, roomId);

        room['channel'] = baseChannel;
        room['sceneId'] = id;
        room['entryCond'] = entryCond;
        room['lowBet'] = lowBet;
        room['roomUserLimit'] = roomUserLimit;
        room['areaMaxBet'] = tallBet;
        room['ChipList'] = ChipList;
        const roomInstance = new BlackJackRoomImpl(room, this);

        roomInstance.init();

        return roomInstance;
    }
    stopTheRoom(room: BlackJackRoomImpl) {
        room.close();
    }

}

export default new BlackJackTenantRoomManager(GameNidEnum.BlackJack, InteriorGameType.Br, "百人21点")