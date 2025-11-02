'use strict';
import { IBaiRenScene } from "./interface/ITeenPatti_interface";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class BaiRenGameManager extends BaseGameManager<IBaiRenScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}