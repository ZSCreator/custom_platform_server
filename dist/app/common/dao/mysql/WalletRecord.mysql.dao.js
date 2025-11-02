"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const WalletRecord_entity_1 = require("./entity/WalletRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class WalletRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(WalletRecord_entity_1.WalletRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const walletRecord = await connectionManager_1.default.getConnection()
                .getRepository(WalletRecord_entity_1.WalletRecord)
                .findOne(parameter);
            return walletRecord;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const walletRecordRepository = connectionManager_1.default.getConnection()
                .getRepository(WalletRecord_entity_1.WalletRecord);
            const p = walletRecordRepository.create(parameter);
            return await walletRecordRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(WalletRecord_entity_1.WalletRecord)
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
                .getRepository(WalletRecord_entity_1.WalletRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(page, limit, startTime, endTime) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(WalletRecord_entity_1.WalletRecord)
                .createQueryBuilder("WalletRecord")
                .where("WalletRecord.createDate BETWEEN :start AND :end", { start: startTime, end: endTime })
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async deletData(startTime) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .delete()
                .from(WalletRecord_entity_1.WalletRecord)
                .where(`Sp_WalletRecord.createDate < "${startTime}"`)
                .execute();
            return list;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new WalletRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0UmVjb3JkLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1dhbGxldFJlY29yZC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msc0VBQTREO0FBQzVELHNFQUErRDtBQUUvRCxNQUFNLG9CQUFxQixTQUFRLDJCQUF5QjtJQUN4RCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQXVKO1FBQ2xLLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBdUo7UUFDakssSUFBSTtZQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsa0NBQVksQ0FBQztpQkFDM0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBdUo7UUFDbkssSUFBSTtZQUNBLE1BQU0sc0JBQXNCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMzRCxhQUFhLENBQUMsa0NBQVksQ0FBQyxDQUFDO1lBRWpDLE1BQU0sQ0FBQyxHQUFHLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuRCxPQUFPLE1BQU0sc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQy9DO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBdUosRUFBRyxhQUE0SjtRQUNsVSxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsa0NBQVksQ0FBQztpQkFDM0IsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBYTtRQUN0QixJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsa0NBQVksQ0FBQztpQkFDM0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBS0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFhLEVBQUcsS0FBYyxFQUFHLFNBQWdCLEVBQUcsT0FBYTtRQUNuRixJQUFJO1lBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzVELGFBQWEsQ0FBQyxrQ0FBWSxDQUFDO2lCQUMzQixrQkFBa0IsQ0FBQyxjQUFjLENBQUM7aUJBQ2xDLEtBQUssQ0FBQyxpREFBaUQsRUFBQyxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUcsR0FBRyxFQUFFLE9BQU8sRUFBQyxDQUFDO2lCQUMxRixJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN4QixJQUFJLENBQUUsS0FBSyxDQUFDO2lCQUNaLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLE9BQVEsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQU1ELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBa0I7UUFDOUIsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxrQkFBa0IsRUFBRTtpQkFDcEIsTUFBTSxFQUFFO2lCQUNSLElBQUksQ0FBQyxrQ0FBWSxDQUFDO2lCQUNsQixLQUFLLENBQUMsaUNBQWlDLFNBQVMsR0FBRyxDQUFFO2lCQUNyRCxPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQVEsSUFBSSxDQUFDO1NBQ2hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FHSjtBQUVELGtCQUFlLElBQUksb0JBQW9CLEVBQUUsQ0FBQyJ9