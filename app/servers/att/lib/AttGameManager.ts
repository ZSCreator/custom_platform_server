import { IBaijiaScene } from "./interface/IBaijiaScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class AttGameManager extends BaseGameManager<IBaijiaScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}