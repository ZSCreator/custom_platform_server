import  {IRotatePartyScene}  from "./interface/IRotatePartyScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class RotatePartyGameManager extends BaseGameManager<IRotatePartyScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}