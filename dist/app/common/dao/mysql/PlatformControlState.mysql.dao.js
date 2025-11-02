"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PlatformControlState_entity_1 = require("./entity/PlatformControlState.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlatformControlStateMysqlDao extends ADao_abstract_1.AbstractDao {
    async insertOne(parameter) {
        const repository = connectionManager_1.default.getConnection().getRepository(PlatformControlState_entity_1.PlatformControlStateEntity);
        const p = repository.create(parameter);
        return await repository.save(p);
    }
    async updateOne(param, updateParam) {
        return connectionManager_1.default.getConnection()
            .getRepository(PlatformControlState_entity_1.PlatformControlStateEntity)
            .update(param, updateParam);
    }
    async delete(params) {
        return connectionManager_1.default.getConnection()
            .getRepository(PlatformControlState_entity_1.PlatformControlStateEntity)
            .delete(params);
    }
    async findOne(params) {
        return connectionManager_1.default.getConnection()
            .getRepository(PlatformControlState_entity_1.PlatformControlStateEntity)
            .findOne(params);
    }
    async findManyByNidList(where) {
        let list = [];
        where.nidList.forEach(x => {
            list.push(`"${x}"`);
        });
        const sql = `SELECT *
            FROM Sp_PlatformControlState as P 
            WHERE P.platformId="${where.platformId}"
              AND P.tenantId="${where.tenantId}"
              AND P.state_type="${where.type}"
              AND P.nid in (${list})`;
        return connectionManager_1.default.getConnection(true).query(sql);
    }
    async findList() {
        return [];
    }
}
exports.default = new PlatformControlStateMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Db250cm9sU3RhdGUubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvUGxhdGZvcm1Db250cm9sU3RhdGUubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQTZDO0FBQzdDLHNGQUFnRjtBQUNoRixzRUFBK0Q7QUFLL0QsTUFBTSw0QkFBNkIsU0FBUywyQkFBdUM7SUFDL0UsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTO1FBQ3JCLE1BQU0sVUFBVSxHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsQ0FBQyx3REFBMEIsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkMsT0FBTyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQU9ELEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBb0UsRUFBRSxXQUFrRDtRQUNwSSxPQUFPLDJCQUFpQixDQUFDLGFBQWEsRUFBRTthQUNuQyxhQUFhLENBQUMsd0RBQTBCLENBQUM7YUFDekMsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBTUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFxRTtRQUM5RSxPQUFPLDJCQUFpQixDQUFDLGFBQWEsRUFBRTthQUNuQyxhQUFhLENBQUMsd0RBQTBCLENBQUM7YUFDekMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFNRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXdGO1FBQ2xHLE9BQU8sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2FBQ25DLGFBQWEsQ0FBQyx3REFBMEIsQ0FBQzthQUN6QyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQU1ELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUEyRjtRQUMvRyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sR0FBRyxHQUFHOztrQ0FFYyxLQUFLLENBQUMsVUFBVTtnQ0FDbEIsS0FBSyxDQUFDLFFBQVE7a0NBQ1osS0FBSyxDQUFDLElBQUk7OEJBQ2QsSUFBSSxHQUFHLENBQUM7UUFFOUIsT0FBTywyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFHRCxLQUFLLENBQUMsUUFBUTtRQUNWLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztDQU1KO0FBRUQsa0JBQWUsSUFBSSw0QkFBNEIsRUFBRSxDQUFDIn0=