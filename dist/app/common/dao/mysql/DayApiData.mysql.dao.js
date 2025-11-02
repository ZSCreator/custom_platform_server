"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const DayApiData_entity_1 = require("./entity/DayApiData.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class AlarmEventThingMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(DayApiData_entity_1.DayApiData)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const dayApiData = await connectionManager_1.default.getConnection()
                .getRepository(DayApiData_entity_1.DayApiData)
                .findOne(parameter);
            return dayApiData;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const dayApiDataRepository = connectionManager_1.default.getConnection()
                .getRepository(DayApiData_entity_1.DayApiData);
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
                .getRepository(DayApiData_entity_1.DayApiData)
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
                .getRepository(DayApiData_entity_1.DayApiData)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(startTime, endTime) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(DayApiData_entity_1.DayApiData)
                .createQueryBuilder("DayApiData")
                .where("DayApiData.createDate BETWEEN :start AND :end", { start: startTime, end: endTime })
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new AlarmEventThingMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF5QXBpRGF0YS5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9EYXlBcGlEYXRhLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUErQztBQUMvQyxrRUFBd0Q7QUFDeEQsc0VBQStEO0FBRS9ELE1BQU0sdUJBQXdCLFNBQVEsMkJBQXVCO0lBQ3pELEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBOE87UUFDelAsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUErTztRQUN6UCxJQUFJO1lBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3JELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsT0FBTyxVQUFVLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUE4TztRQUMxUCxJQUFJO1lBQ0EsTUFBTSxvQkFBb0IsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3pELGFBQWEsQ0FBQyw4QkFBVSxDQUFDLENBQUM7WUFFL0IsTUFBTSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pELE9BQU8sTUFBTSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFnUCxFQUFHLGFBQXdNO1FBQ3ZjLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFhO1FBQ3RCLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQWtCLEVBQUcsT0FBZ0I7UUFDdkQsSUFBSTtZQUNBLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUM1RCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsa0JBQWtCLENBQUMsWUFBWSxDQUFDO2lCQUNoQyxLQUFLLENBQUMsK0NBQStDLEVBQUMsRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFHLEdBQUcsRUFBRSxPQUFPLEVBQUMsQ0FBQztpQkFDeEYsZUFBZSxFQUFFLENBQUM7WUFDdkIsT0FBUSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztTQUN6QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBR0o7QUFFRCxrQkFBZSxJQUFJLHVCQUF1QixFQUFFLENBQUMifQ==