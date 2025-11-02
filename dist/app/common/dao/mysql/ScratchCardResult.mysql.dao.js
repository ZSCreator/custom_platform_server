"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const ScratchCardResult_entity_1 = require("./entity/ScratchCardResult.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class ScratchCardResultMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(ScratchCardResult_entity_1.ScratchCardResult)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const scratchCardResult = await connectionManager_1.default.getConnection()
                .getRepository(ScratchCardResult_entity_1.ScratchCardResult)
                .findOne(parameter);
            return scratchCardResult;
        }
        catch (e) {
            return null;
        }
    }
    async randomFindOneNotLottery(jackpotId) {
        const conn = connectionManager_1.default.getConnection();
        const result = await conn.query(`SELECT * FROM Sys_ScratchCardResult WHERE status=0 AND jackpotId=${jackpotId}`);
        return result.sort((a, b) => Math.random() - 0.5)[0];
    }
    async insertOne(parameter) {
        try {
            const scratchCardResultRepository = connectionManager_1.default.getConnection()
                .getRepository(ScratchCardResult_entity_1.ScratchCardResult);
            const p = scratchCardResultRepository.create(parameter);
            return await scratchCardResultRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const { affected } = await connectionManager_1.default.getConnection()
            .getRepository(ScratchCardResult_entity_1.ScratchCardResult)
            .update(parameter, partialEntity);
        return !!affected;
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(ScratchCardResult_entity_1.ScratchCardResult)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit) {
        try {
            const result = await connectionManager_1.default.getConnection()
                .getRepository(ScratchCardResult_entity_1.ScratchCardResult)
                .createQueryBuilder("ScratchCardResult")
                .orderBy("ScratchCardResult.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            console.warn("result", result);
            return result;
        }
        catch (e) {
            return false;
        }
    }
    async updateMany(parameter, partialEntity) {
        const scratchCardResult = await connectionManager_1.default.getConnection()
            .getRepository(ScratchCardResult_entity_1.ScratchCardResult)
            .update(parameter, partialEntity);
    }
}
exports.default = new ScratchCardResultMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyYXRjaENhcmRSZXN1bHQubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvU2NyYXRjaENhcmRSZXN1bHQubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQTZDO0FBQzdDLGdGQUFvRTtBQUNwRSxzRUFBK0Q7QUFXL0QsTUFBTSx5QkFBMEIsU0FBUSwyQkFBOEI7SUFDbEUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFvQjtRQUMvQixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyw0Q0FBaUIsQ0FBQztpQkFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFvQjtRQUM5QixJQUFJO1lBQ0EsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDNUQsYUFBYSxDQUFDLDRDQUFpQixDQUFDO2lCQUNoQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxpQkFBaUIsQ0FBQztTQUM1QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFLRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsU0FBaUI7UUFDM0MsTUFBTSxJQUFJLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUM7UUFHL0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLG9FQUFvRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ2pILE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFD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