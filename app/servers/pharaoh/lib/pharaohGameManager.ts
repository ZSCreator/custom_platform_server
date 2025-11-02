import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class PharaohGameManager extends BaseGameManager<any>{
    private static instance: PharaohGameManager;
    static getInstance() {
        if (!this.instance) {
            this.instance = new PharaohGameManager(GameNidEnum.pharaoh);
        }

        return this.instance;
    }

    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}