"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const GameCommission_entity_1 = require("./entity/GameCommission.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class GameCommissionMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(GameCommission_entity_1.GameCommission)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const gameCommission = await connectionManager_1.default.getConnection(true)
                .getRepository(GameCommission_entity_1.GameCommission)
                .findOne(parameter);
            return gameCommission;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const deductMoneyRepository = connectionManager_1.default.getConnection()
                .getRepository(GameCommission_entity_1.GameCommission);
            const p = deductMoneyRepository.create(parameter);
            return await deductMoneyRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(GameCommission_entity_1.GameCommission)
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
                .getRepository(GameCommission_entity_1.GameCommission)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit) {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(GameCommission_entity_1.GameCommission)
                .createQueryBuilder("GameCommission")
                .orderBy("GameCommission.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return result;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new GameCommissionMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUNvbW1pc3Npb24ubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvR2FtZUNvbW1pc3Npb24ubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLDBFQUFnRTtBQUNoRSxzRUFBK0Q7QUFFL0QsTUFBTSxzQkFBd0IsU0FBUSwyQkFBMkI7SUFDN0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFtTDtRQUM5TCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxzQ0FBYyxDQUFDO2lCQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQW1MO1FBQzdMLElBQUk7WUFDQSxNQUFNLGNBQWMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzdELGFBQWEsQ0FBQyxzQ0FBYyxDQUFDO2lCQUM3QixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxjQUFjLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFxTDtRQUNqTSxJQUFJO1lBQ0EsTUFBTSxxQkFBcUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzFELGFBQWEsQ0FBQyxzQ0FBYyxDQUFDLENBQUM7WUFFbkMsTUFBTSxDQUFDLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sTUFBTSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFrTCxFQUFHLGFBQXdMO1FBQ3pYLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxzQ0FBYyxDQUFDO2lCQUM3QixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFtTDtRQUM1TCxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsc0NBQWMsQ0FBQztpQkFDN0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBTUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQWEsRUFBRyxLQUFjO1FBQ3RELElBQUk7WUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQ3JELGFBQWEsQ0FBQyxzQ0FBYyxDQUFDO2lCQUM3QixrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDcEMsT0FBTyxDQUFDLG1CQUFtQixFQUFDLE1BQU0sQ0FBQztpQkFDbkMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDeEIsSUFBSSxDQUFFLEtBQUssQ0FBQztpQkFDWixlQUFlLEVBQUUsQ0FBQztZQUN2QixPQUFRLE1BQU0sQ0FBQztTQUNsQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBRUo7QUFFRCxrQkFBZSxJQUFJLHNCQUFzQixFQUFFLENBQUMifQ==