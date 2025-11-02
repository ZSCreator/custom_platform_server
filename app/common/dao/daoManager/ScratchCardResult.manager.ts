import ScratchCardResultMysqlDao from "../mysql/ScratchCardResult.mysql.dao";
import {ScratchCardResult} from "../mysql/entity/ScratchCardResult.entity";

type Parameter<T> = { [P in keyof T]?: T[P] };

export class ScratchCardResultManager {

    async findOne(parameter: Parameter<ScratchCardResult>): Promise<any> {
        // Step 1: 是否只读 Mysql 数据库;
        const ScratchCardResultOnMysql = await ScratchCardResultMysqlDao.findOne(parameter);
        let ScratchCardResult_ = {
            result: ScratchCardResultOnMysql.result.split(',').map(Number),
            cardNum: ScratchCardResultOnMysql.cardNum,
            rebate: ScratchCardResultOnMysql.rebate,
            jackpotId: ScratchCardResultOnMysql.jackpotId,
            status: ScratchCardResultOnMysql.status,
        }
        return ScratchCardResult_;
    }


    async updateOne(parameter: Parameter<ScratchCardResult>, partialEntity: Parameter<ScratchCardResult>): Promise<any> {
        await ScratchCardResultMysqlDao.updateOne(parameter, partialEntity);
        return true;

    }

    /**
     * 更新多个
     * @param parameter
     * @param partialEntity
     */
    async updateMany(parameter: Parameter<ScratchCardResult>, partialEntity: Parameter<ScratchCardResult>): Promise<any> {
        await ScratchCardResultMysqlDao.updateMany(parameter, partialEntity);
        return true;
    }

    /**
     * 获取一个未开奖奖券
     */
    async findOneNotLottery(jackpotId: number) {
        return ScratchCardResultMysqlDao.randomFindOneNotLottery(jackpotId);
    }

}

export default new ScratchCardResultManager();
