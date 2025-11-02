"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolFactory = void 0;
const Game_manager_1 = require("../../common/dao/daoManager/Game.manager");
const pinus_logger_1 = require("pinus-logger");
const PoolImpl_1 = require("./pool/PoolImpl");
const gamesConfig = require('../../../config/data/games');
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class PoolFactory {
    static async getInstance(nid, sceneId, roomId) {
        if (!nid)
            throw Error('获取奖金池实例出错: nid 是必须参数');
        const gameConfig = await Game_manager_1.default.findOne({ nid });
        if (!gameConfig)
            throw Error(`奖金池|   ，请确认 config/data/games.json 文件|nid:${nid},获取信息${gameConfig}`);
        const initConstructorParamter = `${nid}|${Number.isInteger(sceneId) ? sceneId : ''}|${roomId ? roomId : ''}`;
        if (this.checkInstanceList.findIndex(constructorParamter => constructorParamter === initConstructorParamter) < 0) {
            this.checkInstanceList.push(initConstructorParamter);
            const { zname, name } = gameConfig;
            const targetIndex = gamesConfig.findIndex(info => info.name === name);
            let { serverName } = gamesConfig[targetIndex];
            let initPoolConstructorParamter = { zname, serverName };
            switch (nid) {
                default:
                    const source = { nid, sceneId };
                    Object.assign(initPoolConstructorParamter, source);
                    this.instanceMap[initConstructorParamter] = new PoolImpl_1.PoolImpl(initPoolConstructorParamter);
                    await this.instanceMap[initConstructorParamter].initAllPoolConfig(source);
                    break;
            }
        }
        return this.instanceMap[initConstructorParamter];
    }
    static async saveAllPoolsHistory() {
        await Promise.all(Object.values(this.instanceMap).map((instance) => instance.saveBonusPoolHistory()));
    }
    static async clearAllPoolsAmount() {
        await Promise.all(Object.values(this.instanceMap).map((instance) => instance.clearAllPool()));
    }
}
exports.PoolFactory = PoolFactory;
PoolFactory.checkInstanceList = [];
PoolFactory.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbEZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvYm9udXNQb29scy9Qb29sRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyRUFBcUU7QUFDckUsK0NBQXlDO0FBQ3pDLDhDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUUxRCxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRW5ELE1BQWEsV0FBVztJQU10QixNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFXLEVBQUUsT0FBZ0IsRUFBRSxNQUFlO1FBRXJFLElBQUksQ0FBQyxHQUFHO1lBQUUsTUFBTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUU5QyxNQUFNLFVBQVUsR0FBRyxNQUFNLHNCQUFjLENBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsVUFBVTtZQUFFLE1BQU0sS0FBSyxDQUFDLDZDQUE2QyxHQUFHLFFBQVEsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUVuRyxNQUFNLHVCQUF1QixHQUFHLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUU3RyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLG1CQUFtQixLQUFLLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBRWhILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyRCxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQztZQUVuQyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztZQUN0RSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlDLElBQUksMkJBQTJCLEdBQUcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUM7WUFFeEQsUUFBUSxHQUFHLEVBQUU7Z0JBUVg7b0JBQ0UsTUFBTSxNQUFNLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsR0FBRyxJQUFJLG1CQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQztvQkFDdEYsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzFFLE1BQU07YUFDVDtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFFbkQsQ0FBQztJQUtELE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CO1FBQzlCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFhLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3RyxDQUFDO0lBS0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUI7UUFDOUIsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQWEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRyxDQUFDOztBQTFESCxrQ0EyREM7QUF6RFEsNkJBQWlCLEdBQWEsRUFBRSxDQUFDO0FBRWpDLHVCQUFXLEdBQUcsRUFBRSxDQUFDIn0=