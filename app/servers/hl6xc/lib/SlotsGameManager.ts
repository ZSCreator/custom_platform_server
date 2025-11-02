import  {ISlots777Scene}  from "./interface/Ihl6xcScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<ISlots777Scene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}