import { IFishPrawnCrab } from "./interface/IFishPrawnCrab";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class FishPrawnCrabGameManager extends BaseGameManager<IFishPrawnCrab>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}