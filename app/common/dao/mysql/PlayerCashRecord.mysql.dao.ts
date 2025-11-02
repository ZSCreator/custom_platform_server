import { AbstractDao } from "../ADao.abstract";
import { PlayerCashRecord } from "./entity/PlayerCashRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

type IPlayerCashRecord= { id?: number; orderNo?: string; groupRemark?: string; uid?: string; bankCardNo?: string; bankName?: string;
              ifscCode?: string, email?: string; bankUserName?: string; allCash?: number; allAddRmb?: number; type?: number;
              money?: number; checkName?: string; orderStatus?: number; cashStatus?: number; startGold?: number;
              remittance?: string; lastGold?: number; rebateGold?: number; payAccountName?: string; payFlag?: boolean; content?: string;
              flowCount?: number;   createDate?: Date;}

export class PlayerCashMysqlDao extends AbstractDao<PlayerCashRecord> {
    async findList(parameter: IPlayerCashRecord): Promise<PlayerCashRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PlayerCashRecord)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: IPlayerCashRecord): Promise<PlayerCashRecord> {
        try {
            const playerCashRecord = await ConnectionManager.getConnection()
                .getRepository(PlayerCashRecord)
                .findOne(parameter);

            return playerCashRecord;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: IPlayerCashRecord, partialEntity: IPlayerCashRecord): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerCashRecord)
                .update(parameter, partialEntity);

            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: IPlayerCashRecord): Promise<any> {
        try {
            const playerRepository = ConnectionManager.getConnection()
                .getRepository(PlayerCashRecord);

            const p = playerRepository.create(parameter);

            return await playerRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: IPlayerCashRecord): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerCashRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    /** 前端根据Uid获取玩家的提现订单 */
    async findManyAndCountForOrderStatusToUid(uid:string, page: number, pageSize: number = 20) {
        try {

            const list = await ConnectionManager.getConnection(true)
                .getRepository(PlayerCashRecord)
                .createQueryBuilder("PlayerCashRecord")
                .select(["PlayerCashRecord.orderNo", "PlayerCashRecord.money", "PlayerCashRecord.createDate", "PlayerCashRecord.orderStatus", "PlayerCashRecord.cashStatus"])
                .where(`PlayerCashRecord.uid = ${uid}`)
                .skip((page - 1) * pageSize)
                .take(page * pageSize)
                .orderBy("PlayerCashRecord.id", "DESC")
                .getMany();
            return list ;
        } catch (e) {
            return [] ;
        }
    }




    /**
     * 增加代理的金币额度 针对 http 上分处
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async selectWhere(where: string, page : number , pageSize : number) {
        try {

            if(!where){
                return {list:[] , count : 0};
            }

            let startLimit = (page - 1) * pageSize;
            let selectCount =`COUNT(Sp_PlayerCashRecord.id) AS length`;
            let sql = `
               SELECT * From Sp_PlayerCashRecord WHERE ${where}
            `;
            sql = sql + `ORDER BY id DESC
                         LIMIT ${startLimit} , ${pageSize}`;
            let sqlCount = `        
                SELECT
                    ${selectCount}
                FROM
                    Sp_PlayerCashRecord
                WHERE 
                    ${where} 
                `;
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
            console.error(e.stack);
            return {list:[] , count : 0};
        }
    }



    /**
     * 获取当天渠道下面的充值金额  total_fee
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayAddTixian(startTime , endTime): Promise<any> {
        try {
            const sql = `SELECT
                    IFNULL(cashRecord.groupRemark,'无') AS agentName,					
                    IFNULL(SUM(cashRecord.money),0) AS todayTixian
            FROM
                    Sp_PlayerCashRecord AS cashRecord
            WHERE           
                 cashRecord.createDate >= "${startTime}"
                 AND cashRecord.createDate < "${endTime}"
                 AND cashRecord.cashStatus = 1
              GROUP BY agentName`;
            const result =  await ConnectionManager.getConnection(true).query(sql);
            return result;
        } catch (e) {
            return null;
        }
    }


    /**
     * 获取当天渠道下面的充值金额  total_fee
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayAddTixian_uid(groupRemarkList: string[] ,startTime , endTime): Promise<any> {
        try {
            let list = [];
            groupRemarkList.forEach(x=>{
                list.push(`"${x}"`)
            });
            const sql = `SELECT
                    IFNULL(cashRecord.groupRemark,'无') AS agentName,					
                    IFNULL(cashRecord.uid,'无') AS uid
            FROM
                    Sp_PlayerCashRecord AS cashRecord
            WHERE           
                 cashRecord.createDate >= "${startTime}"
                 AND cashRecord.createDate < "${endTime}"
                 AND cashRecord.cashStatus = 1
                 AND cashRecord.groupRemark IN (${list})
              GROUP BY agentName , uid`;
            const result =  await ConnectionManager.getConnection(true).query(sql);
            return result;
        } catch (e) {
            return null;
        }
    }



    /**
     * 获取当天渠道下面的充值金额  total_fee
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayAddTixian_groupRemark(groupRemark , startTime , endTime): Promise<any> {
        try {
            const sql = `SELECT
                    IFNULL(cashRecord.groupRemark,'无') AS agentName,					
                    IFNULL(SUM(cashRecord.money),0) AS todayTixian
            FROM
                    Sp_PlayerCashRecord AS cashRecord
            WHERE           
                 cashRecord.createDate >= "${startTime}"
                 AND cashRecord.createDate < "${endTime}"
                 AND cashRecord.groupRemark = "${groupRemark}"
                 AND cashRecord.cashStatus = 1
              GROUP BY agentName`;
            const result =  await ConnectionManager.getConnection(true).query(sql);
            return result;
        } catch (e) {
            return null;
        }
    }


}

export default new PlayerCashMysqlDao();
