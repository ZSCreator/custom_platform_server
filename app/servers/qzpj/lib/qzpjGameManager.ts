import { IBaijiaScene } from "./interface/IqzpjScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class qzpjGameManager extends BaseGameManager<IBaijiaScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}