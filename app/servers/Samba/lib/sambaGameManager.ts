import  {ISambaScene}  from "./interface/ISambaScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class SambaGameManager extends BaseGameManager<ISambaScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}