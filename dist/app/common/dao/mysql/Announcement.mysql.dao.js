"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const Announcement_entity_1 = require("./entity/Announcement.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class AnnouncementMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(Announcement_entity_1.Announcement)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const announcement = await connectionManager_1.default.getConnection()
                .getRepository(Announcement_entity_1.Announcement)
                .findOne(parameter);
            return announcement;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const dayApiDataRepository = connectionManager_1.default.getConnection()
                .getRepository(Announcement_entity_1.Announcement);
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
                .getRepository(Announcement_entity_1.Announcement)
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
                .getRepository(Announcement_entity_1.Announcement)
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
                .getRepository(Announcement_entity_1.Announcement)
                .createQueryBuilder("Announcement")
                .orderBy("Announcement.id", "DESC")
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new AnnouncementMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5ub3VuY2VtZW50Lm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL0Fubm91bmNlbWVudC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msc0VBQTREO0FBQzVELHNFQUErRDtBQUUvRCxNQUFNLG9CQUFxQixTQUFRLDJCQUF5QjtJQUN4RCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQW9IO1FBQy9ILElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBb0g7UUFDOUgsSUFBSTtZQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsa0NBQVksQ0FBQztpQkFDM0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBb0g7UUFDaEksSUFBSTtZQUNBLE1BQU0sb0JBQW9CLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN6RCxhQUFhLENBQUMsa0NBQVksQ0FBQyxDQUFDO1lBRWpDLE1BQU0sQ0FBQyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNqRCxPQUFPLE1BQU0sb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzdDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBb0gsRUFBRyxhQUF3SDtRQUMzUCxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsa0NBQVksQ0FBQztpQkFDM0IsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBb0g7UUFDN0gsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUdELEtBQUssQ0FBQyxlQUFlO1FBQ2pCLElBQUk7WUFDQSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDNUQsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLGtCQUFrQixDQUFDLGNBQWMsQ0FBQztpQkFFbEMsT0FBTyxDQUFDLGlCQUFpQixFQUFDLE1BQU0sQ0FBQztpQkFDakMsZUFBZSxFQUFFLENBQUM7WUFDdkIsT0FBUSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztTQUN6QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBR0o7QUFFRCxrQkFBZSxJQUFJLG9CQUFvQixFQUFFLENBQUMifQ==