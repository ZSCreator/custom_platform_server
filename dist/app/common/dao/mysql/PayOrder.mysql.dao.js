"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PayOrder_entity_1 = require("./entity/PayOrder.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PayOrderMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PayOrder_entity_1.PayOrder)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const payOrder = await connectionManager_1.default.getConnection()
                .getRepository(PayOrder_entity_1.PayOrder)
                .findOne(parameter);
            return payOrder;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const alarmEventThingRepository = connectionManager_1.default.getConnection()
                .getRepository(PayOrder_entity_1.PayOrder);
            const p = alarmEventThingRepository.create(parameter);
            return await alarmEventThingRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PayOrder_entity_1.PayOrder)
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
                .getRepository(PayOrder_entity_1.PayOrder)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitByUid(uid, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(PayOrder_entity_1.PayOrder)
                .createQueryBuilder("PayOrder")
                .where("PayOrder.fk_uid = :uid AND PayOrder.status = 1", { uid })
                .orderBy("PayOrder.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(PayOrder_entity_1.PayOrder)
                .createQueryBuilder("PayOrder")
                .orderBy("PayOrder.id", "DESC")
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
exports.default = new PayOrderMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF5T3JkZXIubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvUGF5T3JkZXIubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLDhEQUFvRDtBQUNwRCxzRUFBK0Q7QUFFL0QsTUFBTSxnQkFBaUIsU0FBUSwyQkFBcUI7SUFDaEQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUF3UjtRQUNuUyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQywwQkFBUSxDQUFDO2lCQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQXdSO1FBQ2xTLElBQUk7WUFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDbkQsYUFBYSxDQUFDLDBCQUFRLENBQUM7aUJBQ3ZCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLFFBQVEsQ0FBQztTQUNuQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQXdSO1FBQ3BTLElBQUk7WUFDQSxNQUFNLHlCQUF5QixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDOUQsYUFBYSxDQUFDLDBCQUFRLENBQUMsQ0FBQztZQUU3QixNQUFNLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsT0FBTyxNQUFNLHlCQUF5QixDQUFDLElBQUksQ0FB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