"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramCustomerMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const TelegramCustomer_entity_1 = require("./entity/TelegramCustomer.entity");
class TelegramCustomerMysqlDao extends ADao_abstract_1.AbstractDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter) {
        try {
            const telegramCustomer = await connectionManager_1.default.getConnection(true)
                .getRepository(TelegramCustomer_entity_1.TelegramCustomer)
                .findOne(parameter);
            return telegramCustomer;
        }
        catch (e) {
            console.error(e.stack);
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const BonusPoolRepository = connectionManager_1.default.getConnection()
                .getRepository(TelegramCustomer_entity_1.TelegramCustomer);
            const p = BonusPoolRepository.create(parameter);
            return await BonusPoolRepository.save(p);
        }
        catch (e) {
            console.error(e.stack);
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(TelegramCustomer_entity_1.TelegramCustomer)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(TelegramCustomer_entity_1.TelegramCustomer)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async findListToLimit(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(TelegramCustomer_entity_1.TelegramCustomer)
                .createQueryBuilder()
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.TelegramCustomerMysqlDao = TelegramCustomerMysqlDao;
exports.default = new TelegramCustomerMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVsZWdyYW1DdXN0b21lci5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9UZWxlZ3JhbUN1c3RvbWVyLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBK0M7QUFDL0Msc0VBQStEO0FBQy9ELDhFQUFvRTtBQVlwRSxNQUFhLHdCQUF5QixTQUFRLDJCQUE2QjtJQUN2RSxRQUFRLENBQUMsU0FBaUM7UUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWlDO1FBQzNDLElBQUk7WUFDQSxNQUFNLGdCQUFnQixHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDL0QsYUFBYSxDQUFDLDBDQUFnQixDQUFDO2lCQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxnQkFBZ0IsQ0FBQztTQUMzQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWlDO1FBQzdDLElBQUk7WUFDQSxNQUFNLG1CQUFtQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDeEQsYUFBYSxDQUFDLDBDQUFnQixDQUFDLENBQUM7WUFFckMsTUFBTSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sTUFBTSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDNUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFpQztRQUMxQyxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsMENBQWdCLENBQUM7aUJBQy9CLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBaUMsRUFBRSxhQUFxQztRQUNwRixJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsMENBQWdCLENBQUM7aUJBQy9CLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQVksRUFBRSxLQUFhO1FBQzdDLElBQUk7WUFDQSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDNUQsYUFBYSxDQUFDLDBDQUFnQixDQUFDO2lCQUMvQixrQkFBa0IsRUFBRTtpQkFDcEIsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDWCxlQUFlLEVBQUUsQ0FBQztZQUN2QixPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQzFCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQWxFRCw0REFrRUM7QUFFRCxrQkFBZSxJQUFJLHdCQUF3QixFQUFFLENBQUMifQ==