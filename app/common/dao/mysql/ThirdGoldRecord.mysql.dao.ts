import { AbstractDao } from "../ADao.abstract";
import { ThirdGoldRecord } from "./entity/ThirdGoldRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";
import ThirdGoldRecordInRedisDao from "../redis/ThirdGoldRecord.redis.dao";

class ThirdGoldRecordMysqlDao extends AbstractDao<ThirdGoldRecord> {
    async findList(parameter: {id?: number; agentRemark? : string ; orderId?: string; type?: number; uid?: string;  change_before?: number;gold?: number; change_after?: number;status?: number;remark?: string;createDate?: Date;}): Promise<ThirdGoldRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(ThirdGoldRecord)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; agentRemark? : string ; orderId?: string; type?: number; uid?: string;  change_before?: number;gold?: number; change_after?: number;status?: number;remark?: string;createDate?: Date;}): Promise<ThirdGoldRecord> {
        try {
            const thirdGoldRecord = await ConnectionManager.getConnection()
                .getRepository(ThirdGoldRecord)
                .findOne(parameter);

            return thirdGoldRecord;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; agentRemark? : string ; orderId?: string; type?: number; uid?: string;  change_before?: number;gold?: number; change_after?: number;status?: number;remark?: string;createDate?: Date;}): Promise<any> {
        try {
            if(parameter.status && parameter.status == 0){
                /** step1 添加下分预警个数*/
                await ThirdGoldRecordInRedisDao.addLength({length : 1});
            }
            /** step2 mysql生成下分记录*/
            const thirdGoldRecordRepository = ConnectionManager.getConnection()
                .getRepository(ThirdGoldRecord);

            const p = thirdGoldRecordRepository.create(parameter);
            return await thirdGoldRecordRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; agentRemark? : string ; orderId?: string; type?: number; uid?: string;  change_before?: number;gold?: number; change_after?: number;status?: number;remark?: string;createDate?: Date;} , partialEntity :{ id?: number; agentRemark? : string ; orderId?: string; type?: number; uid?: string;  change_before?: number;gold?: number; change_after?: number;status?: number;remark?: string;createDate?: Date;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ThirdGoldRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; agentRemark? : string ; orderId?: string; type?: number; uid?: string;  change_before?: number;gold?: number; change_after?: number;status?: number;remark?: string;createDate?: Date;}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ThirdGoldRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }
    //根据时间查询分页查询  倒序
    async findOneForEesc(uid : string  ): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection(true)
                .getRepository(ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.uid = :uid" , {uid : uid })
                .orderBy("ThirdGoldRecord.id","DESC")
                .getOne();
            return  result;
        } catch (e) {
            return false;
        }
    }


    //查询状态为0
    async findListForStatus({}): Promise<any> {
        try {
            const count = await ConnectionManager.getConnection(true)
                .getRepository(ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.status = :status" , {status : '0'})
                .getCount();
            return  count;
        } catch (e) {
            return 0;
        }
    }


    //根据时间查询分页查询  倒序
    async findListToLimitNoTime(startTime : string , endTime : string,  page : number , limit : number  ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.createDateTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("ThirdGoldRecord.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }

    //根据uid 惊醒查询 最近得一条记录
    async findListForUid(uid : string ,page : number , limit : number): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.uid = :uid" , {uid : uid })
                .orderBy("ThirdGoldRecord.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    //查看平台给代理添加金币的记录
    async getPlatformToAgentGoldRecordList(agentList : any, managerAgent : string ,page : number , limit : number): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.type = :type" , {type : 2 })
                .andWhere("ThirdGoldRecord.agentRemark  IN (:...agentRemarks)", { agentRemarks: agentList })
                .orderBy("ThirdGoldRecord.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();

            return  {list ,count};
        } catch (e) {
            return false;
        }
    }




    //查看代理下面添加金币的记录
    async getAgentForPlayerGoldRecordList( where : string ,page : number , pageSize : number): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where(where)
                .skip((page - 1) * pageSize)
                .take( pageSize)
                .getManyAndCount();
            return  { list ,count};
        } catch (e) {
            console.warn(e )
            return false;
        }
    }




    //获游戏登陆报表时间段明细
    async PlayerLoginHourData(): Promise<any> {
        try {
            const list = await ConnectionManager.getConnection(true).query(`SELECT
                    DATE_FORMAT(createDateTime, '%H') as hour,	
                    COUNT(id) as id,	
                    Sum(gold) as loginGold
                    FROM Log_ThirdGoldRecord
                    where TO_DAYS(createDateTime) = TO_DAYS(NOW()) AND gold > 0
                    GROUP BY DATE_FORMAT(createDateTime,'%H')`);
            return  list;
        } catch (e) {
            return false;
        }
    }


    /**
     * 删除一段时间的数据
     */
    async deletData(startTime : string ): Promise<any> {
        try {
            const list = await ConnectionManager.getConnection()
                .createQueryBuilder()
                .delete()
                .from(ThirdGoldRecord)
                .where(`Log_ThirdGoldRecord.createDateTime < "${startTime}" AND Log_ThirdGoldRecord.status  IN  ('1', '3') ` )
                .execute();
            return  list;
        } catch (e) {
            return false;
        }
    }







}

export default new ThirdGoldRecordMysqlDao();