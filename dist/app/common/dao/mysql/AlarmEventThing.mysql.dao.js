"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const AlarmEventThing_entity_1 = require("./entity/AlarmEventThing.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class AlarmEventThingMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const alarmEventThing = await connectionManager_1.default.getConnection(true)
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing)
                .findOne(parameter);
            return alarmEventThing;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const alarmEventThingRepository = connectionManager_1.default.getConnection()
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing);
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
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing)
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
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing)
                .createQueryBuilder("alarmEventThing")
                .orderBy("alarmEventThing.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit, status) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing)
                .createQueryBuilder("alarmEventThing")
                .where("alarmEventThing.status = :status", { status: status })
                .orderBy("alarmEventThing.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitStatus(status) {
        try {
            const count = await connectionManager_1.default.getConnection(true)
                .getRepository(AlarmEventThing_entity_1.AlarmEventThing)
                .createQueryBuilder("alarmEventThing")
                .where("alarmEventThing.status = :status", { status: status })
                .getCount();
            return count;
        }
        catch (e) {
            return 0;
        }
    }
    async deletData(startTime) {
        try {
            await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .delete()
                .from(AlarmEventThing_entity_1.AlarmEventThing)
                .where(`Sp_AlarmEventThing.createDate < "${startTime}" `)
                .execute();
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new AlarmEventThingMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxhcm1FdmVudFRoaW5nLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL0FsYXJtRXZlbnRUaGluZy5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0MsNEVBQWtFO0FBQ2xFLHNFQUErRDtBQUUvRCxNQUFNLHVCQUF3QixTQUFRLDJCQUE0QjtJQUM5RCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQXlUO1FBQ3BVLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLHdDQUFlLENBQUM7aUJBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBK1E7UUFDelIsSUFBSTtZQUNBLE1BQU0sZUFBZSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDOUQsYUFBYSxDQUFDLHdDQUFlLENBQUM7aUJBQzlCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLGVBQWUsQ0FBQztTQUMxQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQStRO1FBQzNSLElBQUk7WUFHQSxNQUFNLHlCQUF5QixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDOUQsYUFBYSxDQUFDLHdDQUFlLENBQUMsQ0FBQztZQUVwQyxNQUFNLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsT0FBTyxNQUFNLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQStRLEVBQUcsYUFBb1I7UUFDbGpCLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyx3Q0FBZSxDQUFDO2lCQUM5QixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFhO1FBQ3RCLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyx3Q0FBZSxDQUFDO2lCQUM5QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQWEsRUFBRyxLQUFjO1FBQ2hELElBQUk7WUFDQSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDNUQsYUFBYSxDQUFDLHdDQUFlLENBQUM7aUJBQzlCLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO2lCQUVyQyxPQUFPLENBQUMsb0JBQW9CLEVBQUMsTUFBTSxDQUFDO2lCQUNwQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN4QixJQUFJLENBQUUsS0FBSyxDQUFDO2lCQUNaLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLE9BQVEsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUtELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFhLEVBQUcsS0FBYyxFQUFHLE1BQWU7UUFDeEUsSUFBSTtZQUNBLE1BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUksTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUM5RCxhQUFhLENBQUMsd0NBQWUsQ0FBQztpQkFDOUIsa0JBQWtCLENBQUMsaUJBQWlCLENBQUM7aUJBQ3JDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRyxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUUsQ0FBQztpQkFDOUQsT0FBTyxDQUFDLG9CQUFvQixFQUFDLE1BQU0sQ0FBQztpQkFDcEMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDeEIsSUFBSSxDQUFFLEtBQUssQ0FBQztpQkFDWixlQUFlLEVBQUUsQ0FBQztZQUN2QixPQUFRLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFFO1NBQzFCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFNRCxLQUFLLENBQUMscUJBQXFCLENBQUMsTUFBZTtRQUN2QyxJQUFJO1lBQ0EsTUFBTyxLQUFLLEdBQUksTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUN0RCxhQUFhLENBQUMsd0NBQWUsQ0FBQztpQkFDOUIsa0JBQWtCLENBQUMsaUJBQWlCLENBQUM7aUJBQ3JDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRyxFQUFDLE1BQU0sRUFBRyxNQUFNLEVBQUUsQ0FBQztpQkFDOUQsUUFBUSxFQUFFLENBQUM7WUFDaEIsT0FBUSxLQUFLLENBQUU7U0FDbEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7SUFDTCxDQUFDO0lBTUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFrQjtRQUM5QixJQUFJO1lBQ0EsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ2xDLGtCQUFrQixFQUFFO2lCQUNwQixNQUFNLEVBQUU7aUJBQ1IsSUFBSSxDQUFDLHdDQUFlLENBQUM7aUJBQ3JCLEtBQUssQ0FBQyxvQ0FBb0MsU0FBUyxJQUFJLENBQUU7aUJBQ3pELE9BQU8sRUFBRSxDQUFDO1lBQ2YsT0FBUSxJQUFJLENBQUM7U0FDaEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUVKO0FBRUQsa0JBQWUsSUFBSSx1QkFBdUIsRUFBRSxDQUFDIn0=