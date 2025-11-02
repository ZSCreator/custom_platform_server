import { IXiYouJiScene } from "./interface/IXiYouJiScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class XiYouJiGameManager extends BaseGameManager<IXiYouJiScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}