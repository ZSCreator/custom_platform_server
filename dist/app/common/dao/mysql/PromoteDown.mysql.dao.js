"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PromoteDown_entity_1 = require("./entity/PromoteDown.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PromoteDownMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PromoteDown_entity_1.PromoteDown)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const promoteDownOne = await connectionManager_1.default.getConnection(true)
                .getRepository(PromoteDown_entity_1.PromoteDown)
                .findOne(parameter);
            return promoteDownOne;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const dayApiDataRepository = connectionManager_1.default.getConnection()
                .getRepository(PromoteDown_entity_1.PromoteDown);
            const p = dayApiDataRepository.create(parameter);
            return await dayApiDataRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PromoteDown_entity_1.PromoteDown)
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
                .getRepository(PromoteDown_entity_1.PromoteDown)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit() {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(PromoteDown_entity_1.PromoteDown)
                .createQueryBuilder("PromoteDown")
                .orderBy("PromoteDown.id", "DESC")
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new PromoteDownMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbW90ZURvd24ubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvUHJvbW90ZURvd24ubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLG9FQUEwRDtBQUMxRCxzRUFBK0Q7QUFFL0QsTUFBTSxtQkFBb0IsU0FBUSwyQkFBd0I7SUFDdEQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFtSjtRQUM5SixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQW1KO1FBQzdKLElBQUk7WUFDQSxNQUFNLGNBQWMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzdELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsT0FBTyxjQUFjLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFtSjtRQUMvSixJQUFJO1lBQ0EsTUFBTSxvQkFBb0IsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3pELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDLENBQUM7WUFFaEMsTUFBTSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pELE9BQU8sTUFBTSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFtSixFQUFHLGFBQXVKO1FBQ3pULElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFtSjtRQUM1SixJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsZ0NBQVcsQ0FBQztpQkFDMUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLGVBQWU7UUFDakIsSUFBSTtZQUNBLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUM1RCxhQUFhLENBQUMsZ0NBQVcsQ0FBQztpQkFDMUIsa0JBQWtCLENBQUMsYUFBYSxDQUFDO2lCQUVqQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUMsTUFBTSxDQUFDO2lCQUNoQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixPQUFRLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FHSjtBQUVELGtCQUFlLElBQUksbUJBQW1CLEVBQUUsQ0FBQyJ9