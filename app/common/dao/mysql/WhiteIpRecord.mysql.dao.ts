import { AbstractDao } from "../ADao.abstract";
import { WhiteIpRecord } from "./entity/WhiteIpRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";
import WhiteIpRecordRedisDao from "../redis/WhiteIpRecord.redis.dao";
class WhiteIpRecordMysqlDao extends AbstractDao<WhiteIpRecord> {
    async findList(parameter: {id?: number; ip?: string; account?: string; message?: string; createUser?: string; createDate?: Date;}): Promise<WhiteIpRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(WhiteIpRecord)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; ip?: string; account?: string; message?: string; createUser?: string; createDate?: Date;}): Promise<WhiteIpRecord> {
        try {
            const whiteIpRecord = await ConnectionManager.getConnection(true)
                .getRepository(WhiteIpRecord)
                .findOne(parameter);

            return whiteIpRecord;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; ip?: string; account?: string; message?: string; createUser?: string; createDate?: Date;}): Promise<any> {
        try {
            const whiteIpRecordRepository = ConnectionManager.getConnection()
                .getRepository(WhiteIpRecord);

            const p = whiteIpRecordRepository.create(parameter);
             await whiteIpRecordRepository.save(p);
            /**
             * 存入redis
             */
            // const whiteIp = await this.findOne({ip:parameter.ip});
            await WhiteIpRecordRedisDao.insertOne(parameter);
            return true;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; ip?: string; account?: string; message?: string; createUser?: string; createDate?: Date;} , partialEntity :{ id?: number; ip?: string; account?: string; message?: string; createUser?: string; createDate?: Date;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(WhiteIpRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; ip?: string; account?: string; message?: string; createUser?: string; createDate?: Date;}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(WhiteIpRecord)
                .delete(parameter);
            if(!!affected){
                /**
                 * 更新redis
                 */
                await WhiteIpRecordRedisDao.delete(parameter);
            }
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 );
    async findListToLimitNoTime(page : number , limit : number  ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(WhiteIpRecord)
                .createQueryBuilder("WhiteIpRecord")
                .orderBy("WhiteIpRecord.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    //根据所属人查询ip所属人
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 );
    async findListToLimitFromAccount(account : string  ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(WhiteIpRecord)
                .createQueryBuilder("WhiteIpRecord")
                .where("WhiteIpRecord.account = :account", { account: account })
                .orderBy("WhiteIpRecord.id","DESC")
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 );
    async findListToLimitFromUserName(page : number , limit : number ,manager : string ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(WhiteIpRecord)
                .createQueryBuilder("WhiteIpRecord")
                .where("WhiteIpRecord.createUser = :createUser", { createUser: manager })
                .orderBy("WhiteIpRecord.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }

}

export default new WhiteIpRecordMysqlDao();