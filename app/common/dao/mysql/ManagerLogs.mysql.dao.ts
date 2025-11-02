import { AbstractDao } from "../ADao.abstract";
import { ManagerLogs } from "./entity/ManagerLogs.entity";
import ConnectionManager from "../mysql/lib/connectionManager";
import {WalletRecord} from "./entity/WalletRecord.entity";

class ManagerLogsMysqlDao extends AbstractDao<ManagerLogs> {
    async findList(parameter: {id? : number ,mangerUserName? : string,requestIp? : string, requestName? : string, requestBody? : string, createDate? : Date}): Promise<ManagerLogs[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(ManagerLogs)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id? : number ,mangerUserName? : string,requestIp? : string, requestName? : string, requestBody? : string, createDate? : Date}): Promise<ManagerLogs> {
        try {
            const managerLogs = await ConnectionManager.getConnection()
                .getRepository(ManagerLogs)
                .findOne(parameter);
            return managerLogs;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,mangerUserName? : string,requestIp? : string, requestName? : string, requestBody? : string, createDate? : Date}): Promise<any> {
        try {
            const managerLogsRepository = ConnectionManager.getConnection()
                .getRepository(ManagerLogs);

            const p = managerLogsRepository.create(parameter);
            return await managerLogsRepository.save(p);
        } catch (e) {
            console.error("e...",e)
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,mangerUserName? : string,requestIp? : string, requestName? : string, requestBody? : string, createDate? : Date} , partialEntity :{id? : number ,mangerUserName? : string,requestIp? : string, requestName? : string, requestBody? : string, createDate? : Date} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ManagerLogs)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,mangerUserName? : string,requestIp? : string, requestName? : string, requestBody? : string, createDate? : Date}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ManagerLogs)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit( ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(ManagerLogs)
                .createQueryBuilder("ManagerLogs")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("ManagerLogs.id","DESC")
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    async getSelectWhereForLogs( where : string , page : number  ): Promise<any> {
        try {
            let selectCount =`COUNT(Sp_ManagerLogs.id) AS length`;
            let sql = `        
                SELECT
                  *
                FROM
                    Sp_ManagerLogs
                WHERE 
                    ${where} 
                `;
            let  sqlCount = `        
                SELECT
                    ${selectCount}
                FROM
                    Sp_ManagerLogs
                WHERE 
                    ${where} 
                `;

            let startLimit = (page - 1) * 20;
            sql = sql + `ORDER BY createDate DESC , id DESC
                         LIMIT ${startLimit} , ${20}`;
            //获取数据的sql语句
            const result = await ConnectionManager.getConnection(true)
                .query(sql);


            //获取长度的sql语句
            const countResult = await ConnectionManager.getConnection(true)
                .query(sqlCount);
            let count = 0 ;
            for(let key of countResult){
                count += Number(key.length);
            }
            return { list : result , count: count};

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
                .from(ManagerLogs)
                .where(`Sp_ManagerLogs.createDate < "${startTime}"` )
                .execute();
            return  list;
        } catch (e) {
            return false;
        }
    }


}

export default new ManagerLogsMysqlDao();