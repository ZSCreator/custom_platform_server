import  {IcaishenScene}  from "./interface/IcaishenScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<IcaishenScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}