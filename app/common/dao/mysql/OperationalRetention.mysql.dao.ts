import { AbstractDao } from "../ADao.abstract";
import { OperationalRetention } from "./entity/OperationalRetention.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class OperationalRetentionMysqlDao extends AbstractDao<OperationalRetention> {
    async findList(parameter: {id? : number, agentName? : string, betPlayer? : any, addPlayer? : any, AddRmbPlayer? : any,allAddRmb? : number,secondNum? : number, threeNum? : number, sevenNum? : number,fifteenNum? : number, createDate? : Date}): Promise<OperationalRetention[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(OperationalRetention)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id? : number, agentName? : string, betPlayer? : any, addPlayer? : any, AddRmbPlayer? : any,allAddRmb? : number,secondNum? : number, threeNum? : number, sevenNum? : number,fifteenNum? : number, createDate? : Date}): Promise<OperationalRetention> {
        try {
            const operationalRetention = await ConnectionManager.getConnection(true)
                .getRepository(OperationalRetention)
                .findOne(parameter);
            return operationalRetention;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id? : number, agentName? : string, betPlayer? : any, addPlayer? : any, AddRmbPlayer? : any,allAddRmb? : number,secondNum? : number, threeNum? : number, sevenNum? : number,fifteenNum? : number, createDate? : Date }): Promise<any> {
        try {

            const mailRecordsRepository = ConnectionManager.getConnection()
                .getRepository(OperationalRetention);

            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number} , partialEntity :{  id? : number, agentName? : string, betPlayer? : any, addPlayer? : any, AddRmbPlayer? : any,allAddRmb? : number,secondNum? : number, threeNum? : number, sevenNum? : number,fifteenNum? : number, createDate? : Date } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(OperationalRetention)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(OperationalRetention)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    async insertMany(parameterList: Array<OperationalRetention>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(OperationalRetention)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`每日统计玩家当日推广数据 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }




    /**
     * 对某一个渠道下面所有代理进行数据的汇总
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async getOperationalRetentionList_AgentName(agentName: string , startTimeDate :string ,endTimeDate : string ) {
        try {
             const sql = `
              SELECT * 
              FROM Sp_OperationalRetention 
              WHERE Sp_OperationalRetention.createDate >= "${startTimeDate}"  
              AND  Sp_OperationalRetention.createDate < "${endTimeDate}"  
              AND Sp_OperationalRetention.agentName = "${agentName}"
            `;
            const result = await ConnectionManager
                .getConnection(true)
                .query(sql);

            return result;
        } catch (e) {
            console.error(e.stack);
            return [];
        }
    }





}

export default new OperationalRetentionMysqlDao();