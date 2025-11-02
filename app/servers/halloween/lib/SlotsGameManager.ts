import  {IHalloweenScene}  from "./interface/IHalloweenScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<IHalloweenScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}