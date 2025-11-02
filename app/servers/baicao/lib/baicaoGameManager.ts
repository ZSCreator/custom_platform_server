import { IbaicaoScene } from "./interface/IbaicaoScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class RedPacketGameManager extends BaseGameManager<IbaicaoScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}