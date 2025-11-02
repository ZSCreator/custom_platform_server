import { IPirateScene } from "./interface/IPirateScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class BaiRenGameManager extends BaseGameManager<IPirateScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}