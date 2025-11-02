import  {IgemsScene}  from "./interface/IgemsScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<IgemsScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}