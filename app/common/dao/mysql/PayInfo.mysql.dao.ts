import { AbstractDao } from "../ADao.abstract";
import { PayInfo } from "./entity/PayInfo.entity";
import ConnectionManager from "../mysql/lib/connectionManager";


type Parameter<T> = { [P in keyof T]?: T[P] };
class PayInfoMysqlDao extends AbstractDao<PayInfo> {
    async findList(parameter: Parameter<PayInfo>): Promise<PayInfo[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PayInfo)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter<PayInfo>): Promise<PayInfo> {
        try {
            const payInfo = await ConnectionManager.getConnection()
                .getRepository(PayInfo)
                .findOne(parameter);
            return payInfo;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: Parameter<PayInfo>): Promise<any> {
        try {
            const payInfoRepository = ConnectionManager.getConnection()
                .getRepository(PayInfo);

            const p = payInfoRepository.create(parameter);
            return await payInfoRepository.save(p);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async updateOne(parameter: Parameter<PayInfo>, partialEntity: Parameter<PayInfo>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PayInfo)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: Parameter<PayInfo>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PayInfo)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit(page: number, limit: number, startTime, endTime): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(PayInfo)
                .createQueryBuilder("PayInfo")
                .where("PayInfo.createDate BETWEEN :start AND :end", { start: startTime, end: endTime })
                .orderBy("PayInfo.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            console.error(`查询充值记录出错 ${e.stack}`)
            return false;
        }
    }

    async findListToLimitByUid(uid: string, page: number, limit: number, startTime, endTime): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(PayInfo)
                .createQueryBuilder("PayInfo")
                .where("PayInfo.fk_uid = :uid AND PayInfo.createDate BETWEEN :start AND :end", { uid, start: startTime, end: endTime })
                .orderBy("PayInfo.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            console.error(`查询充值记录出错 ${e.stack}`)
            return false;
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
    async todayAddTotal_fee(startTime, endTime): Promise<any> {
        try {
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
             GROUP BY agentName`;
            const result = await ConnectionManager.getConnection(true).query(sql);
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
     * in (${agentNameList.join(",")})
     */
    async todayAddTotal_fee_uid(groupRemarkList, startTime, endTime): Promise<any> {
        try {
            let list = [];
            groupRemarkList.forEach(x => {
                list.push(`"${x}"`)
            });
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
					 payInfo.fk_uid AS uid,
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
			AND  payInfo.groupRemark in (${list})
             GROUP BY agentName , uid`;
            const result = await ConnectionManager.getConnection(true).query(sql);
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
    async todayAddTotal_fee_groupRemark(groupRemark, startTime, endTime): Promise<any> {
        try {
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
			AND  payInfo.groupRemark = "${groupRemark}"
             GROUP BY agentName`;
            const result = await ConnectionManager.getConnection(true).query(sql);
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
    async distinctPlayer(startTime, endTime): Promise<any> {
        try {
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
                    IFNULL(payInfo.fk_uid,'无') AS uid,					
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
              GROUP BY agentName,uid`;


            const result = await ConnectionManager.getConnection(true).query(sql);
            return result;
        } catch (e) {
            return null;
        }
    }




}

export default new PayInfoMysqlDao();