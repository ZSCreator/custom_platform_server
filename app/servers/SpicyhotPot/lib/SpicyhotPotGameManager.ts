import { ISpicyhotPotScene } from "./interface/ISpicyhotPotScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SpicyhotPotGameManager extends BaseGameManager<ISpicyhotPotScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}