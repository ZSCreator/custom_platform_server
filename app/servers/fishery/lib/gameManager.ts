import { IFisheryScene } from "./interface/IFisheryScene";
import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

/**
 * 渔场大亨游戏管理类
 */
export default class FisheryGameManager extends BaseGameManager<IFisheryScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}

/**
 * 初始化
 * @param nid
 */
export function init(nid: GameNidEnum) {
    return new FisheryGameManager(nid).init();
}