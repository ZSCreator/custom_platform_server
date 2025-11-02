import  {ITriplePandaScene}  from "./interface/ITriplePandaScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<ITriplePandaScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}