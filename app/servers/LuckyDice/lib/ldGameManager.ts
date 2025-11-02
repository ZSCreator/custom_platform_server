import { IlandScene } from "./interface/IluckyDScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class landGameManager extends BaseGameManager<IlandScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}