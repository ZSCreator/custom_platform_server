import {AbstractDao} from "../ADao.abstract";
import {ScratchCardResult} from "./entity/ScratchCardResult.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

interface Parameter {
    id?: number;
    cardNum?: string;
    result?: string;
    rebate?: number;
    jackpotId?: number;
    status?: number;
}

class ScratchCardResultMysqlDao extends AbstractDao<ScratchCardResult> {
    async findList(parameter: Parameter): Promise<ScratchCardResult[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(ScratchCardResult)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter): Promise<ScratchCardResult> {
        try {
            const scratchCardResult = await ConnectionManager.getConnection()
                .getRepository(ScratchCardResult)
                .findOne(parameter);

            return scratchCardResult;
        } catch (e) {
            return null;
        }
    }

    /**
     * 随机查找一个未开奖的奖券
     */
    async randomFindOneNotLottery(jackpotId: number): Promise<ScratchCardResult> {
        const conn = ConnectionManager.getConnection();
        // const result = await conn.query(`SELECT * FROM Sys_ScratchCardResult WHERE id >= ((SELECT MAX(id) FROM Sys_ScratchCardResult)-(SELECT  MIN(id) FROM Sys_ScratchCardResult)) * RAND() + (SELECT MIN(id) FROM Sys_ScratchCardResult) AND status=0 AND jackpotId=${jackpotId} LIMIT 1`);
        // TODO 后续优化这个机制
        const result = await conn.query(`SELECT * FROM Sys_ScratchCardResult WHERE status=0 AND jackpotId=${jackpotId}`);
        return result.sort((a, b) => Math.random() - 0.5)[0];
    }

    async insertOne(parameter: Parameter): Promise<any> {
        try {
            const scratchCardResultRepository = ConnectionManager.getConnection()
                .getRepository(ScratchCardResult);

            const p = scratchCardResultRepository.create(parameter);
            return await scratchCardResultRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: Parameter, partialEntity: Parameter): Promise<any> {
        const {affected} = await ConnectionManager.getConnection()
            .getRepository(ScratchCardResult)
            .update(parameter, partialEntity);
        return !!affected;
    }

    async delete(parameter: Parameter): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(ScratchCardResult)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 , 0);
    async findListToLimitNoTime(page: number, limit: number): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection()
                .getRepository(ScratchCardResult)
                .createQueryBuilder("ScratchCardResult")
                .orderBy("ScratchCardResult.id", "DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            console.warn("result", result)
            return result;
        } catch (e) {
            return false;
        }
    }

    /**
     * 更新更多
     * @param parameter
     * @param partialEntity
     */
    async updateMany(parameter: Parameter, partialEntity: Parameter) {
        const scratchCardResult = await ConnectionManager.getConnection()
            .getRepository(ScratchCardResult)
            .update(parameter, partialEntity);
    }
}

export default new ScratchCardResultMysqlDao();