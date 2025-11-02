"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PlatformControl_entity_1 = require("./entity/PlatformControl.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const constants_1 = require("../../../services/newControl/constants");
const utils_1 = require("../../../utils");
class PlatformControlMysqlDao extends ADao_abstract_1.AbstractDao {
    async insertOne(parameter) {
        const repository = connectionManager_1.default.getConnection().getRepository(PlatformControl_entity_1.PlatformControlEntity);
        const p = repository.create(parameter);
        return await repository.save(p);
    }
    async findOneBySceneId(type, platformId, nid, sceneId) {
        const date = (0, utils_1.cDate)(new Date(new Date().toLocaleDateString()).getTime());
        const sql = `SELECT * 
            FROM Sp_PlatformControl AS P 
            WHERE P.platformId="${platformId}" 
              AND P.record_type="${type}"
              AND P.nid="${nid}" 
              AND P.sceneId=${sceneId} 
              AND P.createTime>="${date}"
            LIMIT 1`;
        return connectionManager_1.default.getConnection(true)
            .query(sql);
    }
    async findOneByTenantIdAndSceneId(platformId, tenantId, nid, sceneId) {
        const date = (0, utils_1.cDate)(new Date(new Date().toLocaleDateString()).getTime());
        const sql = `SELECT * 
            FROM Sp_PlatformControl AS P 
            WHERE P.platformId="${platformId}" 
              AND P.tenantId="${tenantId}"
              AND P.record_type="${constants_1.RecordTypes.TENANT_SCENE}"
              AND P.nid="${nid}" 
              AND P.sceneId=${sceneId} 
              AND P.createTime>="${date}"
            LIMIT 1`;
        return connectionManager_1.default.getConnection(true)
            .query(sql);
    }
    async updateOne(params, updateParam) {
        return connectionManager_1.default.getConnection()
            .getRepository(PlatformControl_entity_1.PlatformControlEntity)
            .update(params, updateParam);
    }
    async deleteMany(where) {
        const sql = `DELETE 
        FROM Sp_PlatformControl AS P
        WHERE P.betGoldAmount=${where.betGoldAmount}
        AND P.record_type="${where.type}"
        AND P.createTime<"${(0, utils_1.cDate)(where.time)}"
        `;
        return connectionManager_1.default.getConnection()
            .query(sql);
    }
    async findOneByPlatform(platformId, type, startTime, endTime) {
        let sql = `SELECT * 
            FROM Sp_PlatformControl as P 
            WHERE P.record_type="${type}" 
              AND P.createTime>="${(0, utils_1.cDate)(startTime)}" 
              AND P.createTime<"${(0, utils_1.cDate)(endTime)}"`;
        if (platformId) {
            sql += ` AND P.platformId="${platformId}"`;
        }
        return connectionManager_1.default.getConnection(true)
            .query(sql);
    }
    getPlatformGameBill(where, startTime, endTime) {
        let sql = `SELECT SUM(P.profit) as profit, SUM(P.betGoldAmount) as betGoldAmount 
            FROM Sp_PlatformControl as P 
            WHERE P.platformId="${where.platformId}"
              AND P.record_type="${where.type}"
              AND P.createTime>="${(0, utils_1.cDate)(startTime)}" 
              AND P.createTime<"${(0, utils_1.cDate)(endTime)}"`;
        if (where.nid) {
            sql += ` AND P.nid="${where.nid}"`;
        }
        if (where.tenantId) {
            sql += ` AND P.tenantId="${where.tenantId}"`;
        }
        return connectionManager_1.default.getConnection(true)
            .query(sql);
    }
    getPlatformByPlatformIdAndTime(where, startTime, endTime) {
        let sql = `SELECT *
            FROM Sp_PlatformControl as P 
            WHERE P.platformId="${where.platformId}"
              AND P.record_type="${where.type}"
              AND P.createTime>="${(0, utils_1.cDate)(startTime)}" 
              AND P.createTime<"${(0, utils_1.cDate)(endTime)}"`;
        if (where.nid) {
            sql += ` AND P.nid="${where.nid}"`;
        }
        if (where.tenantId) {
            sql += ` AND P.tenantId="${where.tenantId}"`;
        }
        return connectionManager_1.default.getConnection(true)
            .query(sql);
    }
    async updateSummaryData(id, updateParams) {
        return connectionManager_1.default.getConnection()
            .getRepository(PlatformControl_entity_1.PlatformControlEntity)
            .update({ id }, updateParams);
    }
    async findList() {
        return [];
    }
    async findOne() {
        return null;
    }
    async delete() {
    }
}
exports.default = new PlatformControlMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Db250cm9sLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1BsYXRmb3JtQ29udHJvbC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBNkM7QUFDN0MsNEVBQXNFO0FBQ3RFLHNFQUErRDtBQUMvRCxzRUFBbUU7QUFDbkUsMENBQXFDO0FBSXJDLE1BQU0sdUJBQXdCLFNBQVMsMkJBQWtDO0lBQ3JFLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUztRQUNyQixNQUFNLFVBQVUsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsOENBQXFCLENBQUMsQ0FBQztRQUMxRixNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFTRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBaUIsRUFBRSxVQUFrQixFQUFFLEdBQVcsRUFBRSxPQUFlO1FBQ3RGLE1BQU0sSUFBSSxHQUFHLElBQUEsYUFBSyxFQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDeEUsTUFBTSxHQUFHLEdBQUc7O2tDQUVjLFVBQVU7bUNBQ1QsSUFBSTsyQkFDWixHQUFHOzhCQUNBLE9BQU87bUNBQ0YsSUFBSTtvQkFDbkIsQ0FBQztRQUdiLE9BQU8sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQzthQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQVNELEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxVQUFrQixFQUFFLFFBQWdCLEVBQUUsR0FBVyxFQUFFLE9B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