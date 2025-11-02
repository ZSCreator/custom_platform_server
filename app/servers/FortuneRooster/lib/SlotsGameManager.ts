import  {IScene}  from "./interface/IScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SlotsGameManager extends BaseGameManager<IScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}