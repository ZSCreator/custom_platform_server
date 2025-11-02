"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const Player_entity_1 = require("./entity/Player.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlayerMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(Player_entity_1.Player)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const player = await connectionManager_1.default.getConnection()
                .getRepository(Player_entity_1.Player)
                .findOne(parameter);
            return player;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const playerRepository = connectionManager_1.default.getConnection()
                .getRepository(Player_entity_1.Player);
            const p = playerRepository.create(parameter);
            return await playerRepository.save(p);
        }
        catch (e) {
            console.error(`mysql | insertOne | 插入真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Player_entity_1.Player)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Player_entity_1.Player)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new PlayerMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1BsYXllci5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxvREFBK0M7QUFDL0MsMERBQWdEO0FBQ2hELHNFQUErRDtBQUUvRCxNQUFNLGNBQWUsU0FBUSwyQkFBbUI7SUFDNUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUEyMkI7UUFDdDNCLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLHNCQUFNLENBQUM7aUJBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBMjNCO1FBQ3I0QixJQUFJO1lBQ0EsTUFBTSxNQUFNLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ2pELGFBQWEsQ0FBQyxzQkFBTSxDQUFDO2lCQUNyQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFvNkI7UUFDaDdCLElBQUk7WUFDQSxNQUFNLGdCQUFnQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDckQsYUFBYSxDQUFDLHNCQUFNLENBQUMsQ0FBQztZQUUzQixNQUFNLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFN0MsT0FBTyxNQUFNLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDNUQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQXcxQixFQUFFLGFBQTIzQjtRQUNqdUQsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLHNCQUFNLENBQUM7aUJBQ3JCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQTAyQjtRQUNuM0IsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLHNCQUFNLENBQUM7aUJBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUVKO0FBRUQsa0JBQWUsSUFBSSxjQUFjLEVBQUUsQ0FBQyJ9