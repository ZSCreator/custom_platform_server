import { IBaijiaScene } from "./interface/IqznnScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class qznnGameManager extends BaseGameManager<IBaijiaScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}