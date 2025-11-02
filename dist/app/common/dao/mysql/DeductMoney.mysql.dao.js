"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const DeductMoney_entity_1 = require("./entity/DeductMoney.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class DeductMoneyMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(DeductMoney_entity_1.DeductMoney)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const deductMoney = await connectionManager_1.default.getConnection(true)
                .getRepository(DeductMoney_entity_1.DeductMoney)
                .findOne(parameter);
            return deductMoney;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const deductMoneyRepository = connectionManager_1.default.getConnection()
                .getRepository(DeductMoney_entity_1.DeductMoney);
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
                .getRepository(DeductMoney_entity_1.DeductMoney)
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
                .getRepository(DeductMoney_entity_1.DeductMoney)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(DeductMoney_entity_1.DeductMoney)
                .createQueryBuilder("deductMoney")
                .orderBy("deductMoney.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new DeductMoneyMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVkdWN0TW9uZXkubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvRGVkdWN0TW9uZXkubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLG9FQUEwRDtBQUMxRCxzRUFBK0Q7QUFFL0QsTUFBTSxtQkFBb0IsU0FBUSwyQkFBd0I7SUFDdEQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUF3TjtRQUNuTyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQXdOO1FBQ2xPLElBQUk7WUFDQSxNQUFNLFdBQVcsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzFELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxXQUFXLENBQUM7U0FDdEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUF5TjtRQUNyTyxJQUFJO1lBQ0EsTUFBTSxxQkFBcUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzFELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDLENBQUM7WUFFaEMsTUFBTSxDQUFDLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sTUFBTSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUF1TixFQUFHLGFBQTZOO1FBQ25jLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUF3TjtRQUNqTyxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsZ0NBQVcsQ0FBQztpQkFDMUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBTUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQWEsRUFBRyxLQUFjO1FBQ3RELElBQUk7WUFDQSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDN0QsYUFBYSxDQUFDLGdDQUFXLENBQUM7aUJBQzFCLGtCQUFrQixDQUFDLGFBQWEsQ0FBQztpQkFDakMsT0FBTyxDQUFDLGdCQUFnQixFQUFDLE1BQU0sQ0FBQztpQkFDaEMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDeEIsSUFBSSxDQUFFLEtBQUssQ0FBQztpQkFDWixlQUFlLEVBQUUsQ0FBQztZQUN2QixPQUFRLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQUVELGtCQUFlLElBQUksbUJBQW1CLEVBQUUsQ0FBQyJ9