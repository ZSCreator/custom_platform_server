import {AbstractDao} from "../ADao.abstract";
import {BonusPoolHistory} from "./entity/BonusPoolHistory.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

type findParams = {
    id?: number,
    nid?: string,
    gameName?: string;
    sceneId?: number;
    sceneName?: string;
    bonus_amount?: number;
    control_amount?: number;
    profit_amount?: number;
    createDateTime?: Date;
    updateDateTime?: Date;
};

/**``
 * MD5 信息摘要
 * @param str
 * @return {PromiseLike<String>} MD5 16进制编码
 */
const signMD5 = (str): string => require('crypto').createHash('md5').update(str).digest('hex');
/**
 * 返回长度为8的随机字符串
 * @return {string}
 */
const randomString = () => Math.random().toString(36).substr(2, 8);


export class BonusPoolMysqlDao extends AbstractDao<BonusPoolHistory> {
    async findList(parameter: findParams): Promise<BonusPoolHistory[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: findParams): Promise<BonusPoolHistory> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: findParams): Promise<any> {
        try {
            const BonusPoolRepository = ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory);

            const p = BonusPoolRepository.create(parameter);
            return await BonusPoolRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: findParams, partialEntity: findParams): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {}): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit(page: number, limit: number): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory)
                .createQueryBuilder("BonusPoolHistory")
                // .where("BonusPoolHistory.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("BonusPoolHistory.id", "DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return {list, count};
        } catch (e) {
            return false;
        }
    }

    // status  = 0为未处理 1 为已处理
    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 , 0);
    async findListToLimitNoTime(page: number, limit: number, status: number): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory)
                .createQueryBuilder("BonusPoolHistory")
                .where("BonusPoolHistory.status = :status", {status: status})
                .orderBy("BonusPoolHistory.id", "DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return {list, count};
        } catch (e) {
            return false;
        }
    }

    /**
     * 查找最后一个参数
     * @param params
     */
    async findLastOneByParams(params: {
        nid: string,
        sceneId: number
    }) {
        // 时间降序
        return await ConnectionManager.getConnection()
            .getRepository(BonusPoolHistory)
            .createQueryBuilder('BonusPoolHistory')
            .orderBy('BonusPoolHistory.updateDateTime', 'DESC')
            .where("BonusPoolHistory. = :nid", { nid: params.nid })
            .andWhere("BonusPoolHistory. = :sceneId", { sceneId: params.sceneId })
            .getOne();
    }

    // status  = 0为未处理 1 为已处理
    //根据时间查询分页查询  倒序
    async findListToLimitStatus(status: number): Promise<any> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(BonusPoolHistory)
                .createQueryBuilder("BonusPoolHistory")
                .where("BonusPoolHistory.status = :status", {status: status})
                .getCount();
        } catch (e) {
            return 0;
        }
    }

    /**
     * 生成uuid
     */
    getUUID(): string {
        return signMD5(`${randomString()}${Date.now()}`);
    }
}

export default new BonusPoolMysqlDao();