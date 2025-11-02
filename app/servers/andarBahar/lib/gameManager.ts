import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class AndarBaharGameManager extends BaseGameManager<any>{
    static async init(nid: GameNidEnum): Promise<void> {
        return new AndarBaharGameManager(nid).init();
    }

    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}