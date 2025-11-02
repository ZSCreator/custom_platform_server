"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerUnlockGameDataMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const PlayerUnlockGameData_entity_1 = require("./entity/PlayerUnlockGameData.entity");
class PlayerUnlockGameDataMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(PlayerUnlockGameData_entity_1.PlayerUnlockGameData)
                .find(parameter);
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(PlayerUnlockGameData_entity_1.PlayerUnlockGameData)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const playerUnlockRepository = connectionManager_1.default.getConnection()
                .getRepository(PlayerUnlockGameData_entity_1.PlayerUnlockGameData);
            const p = playerUnlockRepository.create(parameter);
            return await playerUnlockRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerUnlockGameData_entity_1.PlayerUnlockGameData)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerUnlockGameData_entity_1.PlayerUnlockGameData)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.PlayerUnlockGameDataMysqlDao = PlayerUnlockGameDataMysqlDao;
exports.default = new PlayerUnlockGameDataMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyVW5sb2NrR2FtZURhdGEubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvUGxheWVyVW5sb2NrR2FtZURhdGEubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9EQUErQztBQUMvQyxzRUFBK0Q7QUFDL0Qsc0ZBQTRFO0FBUzVFLE1BQWEsNEJBQTZCLFNBQVEsMkJBQWlDO0lBQy9FLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBaUM7UUFDNUMsSUFBSTtZQUNBLE9BQU8sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNuQyxhQUFhLENBQUMsa0RBQW9CLENBQUM7aUJBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN4QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWlDO1FBQzNDLElBQUk7WUFDQSxPQUFPLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDbkMsYUFBYSxDQUFDLGtEQUFvQixDQUFDO2lCQUNuQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFpQztRQUM3QyxJQUFJO1lBQ0EsTUFBTSxzQkFBc0IsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzNELGFBQWEsQ0FBQyxrREFBb0IsQ0FBQyxDQUFDO1lBRXpDLE1BQU0sQ0FBQyxHQUFHLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuRCxPQUFPLE1BQU0sc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQy9DO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBaUM7UUFDMUMsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtEQUFvQixDQUFDO2lCQUNuQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWlDLEVBQUUsYUFBcUM7UUFDcEYsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtEQUFvQixDQUFDO2lCQUNuQyxNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQ0o7QUF2REQsb0VBdURDO0FBRUQsa0JBQWUsSUFBSSw0QkFBNEIsRUFBRSxDQUFDIn0=