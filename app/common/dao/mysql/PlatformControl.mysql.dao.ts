import {AbstractDao} from "../ADao.abstract";
import {PlatformControlEntity} from "./entity/PlatformControl.entity";
import ConnectionManager from "../mysql/lib/connectionManager";
import {RecordTypes} from "../../../services/newControl/constants";
import {cDate} from "../../../utils";

type Parameter<T> = { [P in keyof T]?: T[P] };

class PlatformControlMysqlDao extends  AbstractDao<PlatformControlEntity> {
    async insertOne(parameter): Promise<any> {
        const repository = ConnectionManager.getConnection().getRepository(PlatformControlEntity);
        const p = repository.create(parameter);
        return await repository.save(p);
    }

    /**
     * 根据nid找场和房间
     * @param nid
     * @param sceneId
     * @param type 记录类型
     * @param platformId 平台号
     */
    async findOneBySceneId(type: RecordTypes, platformId: string, nid: string, sceneId: number) {
        const date = cDate(new Date(new Date().toLocaleDateString()).getTime());
        const sql = `SELECT * 
            FROM Sp_PlatformControl AS P 
            WHERE P.platformId="${platformId}" 
              AND P.record_type="${type}"
              AND P.nid="${nid}" 
              AND P.sceneId=${sceneId} 
              AND P.createTime>="${date}"
            LIMIT 1`;


        return ConnectionManager.getConnection(true)
            .query(sql);
    }

    /**
     * 根据nid找场和房间
     * @param nid
     * @param sceneId
     * @param tenantId 租户号
     * @param platformId 平台号
     */
    async findOneByTenantIdAndSceneId(platformId: string, tenantId: string, nid: string, sceneId: number) {
        const date = cDate(new Date(new Date().toLocaleDateString()).getTime());
        const sql = `SELECT * 
            FROM Sp_PlatformControl AS P 
            WHERE P.platformId="${platformId}" 
              AND P.tenantId="${tenantId}"
              AND P.record_type="${RecordTypes.TENANT_SCENE}"
              AND P.nid="${nid}" 
              AND P.sceneId=${sceneId} 
              AND P.createTime>="${date}"
            LIMIT 1`;


        return ConnectionManager.getConnection(true)
            .query(sql);
    }

    /**
     * 更新一个
     * @param params
     * @param updateParam
     */
    async updateOne(params: {type: RecordTypes, platformId: string, nid: string, sceneId: number}, updateParam: Parameter<PlatformControlEntity>) {
        return ConnectionManager.getConnection()
            .getRepository(PlatformControlEntity)
            .update(params, updateParam);
    }

    async deleteMany(where: {betGoldAmount: number, type: RecordTypes, time: number}) {
        const sql = `DELETE 
        FROM Sp_PlatformControl AS P
        WHERE P.betGoldAmount=${where.betGoldAmount}
        AND P.record_type="${where.type}"
        AND P.createTime<"${cDate(where.time)}"
        `;

        return ConnectionManager.getConnection()
            .query(sql);
    }

    /**
     * 查找
     * @param platformId
     * @param type
     * @param startTime
     * @param endTime
     */
    async findOneByPlatform(platformId: string, type: RecordTypes, startTime: number, endTime: number) {
        let sql = `SELECT * 
            FROM Sp_PlatformControl as P 
            WHERE P.record_type="${type}" 
              AND P.createTime>="${cDate(startTime)}" 
              AND P.createTime<"${cDate(endTime)}"`;

        if (platformId) {
            sql += ` AND P.platformId="${platformId}"`;
        }

        return ConnectionManager.getConnection(true)
            .query(sql);
    }


    /**
     * 获取平台游戏的打码量以及输赢情况
     * @param where
     * @param startTime
     * @param endTime
     */
    getPlatformGameBill(where: {type: RecordTypes, platformId: string, tenantId?: string, nid?: string}, startTime: number, endTime: number) {
        let sql = `SELECT SUM(P.profit) as profit, SUM(P.betGoldAmount) as betGoldAmount 
            FROM Sp_PlatformControl as P 
            WHERE P.platformId="${where.platformId}"
              AND P.record_type="${where.type}"
              AND P.createTime>="${cDate(startTime)}" 
              AND P.createTime<"${cDate(endTime)}"`;
        if (where.nid) {
            sql += ` AND P.nid="${where.nid}"`;
        }

        if (where.tenantId) {
            sql += ` AND P.tenantId="${where.tenantId}"`;
        }

        return ConnectionManager.getConnection(true)
            .query(sql);
    }

    /**
     * 通过平台id获取列表
     * @param where
     * @param startTime
     * @param endTime
     */
    getPlatformByPlatformIdAndTime(where: {type: RecordTypes, platformId: string, tenantId?: string, nid?: string}, startTime: number, endTime: number) {
        let sql = `SELECT *
            FROM Sp_PlatformControl as P 
            WHERE P.platformId="${where.platformId}"
              AND P.record_type="${where.type}"
              AND P.createTime>="${cDate(startTime)}" 
              AND P.createTime<"${cDate(endTime)}"`;
        if (where.nid) {
            sql += ` AND P.nid="${where.nid}"`;
        }

        if (where.tenantId) {
            sql += ` AND P.tenantId="${where.tenantId}"`;
        }

        return ConnectionManager.getConnection(true)
            .query(sql);
    }


    /**
     * 更新汇总数据
     * @param id
     * @param updateParams
     */
    async updateSummaryData(id: number, updateParams:  Parameter<PlatformControlEntity>) {
        return ConnectionManager.getConnection()
            .getRepository(PlatformControlEntity)
            .update({id}, updateParams);
    }

    // async


    async findList() {
        return [];
    }

    async findOne() {
        return null;
    }


    async delete() {

    }
}

export default new PlatformControlMysqlDao();