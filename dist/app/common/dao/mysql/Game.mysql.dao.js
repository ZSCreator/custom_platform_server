"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const ADao_abstract_1 = require("../ADao.abstract");
const Game_entity_1 = require("./entity/Game.entity");
const RDSClient_1 = require("./lib/RDSClient");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class GameMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(Game_entity_1.Game)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const game = await connectionManager_1.default.getConnection()
                .getRepository(Game_entity_1.Game)
                .findOne(parameter);
            return game;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Game_entity_1.Game)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        let reconnected = false;
        try {
            const gameRepository = connectionManager_1.default.getConnection()
                .getRepository(Game_entity_1.Game);
            const p = gameRepository.create(parameter);
            return await gameRepository.save(p);
        }
        catch (e) {
            if (e.name === "Connection is not established with mysql database" && !reconnected) {
                console.warn(`插入游戏配置信息出错:${e.stack}`);
                console.warn(`插入游戏配置信息出错: 补丁 若是未有连接|动态启动|清档重启等等，则重新创建连接`);
                await RDSClient_1.RDSClient.init(pinus_1.pinus.app.getServerId());
                reconnected = true;
                await this.insertOne(parameter);
            }
            else {
                console.error(`插入游戏配置信息出错:${e.stack}`);
            }
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Game_entity_1.Game)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new GameMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9HYW1lLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUM5QixvREFBK0M7QUFDL0Msc0RBQTRDO0FBQzVDLCtDQUE0QztBQUM1QyxzRUFBK0Q7QUFFL0QsTUFBTSxZQUFhLFNBQVEsMkJBQWlCO0lBQ3hDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBbVA7UUFDOVAsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsa0JBQUksQ0FBQztpQkFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFtUDtRQUM3UCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxrQkFBSSxDQUFDO2lCQUNuQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1QLEVBQUUsYUFBdVA7UUFDeGYsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtCQUFJLENBQUM7aUJBQ25CLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1QO1FBQy9QLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJO1lBQ0EsTUFBTSxjQUFjLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNuRCxhQUFhLENBQUMsa0JBQUksQ0FBQyxDQUFDO1lBRXpCLE1BQU0sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFM0MsT0FBTyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxtREFBbUQsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEYsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxDQUFDLENBQUM7Z0JBQzFELE1BQU0scUJBQVMsQ0FBQyxJQUFJLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUNuQixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDbkM7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQzFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQW1QO1FBQzVQLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxrQkFBSSxDQUFDO2lCQUNuQixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQUVELGtCQUFlLElBQUksWUFBWSxFQUFFLENBQUMifQ==