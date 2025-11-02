import { IDynamicRoomManager, RoomType } from "../../../common/pojo/baseClass/DynamicRoom/IDynamicRoomManager";
import { BlackJackRoomImpl } from "./BlackJackRoomImpl";
import { BlackJackPlayerImpl } from "./BlackJackPlayerImpl";
import { IBlackJackScene } from "./interface/IBlackJackScene";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { IBaseManagerInfo, IBaseRoomManagerConstructorParameter } from "../../../common/pojo/baseClass/DynamicRoom/interface";

export class BlackJackDynamicRoomManager extends IDynamicRoomManager<IBaseManagerInfo, BlackJackRoomImpl, BlackJackPlayerImpl> {
    nid = GameNidEnum.BlackJack;

    static instance: BlackJackDynamicRoomManager;

    static getInstance(): BlackJackDynamicRoomManager {
        if (!this.instance) this.instance = new BlackJackDynamicRoomManager({
            nid: GameNidEnum.BlackJack,
            type: RoomType.Br
        });
        return this.instance;
    }

    constructor(opt: IBaseRoomManagerConstructorParameter) {
        super(opt);
    }
}
