import { IDynamicRoomManager, RoomType } from "../../../common/pojo/baseClass/DynamicRoom/IDynamicRoomManager";
// import { IBlackJackScene } from "./interface/IBlackJackScene";
import RedPacketRoomImpl from "./RedPacketRoomImpl";
import RedPacketPlayerImpl from "./RedPacketPlayerImpl";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { IBaseRoomManagerConstructorParameter } from "../../../common/pojo/baseClass/DynamicRoom/interface";
import { IBaseScene } from "../../../common/interface/IBaseScene";

export class RedPacketDynamicRoomManager extends IDynamicRoomManager<IBaseScene, RedPacketRoomImpl, RedPacketPlayerImpl> {
    nid = GameNidEnum.redPacket;

    static instance: RedPacketDynamicRoomManager;

    static getInstance(): RedPacketDynamicRoomManager {
        if (!this.instance) this.instance = new RedPacketDynamicRoomManager({
            nid: GameNidEnum.redPacket,
            type: RoomType.Br
        });
        return this.instance;
    }

    constructor(opt: IBaseRoomManagerConstructorParameter) {
        super(opt);
    }
}