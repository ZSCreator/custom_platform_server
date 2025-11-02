import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import { ICaoHuaJiScene } from "./interface/ICaoHuaJiScene";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export class CaoHuaJiGameManagerImpl extends BaseGameManager<ICaoHuaJiScene> {
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}