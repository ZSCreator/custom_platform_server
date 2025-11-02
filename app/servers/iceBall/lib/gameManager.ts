import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

export default class IceBallGameManager extends BaseGameManager<any>{
    private static instance: IceBallGameManager;
    static getInstance() {
        if (!this.instance) {
            this.instance = new IceBallGameManager(GameNidEnum.IceBall);
        }

        return this.instance;
    }

    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}