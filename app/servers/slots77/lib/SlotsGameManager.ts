import  {ISlots777Scene}  from "./../lib/interface/ISlots777Scene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<ISlots777Scene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}