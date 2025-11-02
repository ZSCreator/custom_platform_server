import  {IDeadBookScene}  from "./interface/IDeadBookScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class DeadBookGameManager extends BaseGameManager<IDeadBookScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}