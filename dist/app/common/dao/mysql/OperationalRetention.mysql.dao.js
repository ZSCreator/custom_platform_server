"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const OperationalRetention_entity_1 = require("./entity/OperationalRetention.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class OperationalRetentionMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(OperationalRetention_entity_1.OperationalRetention)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const operationalRetention = await connectionManager_1.default.getConnection(true)
                .getRepository(OperationalRetention_entity_1.OperationalRetention)
                .findOne(parameter);
            return operationalRetention;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const mailRecordsRepository = connectionManager_1.default.getConnection()
                .getRepository(OperationalRetention_entity_1.OperationalRetention);
            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(OperationalRetention_entity_1.OperationalRetention)
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
                .getRepository(OperationalRetention_entity_1.OperationalRetention)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertMany(parameterList) {
        try {
            await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .insert()
                .into(OperationalRetention_entity_1.OperationalRetention)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`每日统计玩家当日推广数据 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
    async getOperationalRetentionList_AgentName(agentName, startTimeDate, endTimeDate) {
        try {
            const sql = `
              SELECT * 
              FROM Sp_OperationalRetention 
              WHERE Sp_OperationalRetention.createDate >= "${startTimeDate}"  
              AND  Sp_OperationalRetention.createDate < "${endTimeDate}"  
              AND Sp_OperationalRetention.agentName = "${agentName}"
            `;
            const result = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            console.error(e.stack);
            return [];
        }
    }
}
exports.default = new OperationalRetentionMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aW9uYWxSZXRlbnRpb24ubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvT3BlcmF0aW9uYWxSZXRlbnRpb24ubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLHNGQUE0RTtBQUM1RSxzRUFBK0Q7QUFFL0QsTUFBTSw0QkFBNkIsU0FBUSwyQkFBaUM7SUFDeEUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFnTztRQUMzTyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxrREFBb0IsQ0FBQztpQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpTztRQUMzTyxJQUFJO1lBQ0EsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQ25FLGFBQWEsQ0FBQyxrREFBb0IsQ0FBQztpQkFDbkMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sb0JBQW9CLENBQUM7U0FDL0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFrTztRQUM5TyxJQUFJO1lBRUEsTUFBTSxxQkFBcUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzFELGFBQWEsQ0FBQyxrREFBb0IsQ0FBQyxDQUFDO1lBRXpDLE1BQU0sQ0FBQyxHQUFHLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxPQUFPLE1BQU0scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBeUIsRUFBRyxhQUF1TztRQUMvUSxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsa0RBQW9CLENBQUM7aUJBQ25DLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQXlCO1FBQ2xDLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxrREFBb0IsQ0FBQztpQkFDbkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxhQUEwQztRQUN2RCxJQUFJO1lBQ0EsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ2xDLGtCQUFrQixFQUFFO2lCQUNwQixNQUFNLEVBQUU7aUJBQ1IsSUFBSSxDQUFDLGtEQUFvQixDQUFDO2lCQUMxQixNQUFNLENBQUMsYUFBYSxDQUFDO2lCQUNyQixPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1lBQ3BELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQVdELEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxTQUFpQixFQUFHLGFBQXFCLEVBQUUsV0FBb0I7UUFDdkcsSUFBSTtZQUNDLE1BQU0sR0FBRyxHQUFHOzs7NkRBR29DLGFBQWE7MkRBQ2YsV0FBVzt5REFDYixTQUFTO2FBQ3JELENBQUM7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLDJCQUFpQjtpQkFDakMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWhCLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztDQU1KO0FBRUQsa0JBQWUsSUFBSSw0QkFBNEIsRUFBRSxDQUFDIn0=