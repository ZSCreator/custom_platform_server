import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {IBaseScene} from "../../../common/interface/IBaseScene";

export default class GameManager extends BaseGameManager<IBaseScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}