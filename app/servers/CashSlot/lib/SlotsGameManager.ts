import  {ICashSlotScene}  from "./interface/ICashSlotScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<ICashSlotScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}