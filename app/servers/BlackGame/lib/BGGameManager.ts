import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";

export default class FishGameManager extends BaseGameManager<any>{
    private static instance: FishGameManager;
    static getInstance() {
        if (!this.instance) {
            this.instance = new FishGameManager(GameNidEnum.BlackGame);
        }

        return this.instance;
    }

    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }
}