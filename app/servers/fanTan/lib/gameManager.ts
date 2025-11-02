import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class FanTanGameManager extends BaseGameManager<any>{
    static async init(nid: GameNidEnum): Promise<void> {
        return new FanTanGameManager(nid).init();
    }

    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}