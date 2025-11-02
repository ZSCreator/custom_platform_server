import { IRedBlackScene } from "./interface/ISicBoScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class RedBlackGameManager extends BaseGameManager<IRedBlackScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}