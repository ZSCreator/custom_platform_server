"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerBankMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const PlayerBank_entity_1 = require("./entity/PlayerBank.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlayerBankMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PlayerBank_entity_1.PlayerBank)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const playerBank = await connectionManager_1.default.getConnection()
                .getRepository(PlayerBank_entity_1.PlayerBank)
                .findOne(parameter);
            return playerBank;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerBank_entity_1.PlayerBank)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        try {
            const playerRepository = connectionManager_1.default.getConnection()
                .getRepository(PlayerBank_entity_1.PlayerBank);
            const p = playerRepository.create(parameter);
            return await playerRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerBank_entity_1.PlayerBank)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findManyAndCountForPlatform(platformUid, currentPage, pageSize = 20) {
        try {
            if (platformUid) {
                const result = await connectionManager_1.default.getConnection(true)
                    .getRepository(PlayerBank_entity_1.PlayerBank)
                    .createQueryBuilder("PlayerBank")
                    .where("PlayerBank.uid = :uid", { uid: platformUid })
                    .getManyAndCount();
                return result;
            }
            else {
                const result = await connectionManager_1.default.getConnection(true)
                    .getRepository(PlayerBank_entity_1.PlayerBank)
                    .createQueryBuilder("PlayerBank")
                    .where("PlayerBank.deep_level = 1")
                    .andWhere("PlayerBank.role_type = 2")
                    .andWhere("PlayerBank.status = 1")
                    .skip((currentPage - 1) * pageSize)
                    .take(currentPage * pageSize)
                    .orderBy("PlayerBank.id", "DESC")
                    .getManyAndCount();
                return result;
            }
        }
        catch (e) {
            return [[], 0];
        }
    }
    async findManyAndCountForAgentFromPlatform(rootUid, currentPage, pageSize = 20) {
        return await connectionManager_1.default.getConnection(true)
            .getRepository(PlayerBank_entity_1.PlayerBank)
            .createQueryBuilder("PlayerBank")
            .where("PlayerBank.root_uid = :rootUid")
            .andWhere("PlayerBank.deep_level = 2")
            .andWhere("PlayerBank.role_type = 3")
            .andWhere("PlayerBank.status = 1")
            .skip((currentPage - 1) * pageSize)
            .take(pageSize)
            .orderBy("PlayerBank.createDateTime")
            .setParameters({ rootUid })
            .getManyAndCount();
    }
    async findPlatformAllUid(uid) {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(PlayerBank_entity_1.PlayerBank)
                .createQueryBuilder("PlayerBank")
                .where("PlayerBank.rootUid = :rootUid", { rootUid: uid })
                .orderBy("PlayerBank.id", "DESC")
                .select(['PlayerBank.uid'])
                .getMany();
            return result;
        }
        catch (e) {
            return [];
        }
    }
    async findAgentAllUid(uid) {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(PlayerBank_entity_1.PlayerBank)
                .createQueryBuilder("PlayerBank")
                .where("PlayerBank.parentUid = :parentUid", { parentUid: uid })
                .orWhere("PlayerBank.uid = :uid", { uid: uid })
                .orderBy("PlayerBank.id", "DESC")
                .select(['PlayerBank.uid'])
                .getMany();
            return result;
        }
        catch (e) {
            return [];
        }
    }
    async updateAddForThirdApi(platformName, partialEntity) {
        try {
            const { gold, } = partialEntity;
            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold + ${gold}
                    WHERE platform_name = "${platformName}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateDeleForThirdApi(platformName, partialEntity) {
        try {
            const { gold, } = partialEntity;
            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold - ${gold}
                    WHERE platform_name = "${platformName}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.PlayerBankMysqlDao = PlayerBankMysqlDao;
exports.default = new PlayerBankMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyQmFuay5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9QbGF5ZXJCYW5rLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBK0M7QUFDL0Msa0VBQXdEO0FBQ3hELHNFQUErRDtBQUkvRCxNQUFhLGtCQUFvQixTQUFRLDJCQUF1QjtJQUM1RCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQXNCO1FBQ2pDLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLDhCQUFVLENBQUM7aUJBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBc0I7UUFDaEMsSUFBSTtZQUNBLE1BQU0sVUFBVSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNyRCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhCLE9BQU8sVUFBVSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBc0IsRUFBRSxhQUEwQjtRQUM5RCxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUV0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENB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