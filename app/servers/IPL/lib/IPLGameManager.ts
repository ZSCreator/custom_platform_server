import { BaseGameManager } from "../../../common/pojo/baseClass/BaseGameManager";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { IBaseScene } from "../../../common/interface/IBaseScene";
import GameManagerDao from "../../../common/dao/daoManager/Game.manager";

export default class IPLGameManager extends BaseGameManager<IBaseScene>{
    constructor(nid: GameNidEnum) {
        super();
        this.nid = nid;
    }

    async init() {
        const gameInfo = await GameManagerDao.findOne({ nid: this.nid }, true);
        await this.resetServerCurrentNumberPlayers();

        if (!gameInfo) {

            const gamesJson = require("../../../../config/data/games.json");
            const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);
            if (!targetGameJson) {
                console.error(`服务器 IPL | 初始化 | 检测 games.json 配置信息 |  未查询到 nid:${this.nid} 配置信息 |system_game 初始化终止`);

                throw new Error(`IPL games.json 缺少 nid:${this.nid} 的配置信息`);
            }

            await GameManagerDao.insertOne(targetGameJson);
        }
    }
}