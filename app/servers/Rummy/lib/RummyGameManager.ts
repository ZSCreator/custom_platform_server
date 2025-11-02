import { IRummy } from "./interface/IRummy";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class RummyGameManager extends BaseGameManager<IRummy>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}