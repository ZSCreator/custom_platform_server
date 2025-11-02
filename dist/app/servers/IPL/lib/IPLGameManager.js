"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGameManager_1 = require("../../../common/pojo/baseClass/BaseGameManager");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
class IPLGameManager extends BaseGameManager_1.BaseGameManager {
    constructor(nid) {
        super();
        this.nid = nid;
    }
    async init() {
        const gameInfo = await Game_manager_1.default.findOne({ nid: this.nid }, true);
        await this.resetServerCurrentNumberPlayers();
        if (!gameInfo) {
            const gamesJson = require("../../../../config/data/games.json");
            const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);
            if (!targetGameJson) {
                console.error(`服务器 IPL | 初始化 | 检测 games.json 配置信息 |  未查询到 nid:${this.nid} 配置信息 |system_game 初始化终止`);
                throw new Error(`IPL games.json 缺少 nid:${this.nid} 的配置信息`);
            }
            await Game_manager_1.default.insertOne(targetGameJson);
        }
    }
}
exports.default = IPLGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVBMR2FtZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9JUEwvbGliL0lQTEdhbWVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0ZBQWlGO0FBR2pGLDhFQUF5RTtBQUV6RSxNQUFxQixjQUFlLFNBQVEsaUNBQTJCO0lBQ25FLFlBQVksR0FBZ0I7UUFDeEIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLFFBQVEsR0FBRyxNQUFNLHNCQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RSxNQUFNLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO1FBRTdDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFFWCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUNoRSxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxJQUFJLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxDQUFDO2dCQUVwRyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQzthQUM5RDtZQUVELE1BQU0sc0JBQWMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDbEQ7SUFDTCxDQUFDO0NBQ0o7QUF2QkQsaUNBdUJDIn0=